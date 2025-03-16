#!/usr/bin/env python3
import os
import sys
import json
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import importlib.util

# Add the parent directory to Python path to find the utils module
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root_dir)
print(f"Adding to Python path: {root_dir}")

# Dictionary to store available tools and their status
available_tools = {}

def import_tool(module_name):
    try:
        module = importlib.import_module(f'utils.{module_name}')
        available_tools[module_name] = True
        return module
    except ImportError as e:
        print(f"Warning: Could not import {module_name}: {e}")
        available_tools[module_name] = False
        return None

# Import tools with error handling
tools = {
    'ig_scrape': import_tool('ig_scrape'),
    'websearch': import_tool('websearch'),
    'phonenumber_lookup': import_tool('phonenumber_lookup'),
    'ip_lookup': import_tool('ip_lookup'),
    'port_scanner': import_tool('port_scanner'),
    'search_username': import_tool('search_username'),
    'cybercrime_int': import_tool('cybercrime_int'),
    'email_search': import_tool('email_search'),
    'webhook_spammer': import_tool('webhook_spammer'),
    'whois_lookup': import_tool('whois_lookup'),
    'smsbomber': import_tool('smsbomber'),
    'fake_info_generator': import_tool('fake_info_generator'),
    'web_scrape': import_tool('web_scrape'),
    'wifi_finder': import_tool('wifi_finder'),
    'wifi_vault': import_tool('wifi_vault'),
    'dirbuster': import_tool('dirbuster'),
    'local_user_enum': import_tool('local_user_enum'),
    'caesar_cipher': import_tool('caesar_cipher'),
    'basexx': import_tool('basexx')
}

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    # Return list of available tools and their status
    return jsonify({
        "status": "success",
        "message": "H4X-Tools API is running",
        "version": "1.0.0",
        "available_tools": available_tools,
        "endpoints": ["/api/tools/<tool_id>"]
    })

@app.route('/api/tools/<tool_id>', methods=['POST'])
def execute_tool(tool_id):
    params = request.json
    
    if not available_tools.get(tool_id, False):
        return jsonify({
            "status": "error",
            "message": f"Tool '{tool_id}' is not available or its dependencies are not installed",
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
        
        return jsonify({
            "status": "success",
            "data": result,
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        print(f"Error executing {tool_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

if __name__ == '__main__':
    print(f"Starting Flask server...")
    print(f"Available tools: {available_tools}")
    print(f"Python path: {sys.path}")
    print(f"Current directory: {os.getcwd()}")
    print(f"Root directory: {root_dir}")
    app.run(host='0.0.0.0', port=5000, debug=True)