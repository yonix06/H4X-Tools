"""
Ntop traffic analyzer.
"""

import os
import json
import time
import subprocess
import re
from datetime import datetime
from helper import printer, timer
from colorama import Style

class NtopController:
    """
    Interface with Ntop for capturing and analyzing network traffic.

    This tool requires Ntop to be installed on the system.
    - For Linux: apt-get install ntopng
    - For advanced configurations, manual setup is recommended

    :param interface: Network interface to capture traffic on (default: eth0)
    :param data_dir: Directory to store Ntop data (default: /var/lib/ntopng)
    """
    @timer.timer
    def __init__(self, interface='eth0', data_dir='/var/lib/ntopng') -> None:
        self.results = {
            'status': 'initialized',
            'stats': {},
            'errors': [],
            'timestamp': datetime.now().isoformat()
        }

        self.interface = interface
        self.data_dir = data_dir

        # Check if Ntop is installed
        if not self._check_ntop_installed():
            printer.error("Ntop is not installed or not in PATH")
            self.results['status'] = 'error'
            self.results['errors'].append('Ntop is not installed or not in PATH')
            return

        # Initialize status
        self.results['status'] = 'ready'
        printer.info(f"Ntop controller initialized. Ready to analyze traffic on {Style.BRIGHT}{self.interface}{Style.RESET_ALL}")

    def _check_ntop_installed(self) -> bool:
        """Check if Ntop is installed on the system"""
        try:
            subprocess.run(["ntopng", "--version"], capture_output=True, text=True, check=False)
            return True
        except FileNotFoundError:
            return False

    def start_analysis(self, duration=60) -> dict:
        """
        Start analyzing network traffic using Ntop

        :param duration: Analysis duration in seconds (default: 60)
        :return: Dictionary with analysis results
        """
        if self.results['status'] == 'error':
            return self.results

        self.results['status'] = 'analyzing'
        printer.info(f"Starting Ntop analysis on interface {Style.BRIGHT}{self.interface}{Style.RESET_ALL} for {duration} seconds")

        try:
            # Build Ntop command
            cmd = ["ntopng", "-i", self.interface, "-d", self.data_dir, "-T", str(duration)]

            # Log the command
            printer.info(f"Running command: {' '.join(cmd)}")

            # Start process with timeout
            start_time = time.time()
            process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            
            # Wait for process to complete
            process.wait()
            
            self.results['status'] = 'completed'
            self.results['duration'] = time.time() - start_time
            self.results['timestamp'] = datetime.now().isoformat()

            printer.success(f"Ntop analysis completed.")

        except Exception as e:
            printer.error(f"Error during Ntop analysis: {e}")
            self.results['status'] = 'error'
            self.results['errors'].append(str(e))

        return self.results

    def get_results(self) -> dict:
        """Get the current results"""
        return self.results

    def to_json(self) -> str:
        """Convert results to JSON string"""
        return json.dumps(self.results, indent=2)

if __name__ == '__main__':
    # Example usage
    ntop = NtopController()
    results = ntop.start_analysis(duration=5)
    print(json.dumps(results, indent=4))
