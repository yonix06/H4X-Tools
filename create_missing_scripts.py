import os

missing_scripts = ['snort.py', 'suricata.py', 'ossec.py', 'zeek_anciennement_bro.py', 'wazuh.py', 'fail2ban.py', 'ufw_uncomplicated_firewall.py', 'iptables.py', 'wireshark.py', 'tcpdump.py', 'ntop.py', 'netflow.py', 'owasp_zap_zed_attack_proxy.py', 'burp_suite.py', 'nessus.py', 'nmap.py', 'openvas.py', 'nagios.py', 'veracrypt.py', 'bitlocker.py', 'lastpass.py', 'social-engineer_toolkit_set.py', 'maltego.py', 'phishing_frenzy.py', 'wireguard.py', 'tailscale.py', 'check_point_harmony_connect.py', 'crowdsec.py', 'pfsense_opnsense.py', 'malcolm.py', 'cuckoo_sandbox.py', 'elk_stack_elasticsearch_logstash_kibana.py', 'graylog.py', 'security_onion.py', 'darktrace.py', 'misp_malware_information_sharing_platform.py', 'thehive_+_cortex.py', 'pi-hole.py', 'quad9.py', 'cloudflare_dns.py', 'cowrie.py', 'dionaea.py', 'honeyd_ou_glastopf.py']

for script in missing_scripts:
    filepath = os.path.join('utils', script)
    with open(filepath, 'w') as f:
        f.write('# Placeholder script')
    print(f'Created {filepath}')
