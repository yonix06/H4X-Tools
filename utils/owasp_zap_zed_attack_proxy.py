"""
OWASP ZAP (Zed Attack Proxy) controller.
"""

import os
import json
import time
import subprocess
import re
from datetime import datetime
from helper import printer, timer
from colorama import Style

class ZapController:
    """
    Interface with OWASP ZAP (Zed Attack Proxy) for web application security testing.

    This tool requires OWASP ZAP to be installed on the system.
    - Download from: https://www.zaproxy.org/download/
    - For advanced configurations, manual setup is recommended

    :param target_url: URL of the web application to test (default: None)
    :param zap_path: Path to the ZAP installation directory (default: /opt/zaproxy)
    """
    @timer.timer
    def __init__(self, target_url=None, zap_path='/opt/zaproxy') -> None:
        self.results = {
            'status': 'initialized',
            'alerts': [],
            'stats': {},
            'errors': [],
            'timestamp': datetime.now().isoformat()
        }

        self.target_url = target_url
        self.zap_path = zap_path

        # Check if ZAP is installed
        if not self._check_zap_installed():
            printer.error("OWASP ZAP is not installed or not in PATH")
            self.results['status'] = 'error'
            self.results['errors'].append('OWASP ZAP is not installed or not in PATH')
            return

        # Initialize status
        self.results['status'] = 'ready'
        printer.info(f"OWASP ZAP controller initialized. Ready to test {Style.BRIGHT}{self.target_url}{Style.RESET_ALL}")

    def _check_zap_installed(self) -> bool:
        """Check if ZAP is installed on the system"""
        try:
            subprocess.run([os.path.join(self.zap_path, "zap.sh"), "-version"], capture_output=True, text=True, check=False)
            return True
        except FileNotFoundError:
            return False

    def start_scan(self) -> dict:
        """
        Start an automated scan of the target URL using ZAP

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
        printer.info(f"Starting OWASP ZAP scan on {Style.BRIGHT}{self.target_url}{Style.RESET_ALL}")

        try:
            # Build ZAP command
            cmd = [os.path.join(self.zap_path, "zap.sh"), "-cmd", "quickurl", "-quickurl", self.target_url, "-quickprogress"]

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

            printer.success(f"OWASP ZAP scan completed. Detected {len(self.results['alerts'])} alerts.")

        except Exception as e:
            printer.error(f"Error during OWASP ZAP scan: {e}")
            self.results['status'] = 'error'
            self.results['errors'].append(str(e))

        return self.results

    def _parse_alerts(self, zap_output) -> list:
        """Parse ZAP output and extract alerts"""
        alerts = []
        # Example alert format (this will vary depending on ZAP configuration)
        # Implement parsing logic here based on the ZAP output format
        return alerts

    def get_results(self) -> dict:
        """Get the current results"""
        return self.results

    def to_json(self) -> str:
        """Convert results to JSON string"""
        return json.dumps(self.results, indent=2)

if __name__ == '__main__':
    # Example usage
    zap = ZapController(target_url="http://www.example.com")
    results = zap.start_scan()
    print(json.dumps(results, indent=4))
