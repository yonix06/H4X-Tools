"""
Wazuh HIDS (Host-based Intrusion Detection System) and SIEM for security monitoring.
"""

import os
import json
import time
import subprocess
import re
from datetime import datetime
from helper import printer, timer
from colorama import Style

class WazuhController:
    """
    Interface with Wazuh HIDS (Host-based Intrusion Detection System) and SIEM for security monitoring.

    This tool requires Wazuh agent and manager to be installed on the system.
    - For Linux: apt-get install wazuh-agent wazuh-manager
    - For advanced configurations, manual setup is recommended

    :param api_url: URL of the Wazuh API (default: https://127.0.0.1:55000)
    :param api_user: Username for the Wazuh API (default: wazuh)
    :param api_pass: Password for the Wazuh API (default: wazuh)
    """
    @timer.timer
    def __init__(self, api_url='https://127.0.0.1:55000', api_user='wazuh', api_pass='wazuh') -> None:
        self.results = {
            'status': 'initialized',
            'alerts': [],
            'stats': {},
            'errors': [],
            'timestamp': datetime.now().isoformat()
        }

        self.api_url = api_url
        self.api_user = api_user
        self.api_pass = api_pass

        # Check if Wazuh is installed
        if not self._check_wazuh_installed():
            printer.error("Wazuh is not installed or not in PATH")
            self.results['status'] = 'error'
            self.results['errors'].append('Wazuh is not installed or not in PATH')
            return

        # Initialize status
        self.results['status'] = 'ready'
        printer.info(f"Wazuh controller initialized. Ready to fetch alerts from {Style.BRIGHT}{self.api_url}{Style.RESET_ALL}")

    def _check_wazuh_installed(self) -> bool:
        """Check if Wazuh is installed on the system"""
        try:
            subprocess.run(["wazuh-control", "status"], capture_output=True, text=True, check=False)
            return True
        except FileNotFoundError:
            return False

    def start_analysis(self, duration=60) -> dict:
        """
        Start fetching Wazuh alerts from the API

        :param duration: Analysis duration in seconds (default: 60)
        :return: Dictionary with analysis results
        """
        if self.results['status'] == 'error':
            return self.results

        self.results['status'] = 'analyzing'
        printer.info(f"Starting Wazuh alert analysis for {duration} seconds")

        try:
            start_time = time.time()
            alerts = []

            # Fetch alerts from Wazuh API (replace with actual API call)
            # Example: curl -u wazuh:wazuh https://127.0.0.1:55000/alerts?pretty
            cmd = ["curl", "-u", f"{self.api_user}:{self.api_pass}", f"{self.api_url}/alerts?pretty"]
            process = subprocess.run(cmd, capture_output=True, text=True, check=False)
            
            if process.returncode == 0:
                try:
                    data = json.loads(process.stdout)
                    if 'data' in data and 'items' in data['data']:
                        alerts = data['data']['items']
                except json.JSONDecodeError:
                    printer.error("Error decoding Wazuh API response")
                    self.results['errors'].append("Error decoding Wazuh API response")
            else:
                printer.error(f"Error fetching alerts from Wazuh API: {process.stderr}")
                self.results['errors'].append(f"Error fetching alerts from Wazuh API: {process.stderr}")

            # Process and parse results
            self.results['alerts'] = self._parse_alerts(alerts)
            self.results['stats'] = self._parse_stats(alerts)
            
            self.results['status'] = 'completed'
            self.results['duration'] = time.time() - start_time
            self.results['timestamp'] = datetime.now().isoformat()

            printer.success(f"Wazuh alert analysis completed. Detected {len(self.results['alerts'])} alerts.")

        except Exception as e:
            printer.error(f"Error during Wazuh alert analysis: {e}")
            self.results['status'] = 'error'
            self.results['errors'].append(str(e))

        return self.results

    def _parse_alerts(self, alert_lines) -> list:
        """Parse Wazuh alert lines into structured data"""
        parsed_alerts = []

        for alert in alert_lines:
            # Example alert format (from Wazuh API):
            # {'rule': {'level': 7, 'description': 'Web server 404 error'}, 'agent': {'ip': '192.168.1.1'}}
            try:
                level = alert['rule']['level'] if 'rule' in alert and 'level' in alert['rule'] else "Unknown"
                description = alert['rule']['description'] if 'rule' in alert and 'description' in alert['rule'] else "Unknown"
                src_ip = alert['agent']['ip'] if 'agent' in alert and 'ip' in alert['agent'] else "Unknown"

                parsed_alerts.append({
                    'level': level,
                    'description': description,
                    'src_ip': src_ip,
                    'raw': alert
                })
            except Exception:
                printer.error(f"Error parsing alert: {alert}")

        return parsed_alerts

    def _parse_stats(self, alert_lines) -> dict:
        """Parse Wazuh statistics from alert lines"""
        stats = {
            'total_alerts': len(alert_lines),
            'high_severity': 0,
            'medium_severity': 0,
            'low_severity': 0
        }

        for alert in self.results['alerts']:
            try:
                level = int(alert['level'])
                if level >= 7:
                    stats['high_severity'] += 1
                elif level >= 4:
                    stats['medium_severity'] += 1
                else:
                    stats['low_severity'] += 1
            except Exception:
                pass

        return stats

    def get_results(self) -> dict:
        """Get the current results"""
        return self.results

    def to_json(self) -> str:
        """Convert results to JSON string"""
        return json.dumps(self.results, indent=2)

if __name__ == '__main__':
    # Example usage
    wazuh = WazuhController()
    results = wazuh.start_analysis(duration=10)
    print(json.dumps(results, indent=4))
