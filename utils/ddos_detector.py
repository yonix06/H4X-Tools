"""
 Copyright (c) 2023-2025. Vili and contributors.

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
"""

import os
import json
import time
import subprocess
import re
import socket
import threading
import queue
import psutil
from datetime import datetime, timedelta
from collections import Counter
from helper import printer, timer
from colorama import Style

class DDoSDetector:
    """
    DDoS Attack Detection and Analysis Tool.
    
    This tool monitors network traffic patterns to detect potential DDoS attacks.
    It can analyze live traffic or parse existing log files.
    
    :param interface: Network interface to monitor (default: auto-detect)
    :param threshold: Packet count threshold to trigger alerts (default: 1000)
    :param window: Time window in seconds for traffic analysis (default: 60)
    :param log_file: Path to log file for traffic analysis (optional)
    """
    @timer.timer
    def __init__(self, interface=None, threshold=1000, window=60, log_file=None) -> None:
        self.interface = interface
        self.threshold = threshold
        self.window = window
        self.log_file = log_file
        
        self.results = {
            'status': 'initialized',
            'alerts': [],
            'traffic_stats': {},
            'potential_attackers': [],
            'timeframes': [],
            'start_time': datetime.now().isoformat(),
            'end_time': None,
            'errors': []
        }
        
        # Initialize packet tracking
        self.packet_counts = Counter()
        self.connection_counts = Counter()
        self.syn_counts = Counter()
        self.traffic_history = []
        self.baseline = None
        
        # Queues for packet analysis
        self.packet_queue = queue.Queue()
        self.stop_event = threading.Event()
        
        # Check required tools
        if not self._check_tools():
            printer.error("Required tools not found. Please install tcpdump.")
            self.results['status'] = 'error'
            self.results['errors'].append('Required tools not found. Please install tcpdump.')
            return
        
        # Determine network interface if not specified
        if not interface and not log_file:
            self.interface = self._detect_default_interface()
            printer.info(f"Auto-detected network interface: {Style.BRIGHT}{self.interface}{Style.RESET_ALL}")
        
        # Initialize status
        self.results['status'] = 'ready'
        if log_file:
            printer.info(f"DDoS detector initialized with log file: {Style.BRIGHT}{log_file}{Style.RESET_ALL}")
        else:
            printer.info(f"DDoS detector initialized. Ready to monitor interface {Style.BRIGHT}{self.interface}{Style.RESET_ALL}")
    
    def _check_tools(self) -> bool:
        """Check if required tools are installed"""
        try:
            subprocess.run(["tcpdump", "--version"], capture_output=True, text=True, check=False)
            return True
        except FileNotFoundError:
            return False
    
    def _detect_default_interface(self) -> str:
        """Auto-detect the default network interface"""
        if os.name == 'posix':  # Linux/Unix
            try:
                # Try to get the interface with the default route
                result = subprocess.run(
                    ["ip", "route", "show", "default"], 
                    capture_output=True, 
                    text=True, 
                    check=False
                )
                match = re.search(r"dev\s+(\w+)", result.stdout)
                if match:
                    return match.group(1)
                
                # Fallback to the first non-loopback interface
                interfaces = psutil.net_if_addrs()
                for iface, addrs in interfaces.items():
                    if iface != 'lo':
                        for addr in addrs:
                            if addr.family == socket.AF_INET:
                                return iface
                
            except Exception as e:
                printer.error(f"Error detecting default interface: {e}")
            
            return "eth0"  # Default fallback
        
        elif os.name == 'nt':  # Windows
            return "Ethernet"  # Default Windows interface name
        
        return "eth0"  # Generic fallback
    
    def start_monitoring(self, duration=300) -> dict:
        """
        Start monitoring network traffic for potential DDoS attacks
        
        :param duration: Monitoring duration in seconds (default: 300)
        :return: Dictionary with monitoring results
        """
        if self.results['status'] == 'error':
            return self.results
            
        self.results['status'] = 'monitoring'
        printer.info(f"Starting DDoS detection on interface {Style.BRIGHT}{self.interface}{Style.RESET_ALL} for {duration} seconds")
        printer.info(f"Alert threshold: {Style.BRIGHT}{self.threshold}{Style.RESET_ALL} packets per {self.window} seconds")
        
        # Start packet capture thread
        capture_thread = threading.Thread(target=self._capture_packets, args=(duration,))
        capture_thread.daemon = True
        capture_thread.start()
        
        # Start analysis thread
        analysis_thread = threading.Thread(target=self._analyze_traffic)
        analysis_thread.daemon = True
        analysis_thread.start()
        
        try:
            # Wait for the duration
            start_time = time.time()
            while time.time() - start_time < duration and not self.stop_event.is_set():
                time.sleep(1)
                
                # Print status every 30 seconds
                if int(time.time() - start_time) % 30 == 0 and int(time.time() - start_time) > 0:
                    self._print_status()
            
            # Stop threads
            self.stop_event.set()
            
            # Wait for threads to finish
            capture_thread.join(timeout=5)
            analysis_thread.join(timeout=5)
            
            # Finalize results
            self.results['status'] = 'completed'
            self.results['end_time'] = datetime.now().isoformat()
            self.results['duration'] = time.time() - start_time
            
            # Calculate traffic stats
            self._calculate_traffic_stats()
            
            # Identify potential attackers
            self._identify_attackers()
            
            # Print summary
            self._print_summary()
            
        except KeyboardInterrupt:
            printer.warning("Monitoring interrupted by user")
            self.stop_event.set()
            self.results['status'] = 'interrupted'
            
        except Exception as e:
            printer.error(f"Error during monitoring: {e}")
            self.stop_event.set()
            self.results['status'] = 'error'
            self.results['errors'].append(str(e))
        
        return self.results
    
    def _capture_packets(self, duration):
        """Capture network packets using tcpdump"""
        try:
            # Build the command
            cmd = ["sudo", "tcpdump", "-i", self.interface, "-nn", "-q"]
            
            # Start the process
            process = subprocess.Popen(
                cmd, 
                stdout=subprocess.PIPE, 
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1
            )
            
            # Process output in real-time with timeout
            start_time = time.time()
            while process.poll() is None and time.time() - start_time < duration and not self.stop_event.is_set():
                line = process.stdout.readline()
                if line:
                    self.packet_queue.put(line)
            
            # Terminate the process
            if process.poll() is None:
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
            
        except Exception as e:
            printer.error(f"Error in packet capture: {e}")
            self.results['errors'].append(f"Packet capture error: {str(e)}")
            self.stop_event.set()
    
    def _analyze_traffic(self):
        """Analyze network traffic for DDoS patterns"""
        window_packets = []
        current_window_start = time.time()
        
        while not self.stop_event.is_set():
            try:
                # Get packet from queue with timeout
                try:
                    packet_line = self.packet_queue.get(timeout=1)
                except queue.Empty:
                    # Check if window should be processed
                    if time.time() - current_window_start >= self.window:
                        self._process_window(window_packets, current_window_start)
                        window_packets = []
                        current_window_start = time.time()
                    continue
                
                # Parse packet info
                parsed = self._parse_packet(packet_line)
                if parsed:
                    window_packets.append(parsed)
                    
                    # Update counters
                    src_ip = parsed.get('src_ip')
                    if src_ip:
                        self.packet_counts[src_ip] += 1
                        
                        # Count SYN packets (potential SYN flood)
                        if parsed.get('flags') and 'S' in parsed.get('flags') and 'A' not in parsed.get('flags'):
                            self.syn_counts[src_ip] += 1
                
                # Check if window should be processed
                if time.time() - current_window_start >= self.window:
                    self._process_window(window_packets, current_window_start)
                    window_packets = []
                    current_window_start = time.time()
                
            except Exception as e:
                printer.error(f"Error in traffic analysis: {e}")
                self.results['errors'].append(f"Traffic analysis error: {str(e)}")
    
    def _parse_packet(self, packet_line):
        """Parse a tcpdump packet line"""
        try:
            # Extract timestamp
            timestamp_match = re.search(r"(\d{2}:\d{2}:\d{2}\.\d+)", packet_line)
            timestamp = timestamp_match.group(1) if timestamp_match else ""
            
            # Extract IP addresses and ports
            ip_pattern = r"(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\.?(\d*) > (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\.?(\d*)"
            ip_match = re.search(ip_pattern, packet_line)
            
            if ip_match:
                src_ip = ip_match.group(1)
                src_port = ip_match.group(2)
                dst_ip = ip_match.group(3)
                dst_port = ip_match.group(4)
                
                # Extract protocol and flags
                protocol = ""
                flags = ""
                
                if "TCP" in packet_line or "tcp" in packet_line:
                    protocol = "TCP"
                    flags_match = re.search(r"\[(\w+)", packet_line)
                    flags = flags_match.group(1) if flags_match else ""
                elif "UDP" in packet_line or "udp" in packet_line:
                    protocol = "UDP"
                elif "ICMP" in packet_line or "icmp" in packet_line:
                    protocol = "ICMP"
                
                # Extract packet size
                size_match = re.search(r"length (\d+)", packet_line)
                size = int(size_match.group(1)) if size_match else 0
                
                return {
                    'timestamp': timestamp,
                    'src_ip': src_ip,
                    'src_port': src_port,
                    'dst_ip': dst_ip,
                    'dst_port': dst_port,
                    'protocol': protocol,
                    'flags': flags,
                    'size': size
                }
            
        except Exception as e:
            printer.error(f"Error parsing packet: {e}")
        
        return None
    
    def _process_window(self, packets, window_start):
        """Process a time window of packets to detect DDoS patterns"""
        if not packets:
            return
        
        # Count packets per source IP
        ip_counts = Counter()
        port_counts = Counter()
        protocol_counts = Counter()
        
        for packet in packets:
            ip_counts[packet['src_ip']] += 1
            
            # Count destination ports (for port scanning)
            if packet['dst_port']:
                port_key = f"{packet['dst_ip']}:{packet['dst_port']}"
                port_counts[port_key] += 1
            
            # Count protocols
            if packet['protocol']:
                protocol_counts[packet['protocol']] += 1
        
        # Store window stats for historical analysis
        window_stats = {
            'start_time': datetime.fromtimestamp(window_start).isoformat(),
            'end_time': datetime.fromtimestamp(window_start + self.window).isoformat(),
            'packet_count': len(packets),
            'unique_sources': len(ip_counts),
            'top_sources': dict(ip_counts.most_common(5)),
            'protocols': dict(protocol_counts),
            'alerts': []
        }
        
        # Check for DDoS patterns
        
        # 1. High packet volume from single source (DoS)
        for ip, count in ip_counts.items():
            if count > self.threshold:
                alert = {
                    'type': 'high_volume',
                    'source_ip': ip,
                    'packet_count': count,
                    'timestamp': datetime.fromtimestamp(window_start).isoformat(),
                    'description': f"High traffic volume detected from {ip}: {count} packets in {self.window} seconds"
                }
                window_stats['alerts'].append(alert)
                self.results['alerts'].append(alert)
                printer.warning(f"Potential DoS attack detected from {Style.BRIGHT}{ip}{Style.RESET_ALL}: {count} packets in {self.window} seconds")
        
        # 2. Connection flood detection (many connections to same port)
        for port_key, count in port_counts.items():
            if count > self.threshold / 2:  # Lower threshold for connection flood
                dst_ip, dst_port = port_key.split(':')
                alert = {
                    'type': 'connection_flood',
                    'target_ip': dst_ip,
                    'target_port': dst_port,
                    'connection_count': count,
                    'timestamp': datetime.fromtimestamp(window_start).isoformat(),
                    'description': f"Connection flood detected to {dst_ip}:{dst_port}: {count} connections in {self.window} seconds"
                }
                window_stats['alerts'].append(alert)
                self.results['alerts'].append(alert)
                printer.warning(f"Potential connection flood attack detected to {Style.BRIGHT}{dst_ip}:{dst_port}{Style.RESET_ALL}: {count} connections in {self.window} seconds")
        
        # 3. SYN flood detection (based on data collected in _analyze_traffic)
        for ip, count in self.syn_counts.items():
            if count > self.threshold / 3:  # Lower threshold for SYN flood
                alert = {
                    'type': 'syn_flood',
                    'source_ip': ip,
                    'syn_count': count,
                    'timestamp': datetime.fromtimestamp(window_start).isoformat(),
                    'description': f"SYN flood detected from {ip}: {count} SYN packets in {self.window} seconds"
                }
                window_stats['alerts'].append(alert)
                self.results['alerts'].append(alert)
                printer.warning(f"Potential SYN flood attack detected from {Style.BRIGHT}{ip}{Style.RESET_ALL}: {count} SYN packets in {self.window} seconds")
                
                # Reset counter for next window
                self.syn_counts[ip] = 0
        
        # Add window stats to history
        self.traffic_history.append(window_stats)
        self.results['timeframes'].append(window_stats)
    
    def _calculate_traffic_stats(self):
        """Calculate overall traffic statistics"""
        # Initialize stats
        stats = {
            'total_packets': sum(len(window['top_sources']) for window in self.traffic_history),
            'total_alerts': len(self.results['alerts']),
            'unique_sources': set(),
            'protocol_distribution': Counter(),
            'peak_traffic': {
                'packets': 0,
                'window': None
            },
            'average_packets_per_window': 0
        }
        
        # Process each window
        for window in self.traffic_history:
            # Add unique sources
            stats['unique_sources'].update(window['top_sources'].keys())
            
            # Add protocol counts
            for protocol, count in window['protocols'].items():
                stats['protocol_distribution'][protocol] += count
            
            # Check for peak traffic
            if window['packet_count'] > stats['peak_traffic']['packets']:
                stats['peak_traffic']['packets'] = window['packet_count']
                stats['peak_traffic']['window'] = window['start_time']
        
        # Calculate average
        if self.traffic_history:
            stats['average_packets_per_window'] = sum(w['packet_count'] for w in self.traffic_history) / len(self.traffic_history)
        
        # Convert sets to lists for JSON serialization
        stats['unique_sources'] = list(stats['unique_sources'])
        stats['protocol_distribution'] = dict(stats['protocol_distribution'])
        
        self.results['traffic_stats'] = stats
    
    def _identify_attackers(self):
        """Identify potential attackers based on traffic patterns"""
        # Count alerts by source IP
        alert_counts = Counter()
        for alert in self.results['alerts']:
            if 'source_ip' in alert:
                alert_counts[alert['source_ip']] += 1
        
        # Calculate total packets by source IP across all windows
        packet_totals = Counter()
        for window in self.traffic_history:
            for ip, count in window['top_sources'].items():
                packet_totals[ip] += count
        
        # Identify potential attackers
        attackers = []
        for ip, count in packet_totals.most_common(10):  # Top 10 sources
            attack_types = []
            
            # Check different attack patterns
            if ip in alert_counts:
                # Check specific attack types
                for alert in self.results['alerts']:
                    if alert.get('source_ip') == ip and alert['type'] not in attack_types:
                        attack_types.append(alert['type'])
            
            # Only include IPs with alerts or very high packet counts
            if attack_types or count > self.threshold * 2:
                attackers.append({
                    'ip': ip,
                    'total_packets': count,
                    'alert_count': alert_counts.get(ip, 0),
                    'attack_types': attack_types,
                    'confidence': 'High' if alert_counts.get(ip, 0) > 3 else 'Medium' if alert_counts.get(ip, 0) > 0 else 'Low'
                })
        
        self.results['potential_attackers'] = attackers
    
    def _print_status(self):
        """Print current monitoring status"""
        elapsed = time.time() - datetime.fromisoformat(self.results['start_time']).timestamp()
        printer.info(f"Monitoring for {int(elapsed)} seconds | " 
                    f"Packets: {sum(self.packet_counts.values())} | "
                    f"Alerts: {len(self.results['alerts'])}")
    
    def _print_summary(self):
        """Print summary of monitoring results"""
        stats = self.results['traffic_stats']
        attackers = self.results['potential_attackers']
        
        printer.success(f"DDoS detection completed after {int(self.results['duration'])} seconds")
        printer.info(f"Total packets analyzed: {stats['total_packets']}")
        printer.info(f"Peak traffic: {stats['peak_traffic']['packets']} packets")
        printer.info(f"Total alerts generated: {stats['total_alerts']}")
        
        if attackers:
            printer.warning(f"Identified {len(attackers)} potential attackers:")
            for i, attacker in enumerate(attackers[:5], 1):  # Show top 5
                printer.warning(f"{i}. {Style.BRIGHT}{attacker['ip']}{Style.RESET_ALL} - "
                               f"{attacker['total_packets']} packets, "
                               f"{attacker['alert_count']} alerts, "
                               f"Confidence: {attacker['confidence']}")
        else:
            printer.info("No potential attackers identified")
    
    def analyze_log_file(self) -> dict:
        """
        Analyze a tcpdump log file for DDoS patterns
        
        :return: Dictionary with analysis results
        """
        if not self.log_file:
            printer.error("No log file specified")
            self.results['status'] = 'error'
            self.results['errors'].append('No log file specified')
            return self.results
            
        if not os.path.exists(self.log_file):
            printer.error(f"Log file not found: {self.log_file}")
            self.results['status'] = 'error'
            self.results['errors'].append(f'Log file not found: {self.log_file}')
            return self.results
        
        printer.info(f"Analyzing log file: {Style.BRIGHT}{self.log_file}{Style.RESET_ALL}")
        self.results['status'] = 'analyzing'
        
        try:
            # Read log file
            with open(self.log_file, 'r') as f:
                lines = f.readlines()
            
            printer.info(f"Processing {len(lines)} log entries")
            
            # Process log entries in time windows
            window_packets = []
            current_window_start = None
            
            for line in lines:
                parsed = self._parse_packet(line)
                if not parsed:
                    continue
                
                # Extract timestamp and convert to datetime
                time_obj = None
                if parsed['timestamp']:
                    try:
                        # Assume timestamp is in format HH:MM:SS.ssssss
                        # We need to add a date since the log might not have it
                        today = datetime.now().date()
                        time_parts = parsed['timestamp'].split(':')
                        if len(time_parts) == 3:
                            h, m, s = time_parts
                            s = float(s)
                            time_obj = datetime.combine(today, datetime.min.time()) + \
                                      timedelta(hours=int(h), minutes=int(m), seconds=s)
                    except Exception:
                        pass
                
                # If we couldn't extract a timestamp, use a synthetic one
                if time_obj is None:
                    if current_window_start is None:
                        current_window_start = datetime.now() - timedelta(hours=1)  # Start an hour ago
                        
                    time_obj = current_window_start + timedelta(seconds=len(window_packets) * 0.001)
                
                # Initialize window start if needed
                if current_window_start is None:
                    current_window_start = time_obj
                
                # Check if we need to process this window
                window_duration = (time_obj - current_window_start).total_seconds()
                if window_duration >= self.window:
                    self._process_window(window_packets, current_window_start.timestamp())
                    window_packets = []
                    current_window_start = time_obj
                
                # Add packet to current window
                window_packets.append(parsed)
                
                # Update counters
                src_ip = parsed.get('src_ip')
                if src_ip:
                    self.packet_counts[src_ip] += 1
                    
                    # Count SYN packets (potential SYN flood)
                    if parsed.get('flags') and 'S' in parsed.get('flags') and 'A' not in parsed.get('flags'):
                        self.syn_counts[src_ip] += 1
            
            # Process the last window if it has packets
            if window_packets and current_window_start:
                self._process_window(window_packets, current_window_start.timestamp())
            
            # Calculate traffic stats
            self._calculate_traffic_stats()
            
            # Identify potential attackers
            self._identify_attackers()
            
            # Update status
            self.results['status'] = 'completed'
            self.results['end_time'] = datetime.now().isoformat()
            
            # Print summary
            self._print_summary()
            
        except Exception as e:
            printer.error(f"Error analyzing log file: {e}")
            self.results['status'] = 'error'
            self.results['errors'].append(str(e))
        
        return self.results
    
    def get_results(self) -> dict:
        """Get the current results"""
        return self.results
    
    def to_json(self) -> str:
        """Convert results to JSON string"""
        return json.dumps(self.results, indent=2)