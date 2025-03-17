"""
BitLocker drive encryption controller.
"""

import os
import json
import time
import subprocess
import re
from datetime import datetime
from helper import printer, timer
from colorama import Style

class BitLockerController:
    """
    Interface with BitLocker for drive encryption (Windows only).

    This tool requires BitLocker to be enabled on the system.
    - Only available on Windows

    :param volume: Drive letter of the BitLocker volume (default: C:)
    """
    @timer.timer
    def __init__(self, volume='C:') -> None:
        self.results = {
            'status': 'initialized',
            'volume_status': {},
            'stats': {},
            'errors': [],
            'timestamp': datetime.now().isoformat()
        }

        self.volume = volume

        # Check if BitLocker is available (Windows only)
        if os.name != 'nt':
            printer.error("BitLocker is only available on Windows")
            self.results['status'] = 'error'
            self.results['errors'].append('BitLocker is only available on Windows')
            return

        # Initialize status
        self.results['status'] = 'ready'
        printer.info(f"BitLocker controller initialized. Ready to manage BitLocker on {Style.BRIGHT}{self.volume}{Style.RESET_ALL}")

    def get_volume_status(self) -> dict:
        """
        Get the status of the BitLocker volume

        :return: Dictionary with BitLocker volume status
        """
        if self.results['status'] == 'error':
            return self.results

        self.results['status'] = 'fetching'
        printer.info(f"Fetching BitLocker status for volume {self.volume}")

        try:
            # Get BitLocker volume status using manage-bde.exe
            cmd = ["manage-bde.exe", "-status", self.volume]
            process = subprocess.run(cmd, capture_output=True, text=True, check=False)
            output = process.stdout

            # Parse the output to extract relevant information
            volume_status = self._parse_volume_status(output)

            self.results['volume_status'] = volume_status
            self.results['status'] = 'completed'
            self.results['timestamp'] = datetime.now().isoformat()

            printer.success(f"Fetched BitLocker status for volume {self.volume}.")

        except Exception as e:
            printer.error(f"Error fetching BitLocker status: {e}")
            self.results['status'] = 'error'
            self.results['errors'].append(str(e))

        return self.results

    def _parse_volume_status(self, manage_bde_output) -> dict:
        """Parse manage-bde.exe output and extract volume status"""
        volume_status = {}
        # Example output from manage-bde.exe -status C:
        # Implement parsing logic here based on the manage-bde.exe output format
        return volume_status

    def get_results(self) -> dict:
        """Get the current results"""
        return self.results

    def to_json(self) -> str:
        """Convert results to JSON string"""
        return json.dumps(self.results, indent=2)

if __name__ == '__main__':
    # Example usage
    bitlocker = BitLockerController()
    results = bitlocker.get_volume_status()
    print(json.dumps(results, indent=4))
