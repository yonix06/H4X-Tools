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

import json
import os
import re
import subprocess
import time
from datetime import datetime
from helper import printer, timer, randomuser
from colorama import Style

class VulnScanner:
    """
    Advanced network vulnerability scanner using Nmap and its NSE scripts.
    
    This tool requires Nmap to be installed on the system.
    - For Linux: apt-get install nmap
    - For Windows: download and install from https://nmap.org/download.html
    
    :param target: IP address, hostname, network range or URL to scan
    :param scan_type: Type of scan to perform (basic, vuln, all)
    :param intensity: Scan intensity (light, normal, aggressive)
    """
    @timer.timer
    def __init__(self, target, scan_type="vuln", intensity="normal") -> None:
        self.target = target
        self.scan_type = scan_type
        self.intensity = intensity
        self.results = {
            'status': 'initialized',
            'target': target,
            'scan_type': scan_type,
            'intensity': intensity,
            'vulnerabilities': [],
            'open_ports': [],
            'services': {},
            'os_detection': {},
            'stats': {},
            'start_time': datetime.now().isoformat(),
            'end_time': None,
            'errors': []
        }
        
        # Check if Nmap is installed
        if not self._check_nmap_installed():
            printer.error("Nmap is not installed or not in PATH")
            self.results['status'] = 'error'
            self.results['errors'].append('Nmap is not installed or not in PATH')
            return
        
        # Get Nmap version
        self.nmap_version = self._get_nmap_version()
        if self.nmap_version:
            printer.info(f"Nmap version: {Style.BRIGHT}{self.nmap_version}{Style.RESET_ALL}")
            self.results['stats']['nmap_version'] = self.nmap_version
        
        # Initialize scan
        printer.info(f"Initialized vulnerability scanner for target: {Style.BRIGHT}{target}{Style.RESET_ALL}")
        printer.info(f"Scan type: {Style.BRIGHT}{scan_type}{Style.RESET_ALL}, Intensity: {Style.BRIGHT}{intensity}{Style.RESET_ALL}")
        
        # Run the scan if all parameters are set
        if target:
            self.start_scan()
        else:
            self.results['status'] = 'ready'
            printer.info("Scanner initialized and ready. Call start_scan() to begin scanning.")
    
    def _check_nmap_installed(self) -> bool:
        """Check if Nmap is installed on the system"""
        try:
            subprocess.run(["nmap", "--version"], capture_output=True, text=True, check=False)
            return True
        except FileNotFoundError:
            return False
    
    def _get_nmap_version(self) -> str:
        """Get Nmap version"""
        try:
            result = subprocess.run(["nmap", "--version"], capture_output=True, text=True, check=False)
            match = re.search(r"Nmap version (\d+\.\d+\w*)", result.stdout)
            if match:
                return match.group(1)
            return "Unknown"
        except Exception:
            return "Unknown"
    
    def start_scan(self) -> dict:
        """
        Start the vulnerability scan with the configured parameters
        
        :return: Dictionary with scan results
        """
        if self.results['status'] == 'error':
            return self.results
            
        self.results['status'] = 'scanning'
        printer.info(f"Starting vulnerability scan on target: {Style.BRIGHT}{self.target}{Style.RESET_ALL}")
        
        # Build the nmap command based on scan type and intensity
        cmd = ["nmap"]
        
        # Add common options
        cmd.extend(["-oX", "-"])  # Output in XML format to stdout for parsing
        
        # Add scan type options
        if self.scan_type == "basic":
            cmd.extend(["-sV", "-sS"])  # Service detection and SYN scan
        elif self.scan_type == "vuln":
            cmd.extend(["-sV", "-sS", "--script", "vuln"])  # Vulnerability scripts
        elif self.scan_type == "all":
            cmd.extend(["-sV", "-sS", "-O", "--script", "default,vuln,auth,brute"])  # Comprehensive scan
        
        # Add intensity options
        if self.intensity == "light":
            cmd.extend(["-T2", "--min-rate", "100"])
        elif self.intensity == "normal":
            cmd.extend(["-T3", "--min-rate", "300"])
        elif self.intensity == "aggressive":
            cmd.extend(["-T4", "--min-rate", "800"])
        
        # Add the target
        cmd.append(self.target)
        
        # Log the command (hide in final output for security)
        printer.info(f"Running scan command (this may take a while)...")
        
        try:
            start_time = time.time()
            
            # Run the Nmap scan
            process = subprocess.run(
                cmd, 
                capture_output=True,
                text=True,
                check=False
            )
            
            scan_duration = time.time() - start_time
            self.results['stats']['duration'] = f"{scan_duration:.2f} seconds"
            
            # Check for errors
            if process.returncode != 0:
                printer.error(f"Nmap scan failed with code {process.returncode}")
                self.results['status'] = 'error'
                self.results['errors'].append(process.stderr)
                return self.results
            
            # Parse the XML output
            self._parse_nmap_xml(process.stdout)
            
            # Update status and timestamps
            self.results['status'] = 'completed'
            self.results['end_time'] = datetime.now().isoformat()
            
            # Print summary
            printer.success(f"Scan completed in {scan_duration:.2f} seconds")
            printer.info(f"Found {len(self.results['open_ports'])} open ports")
            printer.info(f"Detected {len(self.results['vulnerabilities'])} potential vulnerabilities")
            
            # Print top vulnerabilities if any
            if self.results['vulnerabilities']:
                printer.warning("Top vulnerabilities found:")
                top_vulns = sorted(self.results['vulnerabilities'], 
                                 key=lambda x: x.get('severity_score', 0), reverse=True)[:3]
                for v in top_vulns:
                    printer.warning(f"- {v.get('id', 'Unknown')}: {v.get('title', 'No title')} "
                                   f"(Severity: {v.get('severity', 'Unknown')})")
        
        except Exception as e:
            printer.error(f"Error during scan: {e}")
            self.results['status'] = 'error'
            self.results['errors'].append(str(e))
        
        return self.results
    
    def _parse_nmap_xml(self, xml_output):
        """Parse the Nmap XML output"""
        try:
            # Basic extraction using regex for key components
            # In a production environment, you'd want to use a proper XML parser
            
            # Extract hosts
            host_blocks = re.findall(r'<host[^>]*>.*?</host>', xml_output, re.DOTALL)
            
            for host_block in host_blocks:
                # Extract address
                addr_match = re.search(r'<address addr="([^"]*)"', host_block)
                if not addr_match:
                    continue
                
                host_ip = addr_match.group(1)
                
                # Extract hostname if available
                hostname = ""
                hostname_match = re.search(r'<hostname name="([^"]*)"', host_block)
                if hostname_match:
                    hostname = hostname_match.group(1)
                
                # Extract ports
                port_blocks = re.findall(r'<port[^>]*>.*?</port>', host_block, re.DOTALL)
                
                for port_block in port_blocks:
                    # Extract port number and protocol
                    port_match = re.search(r'<port protocol="([^"]*)" portid="([^"]*)"', port_block)
                    if not port_match:
                        continue
                    
                    protocol = port_match.group(1)
                    port_num = port_match.group(2)
                    
                    # Check if port is open
                    state_match = re.search(r'<state state="([^"]*)"', port_block)
                    if state_match and state_match.group(1) == "open":
                        self.results['open_ports'].append({
                            'port': port_num,
                            'protocol': protocol,
                            'host': host_ip
                        })
                    
                    # Extract service info
                    service_match = re.search(r'<service name="([^"]*)" product="([^"]*)" version="([^"]*)"', port_block)
                    if service_match:
                        service_name = service_match.group(1)
                        product = service_match.group(2)
                        version = service_match.group(3)
                        
                        port_key = f"{host_ip}:{port_num}/{protocol}"
                        self.results['services'][port_key] = {
                            'name': service_name,
                            'product': product,
                            'version': version
                        }
                    
                    # Extract script results (vulnerabilities)
                    script_blocks = re.findall(r'<script[^>]*>.*?</script>', port_block, re.DOTALL)
                    
                    for script_block in script_blocks:
                        script_id_match = re.search(r'id="([^"]*)"', script_block)
                        if not script_id_match:
                            continue
                        
                        script_id = script_id_match.group(1)
                        
                        # Check if this is a vulnerability script
                        if 'vuln' in script_id or 'exploit' in script_id or 'brute' in script_id:
                            output_match = re.search(r'output="([^"]*)"', script_block)
                            output = output_match.group(1) if output_match else ""
                            
                            # Attempt to extract CVE IDs
                            cve_ids = re.findall(r'(CVE-\d{4}-\d{4,})', output)
                            
                            # Try to determine severity
                            severity = "Unknown"
                            severity_score = 0
                            
                            if "HIGH" in output.upper():
                                severity = "High"
                                severity_score = 8
                            elif "MEDIUM" in output.upper():
                                severity = "Medium"
                                severity_score = 5
                            elif "LOW" in output.upper():
                                severity = "Low"
                                severity_score = 2
                            
                            # Extract any vulnerability title
                            title_match = re.search(r'TITLE:([^\n]*)', output, re.IGNORECASE)
                            title = title_match.group(1).strip() if title_match else script_id
                            
                            self.results['vulnerabilities'].append({
                                'id': script_id,
                                'port': port_num,
                                'service': service_match.group(1) if service_match else "unknown",
                                'host': host_ip,
                                'title': title,
                                'output': output,
                                'cve_ids': cve_ids,
                                'severity': severity,
                                'severity_score': severity_score
                            })
                
                # Extract OS detection info
                os_blocks = re.findall(r'<os>.*?</os>', host_block, re.DOTALL)
                if os_blocks:
                    os_matches = []
                    for os_block in os_blocks:
                        match_blocks = re.findall(r'<osmatch[^>]*>.*?</osmatch>', os_block, re.DOTALL)
                        for match_block in match_blocks:
                            name_match = re.search(r'name="([^"]*)"', match_block)
                            accuracy_match = re.search(r'accuracy="([^"]*)"', match_block)
                            
                            if name_match and accuracy_match:
                                os_matches.append({
                                    'name': name_match.group(1),
                                    'accuracy': accuracy_match.group(1)
                                })
                    
                    self.results['os_detection'][host_ip] = os_matches
            
            # Extract runtime stats
            stats_match = re.search(r'<finished time="([^"]*)" timestr="([^"]*)" elapsed="([^"]*)"', xml_output)
            if stats_match:
                self.results['stats']['elapsed'] = f"{stats_match.group(3)} seconds"
                self.results['stats']['time_str'] = stats_match.group(2)
        
        except Exception as e:
            printer.error(f"Error parsing Nmap XML output: {e}")
            self.results['errors'].append(f"XML parsing error: {str(e)}")
    
    def scan_for_known_threats(self) -> list:
        """
        Analyze scan results against known threat signatures
        
        :return: List of potential threats identified
        """
        threats = []
        
        # Common threat signatures based on service, version and ports
        threat_signatures = [
            {
                'name': 'EternalBlue SMB Vulnerability',
                'service': 'microsoft-ds|smb|netbios-ssn',
                'ports': [139, 445],
                'versions': [''],
                'severity': 'Critical'
            },
            {
                'name': 'OpenSSL Heartbleed',
                'service': 'http|https',
                'ports': [443, 8443],
                'versions': ['OpenSSL 1.0.1'],
                'severity': 'Critical'
            },
            {
                'name': 'Remote Desktop BlueKeep (CVE-2019-0708)',
                'service': 'ms-wbt-server',
                'ports': [3389],
                'versions': [''],
                'severity': 'Critical'
            },
            {
                'name': 'Exposed phpMyAdmin',
                'service': 'http|https',
                'ports': [80, 443, 8080, 8443],
                'versions': ['phpMyAdmin'],
                'severity': 'High'
            },
            {
                'name': 'SSH Weak Ciphers',
                'service': 'ssh',
                'ports': [22, 2222],
                'versions': [''],
                'severity': 'Medium'
            },
            {
                'name': 'Exposed FTP Server',
                'service': 'ftp',
                'ports': [21],
                'versions': [''],
                'severity': 'Medium'
            },
            {
                'name': 'Telnet Enabled',
                'service': 'telnet',
                'ports': [23],
                'versions': [''],
                'severity': 'High'
            },
            {
                'name': 'MongoDB No Auth',
                'service': 'mongodb',
                'ports': [27017],
                'versions': [''],
                'severity': 'High'
            }
        ]
        
        # Check open ports against threat signatures
        for port_info in self.results['open_ports']:
            port_num = int(port_info['port'])
            
            # Find the service for this port
            port_key = f"{port_info['host']}:{port_info['port']}/{port_info['protocol']}"
            service_info = self.results['services'].get(port_key, {})
            service_name = service_info.get('name', '')
            service_version = service_info.get('version', '')
            product = service_info.get('product', '')
            
            # Check each threat signature
            for signature in threat_signatures:
                # Check if port matches
                if port_num in signature['ports']:
                    # Check if service matches
                    service_regex = signature['service']
                    if re.search(service_regex, service_name, re.IGNORECASE):
                        # Check if version matches (if specified)
                        version_matched = True
                        if signature['versions'][0]:  # If there's a specific version to check
                            version_matched = False
                            for ver in signature['versions']:
                                if ver in service_version or ver in product:
                                    version_matched = True
                                    break
                        
                        if version_matched:
                            threats.append({
                                'name': signature['name'],
                                'severity': signature['severity'],
                                'host': port_info['host'],
                                'port': port_num,
                                'service': service_name,
                                'version': service_version,
                                'details': f"Detected {signature['name']} on {port_info['host']}:{port_num}"
                            })
        
        # Also check for CVEs in our vulnerabilities list
        for vuln in self.results['vulnerabilities']:
            if vuln.get('cve_ids'):
                for cve in vuln['cve_ids']:
                    threats.append({
                        'name': f"CVE Vulnerability: {cve}",
                        'severity': vuln.get('severity', 'Unknown'),
                        'host': vuln.get('host', ''),
                        'port': vuln.get('port', ''),
                        'service': vuln.get('service', ''),
                        'version': '',
                        'details': vuln.get('output', 'No details')
                    })
        
        # Sort by severity
        severity_order = {'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1, 'Unknown': 0}
        threats.sort(key=lambda x: severity_order.get(x['severity'], 0), reverse=True)
        
        return threats
    
    def get_results(self) -> dict:
        """Get the current scan results"""
        return self.results
    
    def to_json(self) -> str:
        """Convert results to JSON string"""
        return json.dumps(self.results, indent=2)