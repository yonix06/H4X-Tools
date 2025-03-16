"""
Security monitoring utility for H4X-Tools
Handles system-level security checks and monitoring
"""

import subprocess
import json
import re
from datetime import datetime
import os
from typing import Dict, List, Optional, Union

class SecurityMonitor:
    def __init__(self):
        self.fail2ban_path = self._find_fail2ban_client()
        self.vpn_service = self._detect_vpn_service()

    def _find_fail2ban_client(self) -> str:
        """Find the fail2ban-client executable"""
        possible_paths = [
            '/usr/bin/fail2ban-client',
            '/usr/local/bin/fail2ban-client',
            '/opt/fail2ban/bin/fail2ban-client'
        ]
        for path in possible_paths:
            if os.path.exists(path):
                return path
        return 'fail2ban-client'  # Fall back to PATH lookup

    def _detect_vpn_service(self) -> str:
        """Detect which VPN service is running"""
        vpn_services = ['openvpn', 'wireguard']
        for service in vpn_services:
            try:
                result = subprocess.run(['systemctl', 'status', service], 
                                     capture_output=True, text=True)
                if 'active (running)' in result.stdout:
                    return service
            except Exception:
                continue
        return 'openvpn'  # Default to OpenVPN

    def get_fail2ban_status(self) -> Dict[str, Union[str, Dict[str, int]]]:
        """Get fail2ban status including all jails and their banned IPs"""
        try:
            # Get list of jails
            result = subprocess.run([self.fail2ban_path, 'status'], 
                                 capture_output=True, text=True)
            if result.returncode != 0:
                raise Exception(f"fail2ban-client failed: {result.stderr}")

            # Parse jail names
            jail_names = []
            for line in result.stdout.split('\n'):
                if 'Jail list:' in line:
                    jail_names = line.split(':')[1].strip().split(', ')
                    break

            # Get status for each jail
            jails_status = {}
            for jail in jail_names:
                if not jail:
                    continue
                jail_result = subprocess.run(
                    [self.fail2ban_path, 'status', jail],
                    capture_output=True, text=True
                )
                if jail_result.returncode == 0:
                    # Extract number of banned IPs
                    banned_count = 0
                    for line in jail_result.stdout.split('\n'):
                        if 'Currently banned:' in line:
                            banned_count = int(line.split(':')[1].strip())
                            break
                    jails_status[jail] = banned_count

            return {
                'status': 'active' if jails_status else 'inactive',
                'jails': jails_status,
                'timestamp': datetime.now().isoformat()
            }

        except Exception as e:
            return {
                'status': 'error',
                'message': str(e),
                'timestamp': datetime.now().isoformat()
            }

    def get_vpn_status(self) -> Dict[str, Union[bool, List[str], str]]:
        """Get VPN connection status and active connections"""
        try:
            # Check VPN service status
            result = subprocess.run(['systemctl', 'status', self.vpn_service], 
                                 capture_output=True, text=True)
            is_active = 'active (running)' in result.stdout

            # Get active connections if VPN is running
            connections = []
            if is_active:
                if self.vpn_service == 'openvpn':
                    # Check OpenVPN status log
                    status_files = [
                        '/var/log/openvpn/status.log',
                        '/etc/openvpn/openvpn-status.log'
                    ]
                    for status_file in status_files:
                        if os.path.exists(status_file):
                            with open(status_file, 'r') as f:
                                content = f.read()
                                # Extract connected clients
                                client_section = False
                                for line in content.split('\n'):
                                    if 'Connected Since' in line:
                                        client_section = True
                                        continue
                                    if client_section and ',' in line:
                                        client = line.split(',')[0].strip()
                                        if client and not client.startswith('ROUTING'):
                                            connections.append(client)
                elif self.vpn_service == 'wireguard':
                    # Get WireGuard connections
                    result = subprocess.run(['wg', 'show'], 
                                         capture_output=True, text=True)
                    if result.returncode == 0:
                        for line in result.stdout.split('\n'):
                            if 'peer:' in line.lower():
                                connections.append(line.split(':')[1].strip())

            return {
                'is_active': is_active,
                'service': self.vpn_service,
                'connections': connections,
                'last_check': datetime.now().isoformat()
            }

        except Exception as e:
            return {
                'is_active': False,
                'service': self.vpn_service,
                'error': str(e),
                'last_check': datetime.now().isoformat()
            }

    def get_banned_ips(self, jail: Optional[str] = None) -> List[Dict[str, str]]:
        """Get list of banned IPs from fail2ban with details"""
        try:
            banned_ips = []
            
            if jail:
                jails = [jail]
            else:
                # Get all jails if none specified
                result = subprocess.run([self.fail2ban_path, 'status'], 
                                     capture_output=True, text=True)
                jails = []
                for line in result.stdout.split('\n'):
                    if 'Jail list:' in line:
                        jails = line.split(':')[1].strip().split(', ')
                        break

            for current_jail in jails:
                if not current_jail:
                    continue
                    
                # Get banned IPs for the jail
                result = subprocess.run(
                    [self.fail2ban_path, 'get', current_jail, 'banned'],
                    capture_output=True, text=True
                )
                
                if result.returncode == 0:
                    ips = result.stdout.strip().split('\n')
                    for ip in ips:
                        if ip:
                            # Get ban time info
                            time_result = subprocess.run(
                                [self.fail2ban_path, 'get', current_jail, 'bantime', ip],
                                capture_output=True, text=True
                            )
                            ban_time = time_result.stdout.strip() if time_result.returncode == 0 else 'unknown'
                            
                            banned_ips.append({
                                'ip': ip,
                                'jail': current_jail,
                                'ban_time': ban_time,
                                'timestamp': datetime.now().isoformat()
                            })

            return banned_ips

        except Exception as e:
            return []

    def unban_ip(self, ip: str, jail: Optional[str] = None) -> bool:
        """Unban an IP address from fail2ban"""
        try:
            if jail:
                # Unban from specific jail
                result = subprocess.run(
                    [self.fail2ban_path, 'set', jail, 'unbanip', ip],
                    capture_output=True, text=True
                )
                return result.returncode == 0
            else:
                # Unban from all jails
                success = False
                result = subprocess.run([self.fail2ban_path, 'status'], 
                                     capture_output=True, text=True)
                for line in result.stdout.split('\n'):
                    if 'Jail list:' in line:
                        jails = line.split(':')[1].strip().split(', ')
                        for j in jails:
                            if j:
                                unban_result = subprocess.run(
                                    [self.fail2ban_path, 'set', j, 'unbanip', ip],
                                    capture_output=True, text=True
                                )
                                success = success or (unban_result.returncode == 0)
                return success
        except Exception:
            return False