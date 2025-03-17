"""
Tcpdump packet analyzer.
"""

import os
import json
import time
import subprocess
import re
from datetime import datetime
from helper import printer, timer
from colorama import Style

class TcpdumpController:
    """
    Interface with Tcpdump for capturing network traffic.

    This tool requires Tcpdump to be installed on the system.
    - For Linux: apt-get install tcpdump
    - For advanced configurations, manual setup is recommended

    :param interface: Network interface to capture traffic on (default: eth0)
    :param capture_filter: Capture filter (BPF) to apply (default: "")
    :param filename: Filename to save the capture to (default: capture.pcap)
    """
    @timer.timer
    def __init__(self, interface='eth0', capture_filter="", filename="capture.pcap") -> None:
        self.results = {
            'status': 'initialized',
            'capture_file': filename,
            'stats': {},
            'errors': [],
            'timestamp': datetime.now().isoformat()
        }

        self.interface = interface
        self.capture_filter = capture_filter
        self.filename = filename

        # Check if Tcpdump is installed
        if not self._check_tcpdump_installed():
            printer.error("Tcpdump is not installed or not in PATH")
            self.results['status'] = 'error'
            self.results['errors'].append('Tcpdump is not installed or not in PATH')
            return

        # Initialize status
        self.results['status'] = 'ready'
        printer.info(f"Tcpdump controller initialized. Ready to capture traffic on {Style.BRIGHT}{self.interface}{Style.RESET_ALL}")

    def _check_tcpdump_installed(self) -> bool:
        """Check if Tcpdump is installed on the system"""
        try:
            subprocess.run(["tcpdump", "--version"], capture_output=True, text=True, check=False)
            return True
        except FileNotFoundError:
            return False

    def start_capture(self, duration=10) -> dict:
        """
        Start capturing network traffic using Tcpdump

        :param duration: Capture duration in seconds (default: 10)
        :return: Dictionary with capture results
        """
        if self.results['status'] == 'error':
            return self.results

        self.results['status'] = 'capturing'
        printer.info(f"Starting Tcpdump capture on interface {Style.BRIGHT}{self.interface}{Style.RESET_ALL} for {duration} seconds")

        try:
            # Build Tcpdump command
            cmd = ["tcpdump", "-i", self.interface, "-w", self.filename, "-G", str(duration), "-W", "1"]
            if self.capture_filter:
                cmd.extend(["-f", self.capture_filter])

            # Log the command
            printer.info(f"Running command: {' '.join(cmd)}")

            # Start process with timeout
            start_time = time.time()
            process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            
            # Wait for process to complete
            process.wait()
            
            self.results['status'] = 'completed'
            self.results['duration'] = time.time() - start_time
            self.results['timestamp'] = datetime.now().isoformat()

            printer.success(f"Tcpdump capture completed. Saved to {Style.BRIGHT}{self.filename}{Style.RESET_ALL}")

        except Exception as e:
            printer.error(f"Error during Tcpdump capture: {e}")
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
    tcpdump = TcpdumpController()
    results = tcpdump.start_capture(duration=5)
    print(json.dumps(results, indent=4))
