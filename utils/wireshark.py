"""
Wireshark packet analyzer.
"""

import os
import json
import time
import subprocess
import re
from datetime import datetime
from helper import printer, timer
from colorama import Style

class WiresharkController:
    """
    Interface with Wireshark for capturing and analyzing network traffic.

    This tool requires Wireshark (tshark) to be installed on the system.
    - For Linux: apt-get install wireshark
    - For advanced configurations, manual setup is recommended

    :param interface: Network interface to capture traffic on (default: eth0)
    :param capture_filter: Capture filter (BPF) to apply (default: "")
    """
    @timer.timer
    def __init__(self, interface='eth0', capture_filter="") -> None:
        self.results = {
            'status': 'initialized',
            'capture_file': None,
            'stats': {},
            'errors': [],
            'timestamp': datetime.now().isoformat()
        }

        self.interface = interface
        self.capture_filter = capture_filter

        # Check if tshark is installed
        if not self._check_tshark_installed():
            printer.error("Tshark (Wireshark command-line) is not installed or not in PATH")
            self.results['status'] = 'error'
            self.results['errors'].append('Tshark is not installed or not in PATH')
            return

        # Initialize status
        self.results['status'] = 'ready'
        printer.info(f"Wireshark controller initialized. Ready to capture traffic on {Style.BRIGHT}{self.interface}{Style.RESET_ALL}")

    def _check_tshark_installed(self) -> bool:
        """Check if tshark is installed on the system"""
        try:
            subprocess.run(["tshark", "-v"], capture_output=True, text=True, check=False)
            return True
        except FileNotFoundError:
            return False

    def start_capture(self, duration=10, filename="capture.pcap") -> dict:
        """
        Start capturing network traffic using tshark

        :param duration: Capture duration in seconds (default: 10)
        :param filename: Filename to save the capture to (default: capture.pcap)
        :return: Dictionary with capture results
        """
        if self.results['status'] == 'error':
            return self.results

        self.results['status'] = 'capturing'
        printer.info(f"Starting Wireshark capture on interface {Style.BRIGHT}{self.interface}{Style.RESET_ALL} for {duration} seconds")

        try:
            # Build tshark command
            cmd = ["tshark", "-i", self.interface, "-w", filename, "-a", f"duration:{duration}"]
            if self.capture_filter:
                cmd.extend(["-f", self.capture_filter])

            # Log the command
            printer.info(f"Running command: {' '.join(cmd)}")

            # Start process with timeout
            start_time = time.time()
            process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            
            # Wait for process to complete
            process.wait()
            
            self.results['capture_file'] = filename
            self.results['status'] = 'completed'
            self.results['duration'] = time.time() - start_time
            self.results['timestamp'] = datetime.now().isoformat()

            printer.success(f"Wireshark capture completed. Saved to {Style.BRIGHT}{filename}{Style.RESET_ALL}")

        except Exception as e:
            printer.error(f"Error during Wireshark capture: {e}")
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
    wireshark = WiresharkController()
    results = wireshark.start_capture(duration=5)
    print(json.dumps(results, indent=4))
