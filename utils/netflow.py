"""
NetFlow traffic analyzer.
"""

import os
import json
import time
import subprocess
import re
from datetime import datetime
from helper import printer, timer
from colorama import Style

class NetflowController:
    """
    Interface for collecting and analyzing NetFlow data.

    This tool requires a NetFlow collector (e.g., fprobe, softflowd) and analyzer
    (e.g., nfdump) to be installed on the system.
    - For Linux: apt-get install fprobe nfdump
    - For advanced configurations, manual setup is recommended

    :param interface: Network interface to collect NetFlow data from (default: eth0)
    :param collector_ip: IP address of the NetFlow collector (default: 127.0.0.1)
    :param collector_port: Port of the NetFlow collector (default: 2055)
    :param data_dir: Directory to store NetFlow data (default: /var/cache/nfdump)
    """
    @timer.timer
    def __init__(self, interface='eth0', collector_ip='127.0.0.1', collector_port=2055, data_dir='/var/cache/nfdump') -> None:
        self.results = {
            'status': 'initialized',
            'stats': {},
            'errors': [],
            'timestamp': datetime.now().isoformat()
        }

        self.interface = interface
        self.collector_ip = collector_ip
        self.collector_port = collector_port
        self.data_dir = data_dir

        # Check if required tools are installed
        if not self._check_tools_installed():
            printer.error("Required tools (fprobe, nfdump) are not installed or not in PATH")
            self.results['status'] = 'error'
            self.results['errors'].append('Required tools (fprobe, nfdump) are not installed or not in PATH')
            return

        # Initialize status
        self.results['status'] = 'ready'
        printer.info(f"NetFlow controller initialized. Ready to collect and analyze NetFlow data from {Style.BRIGHT}{self.interface}{Style.RESET_ALL}")

    def _check_tools_installed(self) -> bool:
        """Check if required tools (fprobe, nfdump) are installed on the system"""
        try:
            subprocess.run(["fprobe", "--version"], capture_output=True, text=True, check=False)
            subprocess.run(["nfdump", "--version"], capture_output=True, text=True, check=False)
            return True
        except FileNotFoundError:
            return False

    def start_collection(self, duration=60) -> dict:
        """
        Start collecting NetFlow data using fprobe and analyze using nfdump

        :param duration: Collection duration in seconds (default: 60)
        :return: Dictionary with analysis results
        """
        if self.results['status'] == 'error':
            return self.results

        self.results['status'] = 'collecting'
        printer.info(f"Starting NetFlow collection on interface {Style.BRIGHT}{self.interface}{Style.RESET_ALL} for {duration} seconds")

        try:
            # Build fprobe command
            fprobe_cmd = ["fprobe", "-i", self.interface, f"{self.collector_ip}:{self.collector_port}"]

            # Build nfdump command
            nfdump_cmd = ["nfdump", "-t", f"now-{duration}s/now", "-r", self.data_dir]

            # Log the commands
            printer.info(f"Running fprobe command: {' '.join(fprobe_cmd)}")
            printer.info(f"Running nfdump command: {' '.join(nfdump_cmd)}")

            # Start fprobe process
            fprobe_process = subprocess.Popen(fprobe_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

            # Wait for fprobe to start
            time.sleep(2)

            # Start nfdump process
            start_time = time.time()
            nfdump_process = subprocess.Popen(nfdump_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            nfdump_output, nfdump_error = nfdump_process.communicate()

            # Terminate fprobe process
            fprobe_process.terminate()

            self.results['status'] = 'completed'
            self.results['duration'] = time.time() - start_time
            self.results['timestamp'] = datetime.now().isoformat()

            # Process and parse results
            self.results['stats'] = self._parse_stats(nfdump_output)

            printer.success(f"NetFlow collection and analysis completed.")

        except Exception as e:
            printer.error(f"Error during NetFlow collection and analysis: {e}")
            self.results['status'] = 'error'
            self.results['errors'].append(str(e))

        return self.results

    def _parse_stats(self, nfdump_output) -> dict:
        """Parse Nfdump output and extract statistics"""
        stats = {
            'total_flows': 0,
            'total_packets': 0,
            'total_bytes': 0
        }

        # Example nfdump output:
        # Summary: total flows: 1234, total bytes: 567890, total packets: 91011
        try:
            match = re.search(r"Summary:.*?flows:\s*(\d+),.*?bytes:\s*(\d+),.*?packets:\s*(\d+)", nfdump_output)
            if match:
                stats['total_flows'] = int(match.group(1))
                stats['total_bytes'] = int(match.group(2))
                stats['total_packets'] = int(match.group(3))
        except Exception:
            printer.error("Error parsing nfdump output")

        return stats

    def get_results(self) -> dict:
        """Get the current results"""
        return self.results

    def to_json(self) -> str:
        """Convert results to JSON string"""
        return json.dumps(self.results, indent=2)

if __name__ == '__main__':
    # Example usage
    netflow = NetflowController()
    results = netflow.start_collection(duration=5)
    print(json.dumps(results, indent=4))
