"""
LastPass password manager controller.
"""

import os
import json
import time
import subprocess
import re
from datetime import datetime
from helper import printer, timer
from colorama import Style

class LastPassController:
    """
    Interface with LastPass password manager.

    This tool requires the LastPass CLI to be installed on the system.
    - Download from: https://www.lastpass.com/cli
    - For advanced configurations, manual setup is recommended

    :param username: LastPass username (default: None)
    """
    @timer.timer
    def __init__(self, username=None) -> None:
        self.results = {
            'status': 'initialized',
            'accounts': [],
            'stats': {},
            'errors': [],
            'timestamp': datetime.now().isoformat()
        }

        self.username = username

        # Check if LastPass CLI is installed
        if not self._check_lastpass_installed():
            printer.error("LastPass CLI is not installed or not in PATH")
            self.results['status'] = 'error'
            self.results['errors'].append('LastPass CLI is not installed or not in PATH')
            return

        # Initialize status
        self.results['status'] = 'ready'
        printer.info(f"LastPass controller initialized. Ready to manage LastPass accounts for {Style.BRIGHT}{self.username}{Style.RESET_ALL}")

    def _check_lastpass_installed(self) -> bool:
        """Check if LastPass CLI is installed on the system"""
        try:
            subprocess.run(["lpass", "--version"], capture_output=True, text=True, check=False)
            return True
        except FileNotFoundError:
            return False

    def get_accounts(self) -> dict:
        """
        Get a list of LastPass accounts

        :return: Dictionary with list of LastPass accounts
        """
        if self.results['status'] == 'error':
            return self.results

        if not self.username:
            printer.error("No LastPass username specified")
            self.results['status'] = 'error'
            self.results['errors'].append("No LastPass username specified")
            return self.results

        self.results['status'] = 'fetching'
        printer.info(f"Fetching LastPass accounts for {self.username}")

        try:
            # Log in to LastPass
            login_cmd = ["lpass", "login", self.username]
            login_process = subprocess.run(login_cmd, capture_output=True, text=True, check=False)
            if login_process.returncode != 0:
                printer.error(f"Error logging in to LastPass: {login_process.stderr}")
                self.results['status'] = 'error'
                self.results['errors'].append(f"Error logging in to LastPass: {login_process.stderr}")
                return self.results

            # Get list of accounts
            show_cmd = ["lpass", "ls"]
            show_process = subprocess.run(show_cmd, capture_output=True, text=True, check=False)
            output = show_process.stdout

            accounts = []
            for line in output.splitlines():
                accounts.append(line.strip())

            self.results['accounts'] = accounts
            self.results['status'] = 'completed'
            self.results['timestamp'] = datetime.now().isoformat()

            printer.success(f"Fetched {len(self.results['accounts'])} LastPass accounts.")

            # Log out from LastPass
            logout_cmd = ["lpass", "logout"]
            logout_process = subprocess.run(logout_cmd, capture_output=True, text=True, check=False)

        except Exception as e:
            printer.error(f"Error fetching LastPass accounts: {e}")
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
    lastpass = LastPassController(username="your_username")
    results = lastpass.get_accounts()
    print(json.dumps(results, indent=4))
