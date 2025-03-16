#!/usr/bin/env python3
import os
import sys
import json
import subprocess
from datetime import datetime
from flask import request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import importlib.util
from models.database import db
from models.models import ToolResult, Investigation, InvestigationNote, SecurityEvent
from utils.security_monitor import SecurityMonitor
from app import app

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
    'basexx': import_tool('basexx', 'basexx')
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
            "message": f"Failed to unban IP {ip}",
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