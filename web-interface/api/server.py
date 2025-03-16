#!/usr/bin/env python3
import os
import sys
import json
import subprocess
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import importlib.util
from models.database import init_db, db
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
    try:
        module = importlib.import_module(f'utils.{module_name}')
        available_tools[tool_id or module_name] = True
        return module
    except ImportError as e:
        print(f"Warning: Could not import {module_name}: {e}")
        available_tools[tool_id or module_name] = False
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
    'sms_bomber': import_tool('smsbomber', 'sms_bomber'),
    'fake_info_generator': import_tool('fake_info_generator', 'fake_info_generator'),
    'web_scrape': import_tool('web_scrape', 'web_scrape'),
    'wifi_finder': import_tool('wifi_finder', 'wifi_finder'),
    'wifi_vault': import_tool('wifi_vault', 'wifi_vault'),
    'dir_buster': import_tool('dirbuster', 'dir_buster'),
    'local_user_enum': import_tool('local_user_enum', 'local_user_enum'),
    'caesar_cipher': import_tool('caesar_cipher', 'caesar_cipher'),
    'basexx': import_tool('basexx', 'basexx')
}

app = Flask(__name__)
CORS(app)

# Initialize database
init_db(app)

def get_fail2ban_status():
    try:
        result = subprocess.run(['fail2ban-client', 'status'], capture_output=True, text=True)
        if result.returncode == 0:
            # Parse and store the event in database
            event = SecurityEvent(
                event_type='fail2ban',
                details={'status': result.stdout},
                severity='medium'
            )
            db.session.add(event)
            db.session.commit()
            
            return {
                "status": "success",
                "data": result.stdout,
                "timestamp": datetime.now().isoformat()
            }
        return {
            "status": "error",
            "message": "Failed to get Fail2ban status",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.now().isoformat()
        }

def get_vpn_status():
    try:
        result = subprocess.run(['systemctl', 'status', 'openvpn'], capture_output=True, text=True)
        is_active = 'active (running)' in result.stdout
        
        connections = []
        if is_active:
            conn_result = subprocess.run(['who'], capture_output=True, text=True)
            connections = conn_result.stdout.splitlines()

        # Store VPN status in database
        event = SecurityEvent(
            event_type='vpn',
            details={
                'is_active': is_active,
                'connections': connections
            },
            severity='low' if is_active else 'high'
        )
        db.session.add(event)
        db.session.commit()

        return {
            "status": "success",
            "data": {
                "is_active": is_active,
                "connections": connections,
                "last_check": datetime.now().isoformat()
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.now().isoformat()
        }

@app.route('/')
def index():
    return jsonify({
        "status": "success",
        "message": "H4X-Tools API is running",
        "version": "1.0.0",
        "available_tools": available_tools
    })

@app.route('/api/tools/<tool_id>', methods=['POST'])
def execute_tool(tool_id):
    params = request.json
    investigation_id = params.pop('investigation_id', None)
    
    if not available_tools.get(tool_id, False):
        return jsonify({
            "status": "error",
            "message": f"Tool '{tool_id}' is not available.",
            "timestamp": datetime.now().isoformat()
        }), 503
    
    try:
        tool_module = tools.get(tool_id)
        if not tool_module:
            return jsonify({
                "status": "error",
                "message": f"Unknown tool: {tool_id}",
                "timestamp": datetime.now().isoformat()
            }), 404

        # Execute tool
        result = None
        if tool_id == 'ig_scrape':
            result = tool_module.Scrape(params.get('username', '')).get_data()
        elif tool_id == 'web_search':
            result = tool_module.main(params.get('query', ''))
        elif tool_id == 'phone_lookup':
            result = tool_module.main(params.get('phone', ''))
        elif tool_id == 'ip_lookup':
            result = tool_module.main(params.get('ip', ''))
        elif tool_id == 'port_scanner':
            result = tool_module.main(
                params.get('target', ''),
                params.get('port_range', '1-1000')
            )
        elif tool_id == 'username_search':
            result = tool_module.main(params.get('username', ''))
        elif tool_id == 'cybercrime_int':
            result = tool_module.main(params.get('target', ''))
        elif tool_id == 'email_search':
            result = tool_module.main(params.get('email', ''))
        elif tool_id == 'webhook_spammer':
            result = tool_module.main(
                params.get('webhook_url', ''),
                params.get('message', ''),
                int(params.get('count', 10))
            )
        elif tool_id == 'whois_lookup':
            result = tool_module.main(params.get('domain', ''))
        elif tool_id == 'sms_bomber':
            result = tool_module.main(
                params.get('phone', ''),
                int(params.get('count', 5))
            )
        elif tool_id == 'fake_info_generator':
            result = tool_module.main(params.get('locale', 'en_US'))
        elif tool_id == 'web_scrape':
            result = tool_module.main(params.get('url', ''))
        elif tool_id == 'wifi_finder':
            result = tool_module.main()
        elif tool_id == 'wifi_vault':
            result = tool_module.main()
        elif tool_id == 'dir_buster':
            result = tool_module.main(
                params.get('url', ''),
                params.get('wordlist', '')
            )
        elif tool_id == 'local_user_enum':
            result = tool_module.main()
        elif tool_id == 'caesar_cipher':
            result = tool_module.main(
                params.get('message', ''),
                int(params.get('shift', 0)),
                params.get('mode', 'bruteforce')
            )
        elif tool_id == 'basexx':
            result = tool_module.main(
                params.get('message', ''),
                params.get('mode', 'encode'),
                params.get('base', '64')
            )

        # Store result in database
        tool_result = ToolResult(
            tool_id=tool_id,
            input_data=params,
            result_data=result,
            status='success',
            investigation_id=investigation_id
        )
        db.session.add(tool_result)
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "data": result,
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        error_result = ToolResult(
            tool_id=tool_id,
            input_data=params,
            result_data={"error": str(e)},
            status='error',
            investigation_id=investigation_id
        )
        db.session.add(error_result)
        db.session.commit()
        
        return jsonify({
            "status": "error",
            "message": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/investigations', methods=['GET', 'POST'])
def investigations():
    if request.method == 'GET':
        investigations = Investigation.query.all()
        return jsonify({
            "status": "success",
            "data": [inv.to_dict() for inv in investigations],
            "timestamp": datetime.now().isoformat()
        })
    
    elif request.method == 'POST':
        data = request.json
        investigation = Investigation(
            title=data['title'],
            description=data.get('description', ''),
            severity=data.get('severity', 'medium')
        )
        db.session.add(investigation)
        db.session.commit()
        return jsonify({
            "status": "success",
            "data": investigation.to_dict(),
            "timestamp": datetime.now().isoformat()
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
    return jsonify(get_fail2ban_status())

@app.route('/api/security/vpn')
def vpn_status():
    return jsonify(get_vpn_status())

@app.route('/api/security/events', methods=['GET'])
def security_events():
    events = SecurityEvent.query.order_by(SecurityEvent.timestamp.desc()).limit(100).all()
    return jsonify({
        "status": "success",
        "data": [event.to_dict() for event in events],
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    print(f"Starting Flask server...")
    print(f"Available tools: {available_tools}")
    print(f"Python path: {sys.path}")
    print(f"Current directory: {os.getcwd()}")
    print(f"Root directory: {root_dir}")
    app.run(host='0.0.0.0', port=5000, debug=True)