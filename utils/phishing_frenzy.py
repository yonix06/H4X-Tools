"""
Phishing Frenzy controller.
"""

import os
import json
import time
import subprocess
import re
from datetime import datetime
from helper import printer, timer
from colorama import Style

class PhishingFrenzyController:
    """
    Interface with Phishing Frenzy for creating and managing phishing campaigns.

    This tool requires Phishing Frenzy to be installed on the system.
    - Download from: https://github.com/pentestgeek/phishingfrenzy
    - For advanced configurations, manual setup is recommended

    :param config_file: Path to the Phishing Frenzy configuration file (default: /opt/phishingfrenzy/config.yml)
    """
    @timer.timer
    def __init__(self, config_file='/opt/phishingfrenzy/config.yml') -> None:
        self.results = {
            'status': 'initialized',
            'campaigns': [],
            'stats': {},
            'errors': [],
            'timestamp': datetime.now().isoformat()
        }

        self.config_file = config_file

        # Check if Phishing Frenzy is installed
        if not self._check_phishingfrenzy_installed():
            printer.error("Phishing Frenzy is not installed or not in PATH")
            self.results['status'] = 'error'
            self.results['errors'].append('Phishing Frenzy is not installed or not in PATH')
            return

        # Initialize status
        self.results['status'] = 'ready'
        printer.info(f"Phishing Frenzy controller initialized. Ready to manage phishing campaigns using {Style.BRIGHT}{self.config_file}{Style.RESET_ALL}")

    def _check_phishingfrenzy_installed(self) -> bool:
        """Check if Phishing Frenzy is installed on the system"""
        try:
            # This is a placeholder, actual check will vary depending on installation
            subprocess.run(["phishingfrenzy", "--version"], capture_output=True, text=True, check=False)
            return True
        except FileNotFoundError:
            return False

    def get_campaigns(self) -> dict:
        """
        Get a list of Phishing Frenzy campaigns

        :return: Dictionary with list of Phishing Frenzy campaigns
        """
        if self.results['status'] == 'error':
            return self.results

        self.results['status'] = 'fetching'
        printer.info("Fetching Phishing Frenzy campaigns")

        try:
            # Get Phishing Frenzy campaigns (This is a placeholder, actual method will vary)
            # This will likely involve interacting with the Phishing Frenzy API
            # or reading its database to extract campaign information.
            campaigns = []

            self.results['campaigns'] = campaigns
            self.results['status'] = 'completed'
            self.results['timestamp'] = datetime.now().isoformat()

            printer.success(f"Fetched {len(self.results['campaigns'])} Phishing Frenzy campaigns.")

        except Exception as e:
            printer.error(f"Error fetching Phishing Frenzy campaigns: {e}")
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
    phishingfrenzy = PhishingFrenzyController()
    results = phishingfrenzy.get_campaigns()
    print(json.dumps(results, indent=4))
