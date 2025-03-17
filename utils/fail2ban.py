"""
Fail2ban for intrusion prevention.
"""

import os
import json
import time
import subprocess
import re
from datetime import datetime
from helper import printer, timer
from colorama import Style

class Fail2BanController:
    """
    Interface with Fail2ban for intrusion prevention.

    This tool requires Fail2ban to be installed on the system.
    - For Linux: apt-get install fail2ban
    - For advanced configurations, manual setup is recommended

    :param config_dir: Path to Fail2ban configuration directory (default: /etc/fail2ban)
    """
    @timer.timer
    def __init__(self, config_dir='/etc/fail2ban') -> None:
        self.results = {
            'status': 'initialized',
            'banned_ips': [],
            'stats': {},
            'errors': [],
            'timestamp': datetime.now().isoformat()
        }

        self.config_dir = config_dir

        # Check if Fail2ban is installed
        if not self._check_fail2ban_installed():
            printer.error("Fail2ban is not installed or not in PATH")
            self.results['status'] = 'error'
            self.results['errors'].append('Fail2ban is not installed or not in PATH')
            return

        # Initialize status
        self.results['status'] = 'ready'
        printer.info(f"Fail2ban controller initialized. Ready to manage bans from {Style.BRIGHT}{self.config_dir}{Style.RESET_ALL}")

    def _check_fail2ban_installed(self) -> bool:
        """Check if Fail2ban is installed on the system"""
        try:
            subprocess.run(["fail2ban-client", "status"], capture_output=True, text=True, check=False)
            return True
        except FileNotFoundError:
            return False

    def get_banned_ips(self) -> dict:
        """
        Get a list of currently banned IPs from Fail2ban

        :return: Dictionary with list of banned IPs
        """
        if self.results['status'] == 'error':
            return self.results

        self.results['status'] = 'fetching'
        printer.info("Fetching banned IPs from Fail2ban")

        try:
            banned_ips = []
            
            # Get list of jails
            process = subprocess.run(["fail2ban-client", "status"], capture_output=True, text=True, check=False)
            output = process.stdout
            
            jail_list_match = re.search(r"Jail list:\s*(.*)", output)
            if jail_list_match:
                jails = jail_list_match.group(1).strip().split(", ")
                
                # Get banned IPs for each jail
                for jail in jails:
                    process = subprocess.run(["fail2ban-client", "status", jail], capture_output=True, text=True, check=False)
                    jail_output = process.stdout
                    
                    currently_banned_match = re.search(r"Currently banned:\s*(.*)", jail_output)
                    if currently_banned_match:
                        ips = currently_banned_match.group(1).strip().split()
                        banned_ips.extend(ips)

            self.results['banned_ips'] = banned_ips
            self.results['status'] = 'completed'
            self.results['timestamp'] = datetime.now().isoformat()

            printer.success(f"Fetched {len(self.results['banned_ips'])} banned IPs from Fail2ban.")

        except Exception as e:
            printer.error(f"Error fetching banned IPs from Fail2ban: {e}")
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
    fail2ban = Fail2BanController()
    results = fail2ban.get_banned_ips()
    print(json.dumps(results, indent=4))
