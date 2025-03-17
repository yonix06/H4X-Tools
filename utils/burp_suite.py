"""
Burp Suite controller.
"""

import os
import json
import time
import subprocess
import re
from datetime import datetime
from helper import printer, timer
from colorama import Style

class BurpController:
    """
    Interface with Burp Suite for web application security testing.

    This tool requires Burp Suite to be installed on the system.
    - Download from: https://portswigger.net/burp
    - For advanced configurations, manual setup is recommended

    :param target_url: URL of the web application to test (default: None)
    :param burp_path: Path to the Burp Suite JAR file (default: /opt/burpsuite/burpsuite_pro.jar)
    """
    @timer.timer
    def __init__(self, target_url=None, burp_path='/opt/burpsuite/burpsuite_pro.jar') -> None:
        self.results = {
            'status': 'initialized',
            'alerts': [],
            'stats': {},
            'errors': [],
            'timestamp': datetime.now().isoformat()
        }

        self.target_url = target_url
        self.burp_path = burp_path

        # Check if Burp Suite is installed
        if not self._check_burp_installed():
            printer.error("Burp Suite is not installed or not in PATH")
            self.results['status'] = 'error'
            self.results['errors'].append('Burp Suite is not installed or not in PATH')
            return

        # Initialize status
        self.results['status'] = 'ready'
        printer.info(f"Burp Suite controller initialized. Ready to test {Style.BRIGHT}{self.target_url}{Style.RESET_ALL}")

    def _check_burp_installed(self) -> bool:
        """Check if Burp Suite is installed on the system"""
        try:
            subprocess.run(["java", "-jar", self.burp_path, "--version"], capture_output=True, text=True, check=False)
            return True
        except FileNotFoundError:
            return False

    def start_scan(self) -> dict:
        """
        Start an automated scan of the target URL using Burp Suite

        :return: Dictionary with scan results
        """
        if self.results['status'] == 'error':
            return self.results

        if not self.target_url:
            printer.error("No target URL specified")
            self.results['status'] = 'error'
            self.results['errors'].append("No target URL specified")
            return self.results

        self.results['status'] = 'scanning'
        printer.info(f"Starting Burp Suite scan on {Style.BRIGHT}{self.target_url}{Style.RESET_ALL}")

        try:
            # Build Burp Suite command
            cmd = ["java", "-jar", self.burp_path, "--url", self.target_url]

            # Log the command
            printer.info(f"Running command: {' '.join(cmd)}")

            # Start process with timeout
            start_time = time.time()
            process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            output, error = process.communicate()

            self.results['status'] = 'completed'
            self.results['duration'] = time.time() - start_time
            self.results['timestamp'] = datetime.now().isoformat()

            # Process and parse results
            self.results['alerts'] = self._parse_alerts(output)

            printer.success(f"Burp Suite scan completed. Detected {len(self.results['alerts'])} alerts.")

        except Exception as e:
            printer.error(f"Error during Burp Suite scan: {e}")
            self.results['status'] = 'error'
            self.results['errors'].append(str(e))

        return self.results

    def _parse_alerts(self, burp_output) -> list:
        """Parse Burp Suite output and extract alerts"""
        alerts = []
        # Example alert format (this will vary depending on Burp Suite configuration)
        # Implement parsing logic here based on the Burp Suite output format
        return alerts

    def get_results(self) -> dict:
        """Get the current results"""
        return self.results

    def to_json(self) -> str:
        """Convert results to JSON string"""
        return json.dumps(self.results, indent=2)

if __name__ == '__main__':
    # Example usage
    burp = BurpController(target_url="http://www.example.com")
    results = burp.start_scan()
    print(json.dumps(results, indent=4))
