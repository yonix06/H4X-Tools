"""
Nessus vulnerability scanner controller.
"""

import os
import json
import time
import subprocess
import re
from datetime import datetime
from helper import printer, timer
from colorama import Style

class NessusController:
    """
    Interface with Nessus vulnerability scanner for identifying security vulnerabilities.

    This tool requires Nessus to be installed and configured on the system.
    - Download from: https://www.tenable.com/downloads/nessus
    - For advanced configurations, manual setup is recommended

    :param target_url: URL or IP address of the target to scan (default: None)
    :param nessus_cli_path: Path to the Nessus command-line interface (default: /opt/nessus/bin/nessus)
    """
    @timer.timer
    def __init__(self, target_url=None, nessus_cli_path='/opt/nessus/bin/nessus') -> None:
        self.results = {
            'status': 'initialized',
            'vulnerabilities': [],
            'stats': {},
            'errors': [],
            'timestamp': datetime.now().isoformat()
        }

        self.target_url = target_url
        self.nessus_cli_path = nessus_cli_path

        # Check if Nessus is installed
        if not self._check_nessus_installed():
            printer.error("Nessus is not installed or not in PATH")
            self.results['status'] = 'error'
            self.results['errors'].append('Nessus is not installed or not in PATH')
            return

        # Initialize status
        self.results['status'] = 'ready'
        printer.info(f"Nessus controller initialized. Ready to scan {Style.BRIGHT}{self.target_url}{Style.RESET_ALL}")

    def _check_nessus_installed(self) -> bool:
        """Check if Nessus is installed on the system"""
        try:
            subprocess.run([self.nessus_cli_path, "-q"], capture_output=True, text=True, check=False)
            return True
        except FileNotFoundError:
            return False

    def start_scan(self) -> dict:
        """
        Start a vulnerability scan of the target URL using Nessus

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
        printer.info(f"Starting Nessus scan on {Style.BRIGHT}{self.target_url}{Style.RESET_ALL}")

        try:
            # Build Nessus command
            cmd = [self.nessus_cli_path, "-q", self.target_url]

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
            self.results['vulnerabilities'] = self._parse_vulnerabilities(output)

            printer.success(f"Nessus scan completed. Detected {len(self.results['vulnerabilities'])} vulnerabilities.")

        except Exception as e:
            printer.error(f"Error during Nessus scan: {e}")
            self.results['status'] = 'error'
            self.results['errors'].append(str(e))

        return self.results

    def _parse_vulnerabilities(self, nessus_output) -> list:
        """Parse Nessus output and extract vulnerabilities"""
        vulnerabilities = []
        # Example vulnerability format (this will vary depending on Nessus configuration)
        # Implement parsing logic here based on the Nessus output format
        return vulnerabilities

    def get_results(self) -> dict:
        """Get the current results"""
        return self.results

    def to_json(self) -> str:
        """Convert results to JSON string"""
        return json.dumps(self.results, indent=2)

if __name__ == '__main__':
    # Example usage
    nessus = NessusController(target_url="http://www.example.com")
    results = nessus.start_scan()
    print(json.dumps(results, indent=4))
