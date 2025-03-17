"""
Suricata IDS (Intrusion Detection System) for network traffic analysis.
"""

import os
import json
import time
import subprocess
import re
from datetime import datetime
from helper import printer, timer
from colorama import Style

class SuricataController:
    """
    Interface with Suricata IDS (Intrusion Detection System) for network traffic analysis.

    This tool requires Suricata to be installed on the system.
    - For Linux: apt-get install suricata
    - For advanced configurations, manual setup is recommended

    :param interface: Network interface to monitor (default: auto-detect)
    :param config_file: Path to Suricata configuration file (default: system default)
    :param pcap_file: Analyze a pcap file instead of live traffic (optional)
    """
    @timer.timer
    def __init__(self, interface=None, config_file=None, pcap_file=None) -> None:
        self.results = {
            'status': 'initialized',
            'alerts': [],
            'stats': {},
            'errors': [],
            'timestamp': datetime.now().isoformat()
        }

        # Check if Suricata is installed
        if not self._check_suricata_installed():
            printer.error("Suricata is not installed or not in PATH")
            self.results['status'] = 'error'
            self.results['errors'].append('Suricata is not installed or not in PATH')
            return

        # Determine network interface if not specified
        self.interface = interface
        if not interface and not pcap_file:
            self.interface = self._detect_default_interface()
            printer.info(f"Auto-detected network interface: {Style.BRIGHT}{self.interface}{Style.RESET_ALL}")

        self.config_file = config_file
        self.pcap_file = pcap_file

        # Get Suricata version
        self.version = self._get_suricata_version()
        if self.version:
            printer.info(f"Suricata version: {Style.BRIGHT}{self.version}{Style.RESET_ALL}")
            self.results['stats']['version'] = self.version

        # Initialize status
        self.results['status'] = 'ready'
        if self.pcap_file:
            self.analyze_pcap()
        else:
            printer.info(f"Suricata controller initialized. Ready to monitor interface {Style.BRIGHT}{self.interface}{Style.RESET_ALL}")

    def _check_suricata_installed(self) -> bool:
        """Check if Suricata is installed on the system"""
        try:
            subprocess.run(["suricata", "-V"], capture_output=True, text=True, check=False)
            return True
        except FileNotFoundError:
            return False

    def _get_suricata_version(self) -> str:
        """Get Suricata version"""
        try:
            result = subprocess.run(["suricata", "-V"], capture_output=True, text=True, check=False)
            match = re.search(r"This is Suricata version (\d+\.\d+\.\d+)", result.stdout)
            if match:
                return match.group(1)
            return "Unknown"
        except Exception:
            return "Unknown"

    def _detect_default_interface(self) -> str:
        """Auto-detect the default network interface"""
        if os.name == 'posix':  # Linux/Unix
            try:
                # Try to get the interface with the default route
                result = subprocess.run(
                    ["ip", "route", "show", "default"],
                    capture_output=True,
                    text=True,
                    check=False)
                match = re.search(r"dev\s+(\w+)", result.stdout)
                if match:
                    return match.group(1)

                # Fallback to the first non-loopback interface
                result = subprocess.run(
                    ["ip", "link", "show", "up"],
                    capture_output=True,
                    text=True,
                    check=False)
                lines = result.stdout.split('\n')
                for line in lines:
                    match = re.search(r"^\d+:\s+(\w+):", line)
                    if match:
                        if match.group(1) != 'lo':
                            return match.group(1)

            except Exception as e:
                printer.error(f"Error detecting default interface: {e}")

            return "eth0"  # Default fallback

        elif os.name == 'nt':  # Windows
            return "Ethernet"  # Default Windows interface name

        return "eth0"  # Generic fallback

    def start_monitoring(self, duration=60, alert_mode=True) -> dict:
        """
        Start monitoring network traffic using Suricata

        :param duration: Monitoring duration in seconds (default: 60)
        :param alert_mode: Run in alert mode (True) or packet dump mode (False)
        :return: Dictionary with monitoring results
        """
        if self.results['status'] == 'error':
            return self.results

        self.results['status'] = 'monitoring'
        printer.info(f"Starting Suricata monitoring on interface {Style.BRIGHT}{self.interface}{Style.RESET_ALL} for {duration} seconds")

        try:
            # Build command
            cmd = ["sudo", "suricata", "-i", self.interface]

            if self.config_file:
                cmd.extend(["-c", self.config_file])
            else:
                # Basic configuration if no config file provided
                cmd.extend(["-q"])  # Run quietly

            # Add duration
            cmd.extend(["-w", str(duration)])

            # Log the command
            printer.info(f"Running command: {' '.join(cmd)}")

            # Start process with timeout
            start_time = time.time()
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1
            )

            # Process output in real-time with timeout
            alerts = []
            stdout_lines = []
            stderr_lines = []

            while process.poll() is None and time.time() - start_time < duration:
                stdout_line = process.stdout.readline() if process.stdout else ""
                stderr_line = process.stderr.readline() if process.stderr else ""

                if stdout_line:
                    stdout_lines.append(stdout_line)
                    # Extract alerts
                    if "SURICATA" in stdout_line:
                        alerts.append(stdout_line.strip())
                        printer.warning(f"Alert detected: {stdout_line.strip()}")

                if stderr_line:
                    stderr_lines.append(stderr_line)

                time.sleep(0.1)

            # Terminate the process if it's still running
            if process.poll() is None:
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()

            # Get any remaining output
            stdout, stderr = process.communicate()
            if stdout:
                stdout_lines.extend(stdout.splitlines())
            if stderr:
                stderr_lines.extend(stderr.splitlines())

            # Process and parse results
            self.results['alerts'] = self._parse_alerts(alerts)
            self.results['stats'] = self._parse_stats(stdout_lines)
            if stderr_lines:
                self.results['errors'] = stderr_lines

            self.results['status'] = 'completed'
            self.results['duration'] = time.time() - start_time
            self.results['timestamp'] = datetime.now().isoformat()

            printer.success(f"Suricata monitoring completed. Detected {len(self.results['alerts'])} alerts.")

        except Exception as e:
            printer.error(f"Error during Suricata monitoring: {e}")
            self.results['status'] = 'error'
            self.results['errors'].append(str(e))

        return self.results

    def analyze_pcap(self) -> dict:
        """
        Analyze a pcap file using Suricata

        :return: Dictionary with analysis results
        """
        if not self.pcap_file:
            printer.error("No pcap file specified")
            self.results['status'] = 'error'
            self.results['errors'].append('No pcap file specified')
            return self.results

        if not os.path.exists(self.pcap_file):
            printer.error(f"Pcap file not found: {self.pcap_file}")
            self.results['status'] = 'error'
            self.results['errors'].append(f'Pcap file not found: {self.pcap_file}')
            return self.results

        printer.info(f"Analyzing pcap file: {Style.BRIGHT}{self.pcap_file}{Style.RESET_ALL}")
        self.results['status'] = 'analyzing'

        try:
            # Build command
            cmd = ["sudo", "suricata", "-r", self.pcap_file]

            if self.config_file:
                cmd.extend(["-c", self.config_file])

            # Log the command
            printer.info(f"Running command: {' '.join(cmd)}")

            # Run the analysis
            process = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=False
            )

            # Process output
            stdout_lines = process.stdout.splitlines()
            stderr_lines = process.stderr.splitlines()

            # Extract alerts
            alerts = []
            for line in stdout_lines:
                if "SURICATA" in line:
                    alerts.append(line.strip())

            # Process and parse results
            self.results['alerts'] = self._parse_alerts(alerts)
            self.results['stats'] = self._parse_stats(stdout_lines)
            if stderr_lines:
                self.results['errors'] = stderr_lines

            self.results['status'] = 'completed'
            self.results['timestamp'] = datetime.now().isoformat()

            printer.success(f"Pcap analysis completed. Detected {len(self.results['alerts'])} alerts.")

        except Exception as e:
            printer.error(f"Error during pcap analysis: {e}")
            self.results['status'] = 'error'
            self.results['errors'].append(str(e))

        return self.results

    def _parse_alerts(self, alert_lines) -> list:
        """Parse Suricata alert lines into structured data"""
        parsed_alerts = []

        current_alert = None
        for line in alert_lines:
            line = line.strip()

            # Start of a new alert
            if "SURICATA" in line:
                if current_alert:
                    parsed_alerts.append(current_alert)

                # Extract alert message
                message = line

                current_alert = {
                    'message': message,
                    'signature': '',
                    'severity': '',
                    'protocol': '',
                    'src_ip': '',
                    'src_port': '',
                    'dst_ip': '',
                    'dst_port': '',
                    'timestamp': ''
                }

            # Signature line
            elif "Signature:" in line:
                signature = line.split("Signature:")[1].strip()
                current_alert['signature'] = signature

            # Severity line
            elif "Severity:" in line:
                severity = line.split("Severity:")[1].strip()
                current_alert['severity'] = severity

            # Traffic details line
            elif "IP" in line and "->" in line:
                # Try to extract protocol, IPs and ports
                match = re.search(r"(\d{2}/\d{2}/\d{4}-\d{2}:\d{2}:\d{2}\.\d+)\s+\[\*\*\]\s+\[.*?\]\s+(.*?)\s+->\s+(.*?)", line)
                if match:
                    current_alert['timestamp'] = match.group(1)
                    current_alert['protocol'] = "IP"  # Suricata often doesn't specify L4 protocol
                    src, dst = match.group(2).split("->")
                    current_alert['src_ip'] = src.split(":")[0].strip()
                    current_alert['src_port'] = src.split(":")[-1].strip() if ":" in src else ""
                    current_alert['dst_ip'] = dst.split(":")[0].strip()
                    current_alert['dst_port'] = dst.split(":")[-1].strip() if ":" in dst else ""

        # Add the last alert if exists
        if current_alert:
            parsed_alerts.append(current_alert)

        return parsed_alerts

    def _parse_stats(self, output_lines) -> dict:
        """Parse Suricata statistics from output lines"""
        stats = {
            'packets_received': 0,
            'packets_processed': 0,
            'packets_dropped': 0,
            'alert_count': 0
        }

        for line in output_lines:
            # Packet statistics
            if "packets:        Processed:" in line:
                match = re.search(r"packets:\s+Processed:\s*(\d+)", line)
                if match:
                    stats['packets_processed'] = int(match.group(1))

            elif "packets:        Dropped:" in line:
                match = re.search(r"packets:\s+Dropped:\s*(\d+)", line)
                if match:
                    stats['packets_dropped'] = int(match.group(1))

            # Alert statistics
            elif "alert:" in line:
                match = re.search(r"alert:.*?total:.*?(\d+)", line)
                if match:
                    stats['alert_count'] = int(match.group(1))

        return stats

    def get_results(self) -> dict:
        """Get the current results"""
        return self.results

    def to_json(self) -> str:
        """Convert results to JSON string"""
        return json.dumps(self.results, indent=2)

if __name__ == '__main__':
    # Example usage
    suricata = SuricataController(interface='eth0')  # Replace with your network interface
    results = suricata.start_monitoring(duration=10)
    print(json.dumps(results, indent=4))
