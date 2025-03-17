#!/usr/bin/env python3
import os
import sys
import socket
import netifaces  # We'll need to add this to requirements.txt
import psutil
from datetime import datetime
from flask import request, jsonify

from dotenv import load_dotenv
import importlib.util
from models.database import db
from app import app
from utils.whois_lookup import Lookup as WhoisLookup
from utils.security_monitor import SecurityMonitor
from models.models import ToolResult, Investigation, InvestigationNote, SecurityEvent

# Load environment variables
load_dotenv()

# Add the parent directory to Python path to find the utils module
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root_dir)
print(f"Adding to Python path: {root_dir}")

# Dictionary to store available tools and their status
available_tools = {}

def import_tool(module_name, tool_id=None):
    """Import a tool module dynamically"""
    try:
        spec = importlib.util.spec_from_file_location(
            module_name,
            os.path.join(root_dir, 'utils', f'{module_name}.py')
        )
        if spec is None or spec.loader is None:
            print(f"Failed to load spec for {module_name}")
            return None

        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        available_tools[tool_id or module_name] = {'status': 'available', 'module': module}
        return module
    except Exception as e:
        print(f"Error importing {module_name}: {e}")
        available_tools[tool_id or module_name] = {'status': 'error', 'error': str(e)}
        return None

# Import tools with error handling
tools = {
    'ig_scrape': import_tool('ig_scrape', 'ig_scrape'),
    'web_search': import_tool('websearch', 'web_search'),
    'phone_lookup': import_tool('phonenumber_lookup', 'phone_lookup'),
    'ip_lookup': import_tool('ip_lookup', 'ip_lookup'),
    'port_scanner': import_tool('port_scanner', 'port_scanner'),
    'username_search': import_tool('search_username', 'username_search'),
    'cybercrime_int': import_tool('cybercrime_int', 'cybercrime_int'),
    'email_search': import_tool('email_search', 'email_search'),
    'webhook_spammer': import_tool('webhook_spammer', 'webhook_spammer'),
    'whois_lookup': import_tool('whois_lookup', 'whois_lookup'),
    'fake_info': import_tool('fake_info_generator', 'fake_info'),
    'web_scrape': import_tool('web_scrape', 'web_scrape'),
    'wifi_finder': import_tool('wifi_finder', 'wifi_finder'),
    'wifi_vault': import_tool('wifi_vault', 'wifi_vault'),
    'dirbuster': import_tool('dirbuster', 'dirbuster'),
    'local_user_enum': import_tool('local_user_enum', 'local_user_enum'),
    'caesar_cipher': import_tool('caesar_cipher', 'caesar_cipher'),
    'basexx': import_tool('basexx', 'basexx'),
    'snort_ids': import_tool('snort_ids', 'snort_ids'),
    'ddos_detector': import_tool('ddos_detector', 'ddos_detector'),
    'vuln_scanner': import_tool('vuln_scanner', 'vuln_scanner')
}

def execute_snort_ids(data):
    """Executes the Snort IDS tool."""
    interface = data.get('interface')
    duration = data.get('duration')
    if not interface:
        raise ValueError('Interface is required')
    if not duration:
        duration = 60  # Default duration
    snort = tools['snort_ids']['module'].SnortController(interface=interface)
    return snort.start_monitoring(duration=duration)

def execute_web_search(data):
    """Executes the Web Search tool."""
    query = data.get('query')
    if not query:
        raise ValueError('Query is required')
    search = tools['web_search']['module'].Search(query)
    return search.__dict__

def execute_whois_lookup(data):
    """Executes the Whois Lookup tool."""
    domain = data.get('domain')
    if not domain:
        raise ValueError('Domain is required')
    lookup = WhoisLookup(domain)
    return lookup.q.__dict__

def execute_leak_search(data):
    """Executes the Leak Search tool."""
    target = data.get('target')
    if not target:
        raise ValueError('Email or Domain is required')
    search = tools['leak_search']['module'].Scan(target)
    return search.__dict__

def execute_ddos_detector(data):
    """Executes the DDoS Detector tool."""
    interface = data.get('interface')
    threshold = data.get('threshold')
    window = data.get('window')
    log_file = data.get('log_file')

    ddos_detector = tools['ddos_detector']['module'].DDoSDetector(
        interface=interface,
        threshold=threshold,
        window=window,
        log_file=log_file
    )

    if log_file:
        return ddos_detector.analyze_log_file()
    else:
        duration = data.get('duration', 300)  # Default duration
        return ddos_detector.start_monitoring(duration=duration)

def execute_vuln_scanner(data):
    """Executes the VulnScanner tool."""
    target = data.get('target')
    scan_type = data.get('scan_type', 'vuln')
    intensity = data.get('intensity', 'normal')

    vuln_scanner = tools['vuln_scanner']['module'].VulnScanner(
        target=target,
        scan_type=scan_type,
        intensity=intensity
    )
    return vuln_scanner.start_scan()

def execute_basexx(data):
    """Executes the BaseXX tool."""
    message = data.get('message')
    mode = data.get('mode')
    encoding = data.get('encoding')
    if not message or not mode or not encoding:
        raise ValueError('Message, mode, and encoding are required')
    basexx = tools['basexx']['module'].BaseXX(message, mode, encoding)
    return basexx.__dict__

TOOL_EXECUTORS = {
    'ip-lookup': lambda data: tools['ip_lookup']['module'].Lookup(data.get('ip')).__dict__,
    'whois-lookup': execute_whois_lookup,
    'web-search': execute_web_search,
    'leak-search': execute_leak_search,
    'basexx': execute_basexx,
    'snort-ids': execute_snort_ids,
    'ddos-detector': execute_ddos_detector,
    'vuln-scanner': execute_vuln_scanner
}

# Initialize security monitor
security_monitor = SecurityMonitor()

@app.route('/')
def index():
    """Root endpoint returns available tools"""
    return jsonify({
        'status': 'ok',
        'tools': [{'id': k, 'status': v['status']} for k, v in available_tools.items()]
    })

@app.route('/api/tools/<tool_id>', methods=['POST'])
def execute_tool(tool_id):
    if tool_id not in TOOL_EXECUTORS:
        return jsonify({
            'status': 'error',
            'message': 'Tool not found'
        }), 404

    data = request.json
    investigation_id = data.pop('investigation_id', None)

    try:
        # Execute the tool
        executor = TOOL_EXECUTORS[tool_id]
        result = executor(data)

        # Create tool result record
        tool_result = ToolResult(
            tool_id=tool_id,
            input_data=data,
            result_data=result,
            status='success',
            investigation_id=investigation_id
        )
        db.session.add(tool_result)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'data': result,
            'result_id': tool_result.id
        })

    except Exception as e:
        # Log the error and create error result record
        error_result = ToolResult(
            tool_id=tool_id,
            input_data=data,
            result_data={'error': str(e)},
            status='error',
            investigation_id=investigation_id
        )
        db.session.add(error_result)
        db.session.commit()

        return jsonify({
            'status': 'error',
            'message': str(e),
            'result_id': error_result.id
        }), 500

@app.route('/api/network/interfaces', methods=['GET'])
def get_network_interfaces():
    """Get all available network interfaces"""
    try:
        interfaces = []
        
        # Get all network interfaces using netifaces
        if_names = netifaces.interfaces()
        
        for if_name in if_names:
            # Skip loopback interface
            if (if_name == 'lo' or if_name.startswith('lo')):
                continue
                
            # Only add interfaces that are up and have an IPv4 address
            addrs = netifaces.ifaddresses(if_name)
            if netifaces.AF_INET in addrs:
                interfaces.append(if_name)
        
        # If no interfaces found with netifaces, try with psutil
        if not interfaces:
            net_stats = psutil.net_if_stats()
            for if_name, stats in net_stats.items():
                if if_name != 'lo' and stats.isup:
                    interfaces.append(if_name)
        
        return jsonify({
            'status': 'success',
            'data': interfaces,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f"Error getting network interfaces: {str(e)}",
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/investigations', methods=['GET'])
def list_investigations():
    investigations = Investigation.query.order_by(Investigation.created_at.desc()).all()
    return jsonify({
        'status': 'success',
        'data': [inv.to_dict() for inv in investigations]
    })

@app.route('/api/investigations', methods=['POST'])
def create_investigation():
    data = request.json
    investigation = Investigation(
        title=data['title'],
        description=data.get('description'),
        severity=data.get('severity', 'medium'),
        status='active'
    )
    db.session.add(investigation)
    db.session.commit()
    return jsonify({
        'status': 'success',
        'data': investigation.to_dict()
    })

@app.route('/api/investigations/<int:id>/tools', methods=['GET'])
def get_investigation_tools(id):
    tools = ToolResult.query.filter_by(investigation_id=id).order_by(ToolResult.timestamp.desc()).all()
    return jsonify({
        'status': 'success',
        'data': [tool.to_dict() for tool in tools]
    })

@app.route('/api/investigations/<int:investigation_id>', methods=['GET', 'PUT', 'DELETE'])
def investigation(investigation_id):
    investigation = Investigation.query.get_or_404(investigation_id)
    
    if request.method == 'GET':
        return jsonify({
            "status": "success",
            "data": investigation.to_dict(),
            "timestamp": datetime.now().isoformat()
        })
    
    elif request.method == 'PUT':
        data = request.json
        investigation.title = data.get('title', investigation.title)
        investigation.description = data.get('description', investigation.description)
        investigation.status = data.get('status', investigation.status)
        investigation.severity = data.get('severity', investigation.severity)
        db.session.commit()
        return jsonify({
            "status": "success",
            "data": investigation.to_dict(),
            "timestamp": datetime.now().isoformat()
        })
    
    elif request.method == 'DELETE':
        db.session.delete(investigation)
        db.session.commit()
        return jsonify({
            "status": "success",
            "message": "Investigation deleted",
            "timestamp": datetime.now().isoformat()
        })

@app.route('/api/investigations/<int:investigation_id>/notes', methods=['GET', 'POST'])
def investigation_notes(investigation_id):
    investigation = Investigation.query.get_or_404(investigation_id)
    
    if request.method == 'GET':
        return jsonify({
            "status": "success",
            "data": [note.to_dict() for note in investigation.notes],
            "timestamp": datetime.now().isoformat()
        })
    
    elif request.method == 'POST':
        data = request.json
        note = InvestigationNote(
            investigation_id=investigation_id,
            content=data['content']
        )
        db.session.add(note)
        db.session.commit()
        return jsonify({
            "status": "success",
            "data": note.to_dict(),
            "timestamp": datetime.now().isoformat()
        })

@app.route('/api/security/fail2ban')
def fail2ban_status():
    """Get fail2ban status and statistics"""
    return jsonify(security_monitor.get_fail2ban_status())

@app.route('/api/security/vpn')
def vpn_status():
    """Get VPN connection status"""
    return jsonify(security_monitor.get_vpn_status())

@app.route('/api/security/banned-ips')
def get_banned_ips():
    """Get all banned IPs across all jails"""
    jail = request.args.get('jail')
    banned_ips = security_monitor.get_banned_ips(jail)
    
    # Create security events for banned IPs
    for ip_info in banned_ips:
        event = SecurityEvent(
            event_type='fail2ban',
            source_ip=ip_info['ip'],
            details=ip_info,
            severity='high',
            status='new'
        )
        db.session.add(event)
    
    db.session.commit()
    
    return jsonify({
        "status": "success",
        "data": banned_ips,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/security/unban-ip', methods=['POST'])
def unban_ip():
    """Unban an IP address from fail2ban"""
    data = request.json
    ip = data.get('ip')
    jail = data.get('jail')
    
    if not ip:
        return jsonify({
            "status": "error",
            "message": "IP address is required",
            "timestamp": datetime.now().isoformat()
        }), 400
    
    success = security_monitor.unban_ip(ip, jail)
    
    if success:
        # Log the unban action
        event = SecurityEvent(
            event_type='fail2ban',
            source_ip=ip,
            details={
                'action': 'unban',
                'jail': jail or 'all',
                'success': True
            },
            severity='medium',
            status='resolved'
        )
        db.session.add(event)
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": f"Successfully unbanned IP {ip}",
            "timestamp": datetime.now().isoformat()
        })
    else:
        return jsonify({
            "status": "error",
            "message": f"Failed to unbanned IP {ip}",
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/security/events', methods=['GET'])
def security_events():
    events = SecurityEvent.query.order_by(SecurityEvent.timestamp.desc()).limit(100).all()
    return jsonify({
        "status": "success",
        "data": [event.to_dict() for event in events],
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
