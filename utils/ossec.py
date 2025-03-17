"""
OSSEC HIDS (Host-based Intrusion Detection System) for log analysis.
"""

import os
import json
import time
import subprocess
import re
from datetime import datetime
from helper import printer, timer
from colorama import Style

class OSSECController:
    """
    Interface with OSSEC HIDS (Host-based Intrusion Detection System) for log analysis.

    This tool requires OSSEC to be installed on the system.
    - For Linux: apt-get install ossec-hids
    - For advanced configurations, manual setup is recommended

    :param config_file: Path to OSSEC configuration file (default: /var/ossec/etc/ossec.conf)
    :param log_file: Path to OSSEC log file (default: /var/ossec/logs/alerts/alerts.log)
    """
    @timer.timer
    def __init__(self, config_file='/var/ossec/etc/ossec.conf', log_file='/var/ossec/logs/alerts/alerts.log') -> None:
        self.results = {
            'status': 'initialized',
            'alerts': [],
            'stats': {},
            'errors': [],
            'timestamp': datetime.now().isoformat()
        }

        self.config_file = config_file
        self.log_file = log_file

        # Check if OSSEC is installed
        if not self._check_ossec_installed():
            printer.error("OSSEC is not installed or not in PATH")
            self.results['status'] = 'error'
            self.results['errors'].append('OSSEC is not installed or not in PATH')
            return

        # Initialize status
        self.results['status'] = 'ready'
        printer.info(f"OSSEC controller initialized. Ready to analyze logs from {Style.BRIGHT}{self.log_file}{Style.RESET_ALL}")

    def _check_ossec_installed(self) -> bool:
        """Check if OSSEC is installed on the system"""
        try:
            subprocess.run(["ossec-control", "status"], capture_output=True, text=True, check=False)
            return True
        except FileNotFoundError:
            return False

    def start_analysis(self, duration=60) -> dict:
        """
        Start analyzing OSSEC logs for alerts

        :param duration: Analysis duration in seconds (default: 60)
        :return: Dictionary with analysis results
        """
        if self.results['status'] == 'error':
            return self.results

        self.results['status'] = 'analyzing'
        printer.info(f"Starting OSSEC log analysis for {duration} seconds")

        try:
            start_time = time.time()
            alerts = []
            
            # Read log file and extract alerts
            with open(self.log_file, 'r') as f:
                for line in f:
                    if "OSSEC" in line:
                        alerts.append(line.strip())

            # Process and parse results
            self.results['alerts'] = self._parse_alerts(alerts)
            self.results['stats'] = self._parse_stats(alerts)
            
            self.results['status'] = 'completed'
            self.results['duration'] = time.time() - start_time
            self.results['timestamp'] = datetime.now().isoformat()

            printer.success(f"OSSEC log analysis completed. Detected {len(self.results['alerts'])} alerts.")

        except Exception as e:
            printer.error(f"Error during OSSEC log analysis: {e}")
            self.results['status'] = 'error'
            self.results['errors'].append(str(e))

        return self.results

    def _parse_alerts(self, alert_lines) -> list:
        """Parse OSSEC alert lines into structured data"""
        parsed_alerts = []

        for line in alert_lines:
            # Example alert format:
            # OSSEC HIDS alert level 7: ... Rule: 1000 - ... Src IP: 192.168.1.1 ...
            try:
                parts = line.split(":")
                if len(parts) > 1:
                    level = parts[0].split("level ")[1].strip() if "level" in parts[0] else "Unknown"
                    rule = parts[1].split("Rule: ")[1].split(" -")[0].strip() if "Rule:" in parts[1] else "Unknown"
                    src_ip = parts[-1].split("Src IP: ")[1].split(" ")[0].strip() if "Src IP:" in parts[-1] else "Unknown"
                    description = parts[1].split("Rule: ")[0].strip() if "Rule:" in parts[1] else parts[1].strip()

                    parsed_alerts.append({
                        'level': level,
                        'rule': rule,
                        'src_ip': src_ip,
                        'description': description,
                        'raw': line
                    })
            except Exception:
                printer.error(f"Error parsing alert line: {line}")

        return parsed_alerts

    def _parse_stats(self, alert_lines) -> dict:
        """Parse OSSEC statistics from alert lines"""
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
    ossec = OSSECController()
    results = ossec.start_analysis(duration=10)
    print(json.dumps(results, indent=4))
