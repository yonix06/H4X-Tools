"""
Nmap port scanner.
"""

import os
import json
import time
import subprocess
import re
from datetime import datetime
from helper import printer, timer
from colorama import Style

class NmapController:
    """
    Interface with Nmap for network exploration and security auditing.

    This tool requires Nmap to be installed on the system.
    - For Linux: apt-get install nmap
    - For advanced configurations, manual setup is recommended

    :param target: Target IP address or hostname (default: None)
    """
    @timer.timer
    def __init__(self, target=None) -> None:
        self.results = {
            'status': 'initialized',
            'ports': [],
            'os_detection': {},
            'stats': {},
            'errors': [],
            'timestamp': datetime.now().isoformat()
        }

        self.target = target

        # Check if Nmap is installed
        if not self._check_nmap_installed():
            printer.error("Nmap is not installed or not in PATH")
            self.results['status'] = 'error'
            self.results['errors'].append('Nmap is not installed or not in PATH')
            return

        # Initialize status
        self.results['status'] = 'ready'
        printer.info(f"Nmap controller initialized. Ready to scan {Style.BRIGHT}{self.target}{Style.RESET_ALL}")

    def _check_nmap_installed(self) -> bool:
        """Check if Nmap is installed on the system"""
        try:
            subprocess.run(["nmap", "--version"], capture_output=True, text=True, check=False)
            return True
        except FileNotFoundError:
            return False

    def start_scan(self) -> dict:
        """
        Start a scan of the target using Nmap

        :return: Dictionary with scan results
        """
        if self.results['status'] == 'error':
            return self.results

        if not self.target:
            printer.error("No target specified")
            self.results['status'] = 'error'
            self.results['errors'].append("No target specified")
            return self.results

        self.results['status'] = 'scanning'
        printer.info(f"Starting Nmap scan on {Style.BRIGHT}{self.target}{Style.RESET_ALL}")

        try:
            # Build Nmap command
            cmd = ["nmap", self.target, "-sV", "-O"]

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
            self.results['ports'] = self._parse_ports(output)
            self.results['os_detection'] = self._parse_os_detection(output)

            printer.success(f"Nmap scan completed. Detected {len(self.results['ports'])} open ports.")

        except Exception as e:
            printer.error(f"Error during Nmap scan: {e}")
            self.results['status'] = 'error'
            self.results['errors'].append(str(e))

        return self.results

    def _parse_ports(self, nmap_output) -> list:
        """Parse Nmap output and extract open ports"""
        ports = []
        # Example port format (this will vary depending on Nmap output)
        # Implement parsing logic here based on the Nmap output format
        return ports

    def _parse_os_detection(self, nmap_output) -> dict:
        """Parse Nmap output and extract OS detection information"""
        os_detection = {}
        # Example OS detection format (this will vary depending on Nmap output)
        # Implement parsing logic here based on the Nmap output format
        return os_detection

    def get_results(self) -> dict:
        """Get the current results"""
        return self.results

    def to_json(self) -> str:
        """Convert results to JSON string"""
        return json.dumps(self.results, indent=2)

if __name__ == '__main__':
    # Example usage
    nmap = NmapController(target="127.0.0.1")
    results = nmap.start_scan()
    print(json.dumps(results, indent=4))
