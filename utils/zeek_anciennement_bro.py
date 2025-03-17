"""
Zeek (formerly Bro) IDS for network traffic analysis.
"""

import os
import json
import time
import subprocess
import re
from datetime import datetime
from helper import printer, timer
from colorama import Style

class ZeekController:
    """
    Interface with Zeek (formerly Bro) IDS for network traffic analysis.

    This tool requires Zeek to be installed on the system.
    - For Linux: apt-get install zeek
    - For advanced configurations, manual setup is recommended

    :param interface: Network interface to monitor (default: auto-detect)
    :param log_dir: Path to Zeek log directory (default: /opt/zeek/logs/current)
    """
    @timer.timer
    def __init__(self, interface=None, log_dir='/opt/zeek/logs/current') -> None:
        self.results = {
            'status': 'initialized',
            'alerts': [],
            'stats': {},
            'errors': [],
            'timestamp': datetime.now().isoformat()
        }

        self.interface = interface
        self.log_dir = log_dir

        # Check if Zeek is installed
        if not self._check_zeek_installed():
            printer.error("Zeek is not installed or not in PATH")
            self.results['status'] = 'error'
            self.results['errors'].append('Zeek is not installed or not in PATH')
            return

        # Initialize status
        self.results['status'] = 'ready'
        printer.info(f"Zeek controller initialized. Ready to analyze logs from {Style.BRIGHT}{self.log_dir}{Style.RESET_ALL}")

    def _check_zeek_installed(self) -> bool:
        """Check if Zeek is installed on the system"""
        try:
            subprocess.run(["zeek", "--version"], capture_output=True, text=True, check=False)
            return True
        except FileNotFoundError:
            return False

    def start_analysis(self, duration=60) -> dict:
        """
        Start analyzing Zeek logs for alerts

        :param duration: Analysis duration in seconds (default: 60)
        :return: Dictionary with analysis results
        """
        if self.results['status'] == 'error':
            return self.results

        self.results['status'] = 'analyzing'
        printer.info(f"Starting Zeek log analysis for {duration} seconds")

        try:
            start_time = time.time()
            alerts = []
            
            # Analyze Zeek logs (conn.log, notice.log, etc.)
            log_files = [f for f in os.listdir(self.log_dir) if f.endswith(".log")]
            for log_file in log_files:
                log_path = os.path.join(self.log_dir, log_file)
                with open(log_path, 'r') as f:
                    for line in f:
                        if "#close" not in line and "#fields" not in line and not line.startswith("#"):
                            alerts.append(line.strip())

            # Process and parse results
            self.results['alerts'] = self._parse_alerts(alerts)
            self.results['stats'] = self._parse_stats(alerts)
            
            self.results['status'] = 'completed'
            self.results['duration'] = time.time() - start_time
            self.results['timestamp'] = datetime.now().isoformat()

            printer.success(f"Zeek log analysis completed. Detected {len(self.results['alerts'])} alerts.")

        except Exception as e:
            printer.error(f"Error during Zeek log analysis: {e}")
            self.results['status'] = 'error'
            self.results['errors'].append(str(e))

        return self.results

    def _parse_alerts(self, alert_lines) -> list:
        """Parse Zeek alert lines into structured data"""
        parsed_alerts = []

        for line in alert_lines:
            # Example conn.log format:
            # 1678886400.123456  CBrQ9s2X9v8   192.168.1.1  12345  10.0.0.1  80  tcp ...
            try:
                parts = line.split("\t")
                if len(parts) > 8:
                    ts = parts[0]
                    uid = parts[1]
                    src_ip = parts[2]
                    src_port = parts[3]
                    dst_ip = parts[4]
                    dst_port = parts[5]
                    proto = parts[6]
                    
                    parsed_alerts.append({
                        'timestamp': ts,
                        'uid': uid,
                        'src_ip': src_ip,
                        'src_port': src_port,
                        'dst_ip': dst_ip,
                        'dst_port': dst_port,
                        'protocol': proto,
                        'raw': line
                    })
            except Exception:
                printer.error(f"Error parsing alert line: {line}")

        return parsed_alerts

    def _parse_stats(self, alert_lines) -> dict:
        """Parse Zeek statistics from alert lines"""
        stats = {
            'total_connections': len(alert_lines),
            'tcp_connections': 0,
            'udp_connections': 0,
            'icmp_connections': 0
        }

        for alert in self.results['alerts']:
            try:
                if alert['protocol'] == "tcp":
                    stats['tcp_connections'] += 1
                elif alert['protocol'] == "udp":
                    stats['udp_connections'] += 1
                elif alert['protocol'] == "icmp":
                    stats['icmp_connections'] += 1
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
    zeek = ZeekController(interface='eth0')  # Replace with your network interface
    results = zeek.start_analysis(duration=10)
    print(json.dumps(results, indent=4))
