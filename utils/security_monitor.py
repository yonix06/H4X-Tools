"""
Security monitoring utility for H4X-Tools
Handles system-level security checks and monitoring
"""

import subprocess
import json
import re
from datetime import datetime
import os
from typing import Dict, List, Optional, Union, Any

class SecurityMonitor:
    def __init__(self):
        self.fail2ban_path = '/etc/fail2ban'
        self.vpn_service = 'openvpn'

    def get_fail2ban_status(self) -> Dict[str, Any]:
        """Get fail2ban status including active jails and statistics"""
        try:
            # Check fail2ban service status
            service_status = subprocess.run(
                ['systemctl', 'is-active', 'fail2ban'],
                capture_output=True,
                text=True
            )
            
            # Get jail status
            jail_status = subprocess.run(
                ['fail2ban-client', 'status'],
                capture_output=True,
                text=True
            )
            
            # Parse jail list
            jail_list = []
            if jail_status.returncode == 0:
                # Extract jail names from status output
                match = re.search(r'Jail list:\s+([^\n]+)', jail_status.stdout)
                if match:
                    jail_list = [j.strip() for j in match.group(1).split(',')]

            # Get detailed status for each jail
            jails = {}
            for jail in jail_list:
                jail_detail = subprocess.run(
                    ['fail2ban-client', 'status', jail],
                    capture_output=True,
                    text=True
                )
                if jail_detail.returncode == 0:
                    jails[jail] = self._parse_jail_status(jail_detail.stdout)

            return {
                'status': 'active' if service_status.returncode == 0 else 'inactive',
                'jails': jails,
                'total_banned': sum(jail.get('currently_banned', 0) for jail in jails.values()),
                'total_failed': sum(jail.get('total_failed', 0) for jail in jails.values()),
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    def get_vpn_status(self) -> Dict[str, Any]:
        """Get VPN connection status and active connections"""
        try:
            # Check VPN service status
            service_status = subprocess.run(
                ['systemctl', 'is-active', self.vpn_service],
                capture_output=True,
                text=True
            )
            
            # Get active connections
            connections = []
            if service_status.returncode == 0:
                conn_status = subprocess.run(
                    ['netstat', '-n', '-W'],
                    capture_output=True,
                    text=True
                )
                if conn_status.returncode == 0:
                    # Parse netstat output for VPN connections
                    for line in conn_status.stdout.split('\n'):
                        if ':1194' in line:  # OpenVPN default port
                            parts = line.split()
                            if len(parts) >= 5:
                                connections.append(parts[4])

            return {
                'is_active': service_status.returncode == 0,
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

    def get_banned_ips(self, jail: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get list of banned IPs across all or specific jails"""
        banned_ips = []
        try:
            if jail:
                jails = [jail]
            else:
                # Get all jails
                jail_list = subprocess.run(
                    ['fail2ban-client', 'status'],
                    capture_output=True,
                    text=True
                )
                if jail_list.returncode == 0:
                    match = re.search(r'Jail list:\s+([^\n]+)', jail_list.stdout)
                    jails = [j.strip() for j in match.group(1).split(',')] if match else []

            # Get banned IPs for each jail
            for j in jails:
                banned = subprocess.run(
                    ['fail2ban-client', 'status', j],
                    capture_output=True,
                    text=True
                )
                if banned.returncode == 0:
                    status = self._parse_jail_status(banned.stdout)
                    if status.get('banned_ips'):
                        for ip in status['banned_ips']:
                            banned_ips.append({
                                'ip': ip,
                                'jail': j,
                                'ban_time': status.get('ban_time', '600'),
                                'timestamp': datetime.now().isoformat()
                            })

        except Exception as e:
            print(f"Error getting banned IPs: {e}")
        
        return banned_ips

    def unban_ip(self, ip: str, jail: Optional[str] = None) -> bool:
        """Unban an IP from fail2ban jail(s)"""
        try:
            if jail:
                # Unban from specific jail
                result = subprocess.run(
                    ['fail2ban-client', 'set', jail, 'unbanip', ip],
                    capture_output=True,
                    text=True
                )
                return result.returncode == 0
            else:
                # Unban from all jails
                success = True
                jail_list = subprocess.run(
                    ['fail2ban-client', 'status'],
                    capture_output=True,
                    text=True
                )
                if jail_list.returncode == 0:
                    match = re.search(r'Jail list:\s+([^\n]+)', jail_list.stdout)
                    if match:
                        jails = [j.strip() for j in match.group(1).split(',')]
                        for j in jails:
                            result = subprocess.run(
                                ['fail2ban-client', 'set', j, 'unbanip', ip],
                                capture_output=True,
                                text=True
                            )
                            if result.returncode != 0:
                                success = False
                return success
        except Exception as e:
            print(f"Error unbanning IP {ip}: {e}")
            return False

    def _parse_jail_status(self, status_output: str) -> Dict[str, Any]:
        """Parse fail2ban jail status output into structured data"""
        status = {}
        try:
            lines = status_output.split('\n')
            for line in lines:
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip().lower().replace(' ', '_')
                    value = value.strip()
                    
                    # Convert numeric values
                    if value.isdigit():
                        value = int(value)
                    elif value.replace('.', '').isdigit():
                        value = float(value)
                    
                    # Parse banned IP list
                    if key == 'banned_ip_list':
                        value = [ip.strip() for ip in value.split()]
                        
                    status[key] = value
        except Exception as e:
            print(f"Error parsing jail status: {e}")
            
        return status