"""
Social-Engineer Toolkit (SET) controller.
"""

import os
import json
import time
import subprocess
import re
from datetime import datetime
from helper import printer, timer
from colorama import Style

class SetController:
    """
    Interface with Social-Engineer Toolkit (SET) for social engineering attacks.

    This tool requires SET to be installed on the system.
    - Download from: https://www.trustedsec.com/social-engineer-toolkit/
    - For advanced configurations, manual setup is recommended

    :param set_path: Path to the SET installation directory (default: /usr/share/set)
    """
    @timer.timer
    def __init__(self, set_path='/usr/share/set') -> None:
        self.results = {
            'status': 'initialized',
            'attack_results': {},
            'stats': {},
            'errors': [],
            'timestamp': datetime.now().isoformat()
        }

        self.set_path = set_path

        # Check if SET is installed
        if not self._check_set_installed():
            printer.error("SET is not installed or not in PATH")
            self.results['status'] = 'error'
            self.results['errors'].append('SET is not installed or not in PATH')
            return

        # Initialize status
        self.results['status'] = 'ready'
        printer.info(f"SET controller initialized. Ready to launch social engineering attacks from {Style.BRIGHT}{self.set_path}{Style.RESET_ALL}")

    def _check_set_installed(self) -> bool:
        """Check if SET is installed on the system"""
        try:
            subprocess.run(["setoolkit", "--version"], capture_output=True, text=True, check=False)
            return True
        except FileNotFoundError:
            return False

    def start_attack(self, attack_type="Web Attack", payload="Credential Harvester") -> dict:
        """
        Start a social engineering attack using SET

        :param attack_type: Type of attack to launch (default: Web Attack)
        :param payload: Payload to use for the attack (default: Credential Harvester)
        :return: Dictionary with attack results
        """
        if self.results['status'] == 'error':
            return self.results

        self.results['status'] = 'attacking'
        printer.info(f"Starting SET attack: {Style.BRIGHT}{attack_type} - {payload}{Style.RESET_ALL}")

        try:
            # Build SET command (This is a placeholder, actual command will vary)
            cmd = ["setoolkit"]

            # Log the command
            printer.info(f"Running command: {' '.join(cmd)}")

            # Start process with timeout
            start_time = time.time()
            process = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            
            # Interact with SET to configure the attack (This is a placeholder)
            # This will require sending input to the process's stdin
            # and parsing the output from its stdout and stderr.
            # Example:
            # process.stdin.write("1\n") # Select Social-Engineering Attacks
            # process.stdin.flush()
            
            output, error = process.communicate(timeout=60) # Give it a timeout

            self.results['status'] = 'completed'
            self.results['duration'] = time.time() - start_time
            self.results['timestamp'] = datetime.now().isoformat()

            # Process and parse results
            self.results['attack_results'] = self._parse_attack_results(output)

            printer.success(f"SET attack completed.")

        except Exception as e:
            printer.error(f"Error during SET attack: {e}")
            self.results['status'] = 'error'
            self.results['errors'].append(str(e))

        return self.results

    def _parse_attack_results(self, set_output) -> dict:
        """Parse SET output and extract attack results"""
        attack_results = {}
        # Example attack result format (this will vary depending on SET configuration)
        # Implement parsing logic here based on the SET output format
        return attack_results

    def get_results(self) -> dict:
        """Get the current results"""
        return self.results

    def to_json(self) -> str:
        """Convert results to JSON string"""
        return json.dumps(self.results, indent=2)

if __name__ == '__main__':
    # Example usage
    set_tool = SetController()
    results = set_tool.start_attack()
    print(json.dumps(results, indent=4))
