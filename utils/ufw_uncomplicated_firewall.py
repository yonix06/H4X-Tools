"""
UFW (Uncomplicated Firewall) controller.
"""

import os
import json
import time
import subprocess
import re
from datetime import datetime
from helper import printer, timer
from colorama import Style

class UFWController:
    """
    Interface with UFW (Uncomplicated Firewall) for managing firewall rules.

    This tool requires UFW to be installed on the system.
    - For Linux: apt-get install ufw
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

        # Check if UFW is installed
        if not self._check_ufw_installed():
            printer.error("UFW is not installed or not in PATH")
            self.results['status'] = 'error'
            self.results['errors'].append('UFW is not installed or not in PATH')
            return

        # Initialize status
        self.results['status'] = 'ready'
        printer.info("UFW controller initialized. Ready to manage firewall rules.")

    def _check_ufw_installed(self) -> bool:
        """Check if UFW is installed on the system"""
        try:
            subprocess.run(["ufw", "version"], capture_output=True, text=True, check=False)
            return True
        except FileNotFoundError:
            return False

    def get_rules(self) -> dict:
        """
        Get a list of currently active UFW rules

        :return: Dictionary with list of UFW rules
        """
        if self.results['status'] == 'error':
            return self.results

        self.results['status'] = 'fetching'
        printer.info("Fetching UFW rules")

        try:
            # Get UFW status and rules
            process = subprocess.run(["ufw", "status", "numbered"], capture_output=True, text=True, check=False)
            output = process.stdout

            rules = []
            for line in output.splitlines():
                if "ALLOW" in line or "DENY" in line:
                    rule_number = line.split(" ")[0].strip()
                    rule_description = line.split(" ")[1:].strip()
                    rules.append({"number": rule_number, "rule": rule_description})

            self.results['rules'] = rules
            self.results['status'] = 'completed'
            self.results['timestamp'] = datetime.now().isoformat()

            printer.success(f"Fetched {len(self.results['rules'])} UFW rules.")

        except Exception as e:
            printer.error(f"Error fetching UFW rules: {e}")
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
    ufw = UFWController()
    results = ufw.get_rules()
    print(json.dumps(results, indent=4))
