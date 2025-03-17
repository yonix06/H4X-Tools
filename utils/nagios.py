"""
Nagios network monitoring system controller.
"""

import os
import json
import time
import subprocess
import re
from datetime import datetime
from helper import printer, timer
from colorama import Style

class NagiosController:
    """
    Interface with Nagios for network and system monitoring.

    This tool requires Nagios to be installed and configured on the system.
    - For Linux: apt-get install nagios4
    - For advanced configurations, manual setup is recommended

    :param nagios_cmd_file: Path to the Nagios command file (default: /usr/local/nagios/var/rw/nagios.cmd)
    """
    @timer.timer
    def __init__(self, nagios_cmd_file='/usr/local/nagios/var/rw/nagios.cmd') -> None:
        self.results = {
            'status': 'initialized',
            'services': [],
            'stats': {},
            'errors': [],
            'timestamp': datetime.now().isoformat()
        }

        self.nagios_cmd_file = nagios_cmd_file

        # Check if Nagios is installed
        if not self._check_nagios_installed():
            printer.error("Nagios is not installed or not in PATH")
            self.results['status'] = 'error'
            self.results['errors'].append('Nagios is not installed or not in PATH')
            return

        # Initialize status
        self.results['status'] = 'ready'
        printer.info(f"Nagios controller initialized. Ready to manage Nagios from {Style.BRIGHT}{self.nagios_cmd_file}{Style.RESET_ALL}")

    def _check_nagios_installed(self) -> bool:
        """Check if Nagios is installed on the system"""
        try:
            subprocess.run(["nagios", "-v"], capture_output=True, text=True, check=False)
            return True
        except FileNotFoundError:
            return False

    def get_services(self) -> dict:
        """
        Get a list of currently monitored services in Nagios

        :return: Dictionary with list of Nagios services
        """
        if self.results['status'] == 'error':
            return self.results

        self.results['status'] = 'fetching'
        printer.info("Fetching Nagios services")

        try:
            # Get Nagios services (This is a placeholder, actual method will vary)
            # This will likely involve reading the Nagios configuration files
            # and parsing them to extract the service definitions.
            services = []
            
            # Example: Read a dummy config file
            # with open("/path/to/nagios/services.cfg", "r") as f:
            #     for line in f:
            #         if "define service" in line:
            #             services.append(line.strip())

            self.results['services'] = services
            self.results['status'] = 'completed'
            self.results['timestamp'] = datetime.now().isoformat()

            printer.success(f"Fetched {len(self.results['services'])} Nagios services.")

        except Exception as e:
            printer.error(f"Error fetching Nagios services: {e}")
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
    nagios = NagiosController()
    results = nagios.get_services()
    print(json.dumps(results, indent=4))
