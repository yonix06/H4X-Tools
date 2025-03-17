"""
Iptables controller.
"""

import os
import json
import time
import subprocess
import re
from datetime import datetime
from helper import printer, timer
from colorama import Style

class IptablesController:
    """
    Interface with Iptables for managing firewall rules.

    This tool requires Iptables to be installed on the system.
    - For Linux: apt-get install iptables
    - For advanced configurations, manual setup is recommended
    """
    @timer.timer
    def __init__(self) -> None:
        self.results = {
            'status': 'initialized',
            'rules': [],
            'stats': {},
            'errors': [],
            'timestamp': datetime.now().isoformat()
        }

        # Check if Iptables is installed
        if not self._check_iptables_installed():
            printer.error("Iptables is not installed or not in PATH")
            self.results['status'] = 'error'
            self.results['errors'].append('Iptables is not installed or not in PATH')
            return

        # Initialize status
        self.results['status'] = 'ready'
        printer.info("Iptables controller initialized. Ready to manage firewall rules.")

    def _check_iptables_installed(self) -> bool:
        """Check if Iptables is installed on the system"""
        try:
            subprocess.run(["iptables", "--version"], capture_output=True, text=True, check=False)
            return True
        except FileNotFoundError:
            return False

    def get_rules(self) -> dict:
        """
        Get a list of currently active Iptables rules

        :return: Dictionary with list of Iptables rules
        """
        if self.results['status'] == 'error':
            return self.results

        self.results['status'] = 'fetching'
        printer.info("Fetching Iptables rules")

        try:
            # Get Iptables rules
            process = subprocess.run(["iptables", "-L", "-n", "-v"], capture_output=True, text=True, check=False)
            output = process.stdout

            rules = []
            for line in output.splitlines():
                if "ACCEPT" in line or "DROP" in line or "REJECT" in line:
                    rules.append(line.strip())

            self.results['rules'] = rules
            self.results['status'] = 'completed'
            self.results['timestamp'] = datetime.now().isoformat()

            printer.success(f"Fetched {len(self.results['rules'])} Iptables rules.")

        except Exception as e:
            printer.error(f"Error fetching Iptables rules: {e}")
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
    iptables = IptablesController()
    results = iptables.get_rules()
    print(json.dumps(results, indent=4))
