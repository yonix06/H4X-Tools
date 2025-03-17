#!/usr/bin/env bash

# H4X-Tools Security Tools Installation Script
# This script installs all security tools required by H4X-Tools
# Author: GitHub Copilot
# License: Same as H4X-Tools (GNU GPL v3)

set -e

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Script Variables
LOG_FILE="install_log.txt"
INSTALL_DIR="$(pwd)"
TOTAL_TOOLS=0
INSTALLED_TOOLS=0
FAILED_TOOLS=0
SKIPPED_TOOLS=0

# Function to print colored output
print_msg() {
    local color="$1"
    local msg="$2"
    echo -e "${color}${msg}${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $msg" >> "$LOG_FILE"
}

# Function to print header
print_header() {
    clear
    echo -e "${BOLD}${BLUE}============================================================${NC}"
    echo -e "${BOLD}${BLUE}       H4X-Tools Security Tools Installation Script        ${NC}"
    echo -e "${BOLD}${BLUE}============================================================${NC}"
    echo
    echo -e "${CYAN}This script will install all the security tools required by H4X-Tools.${NC}"
    echo -e "${CYAN}It may ask for your sudo password multiple times.${NC}"
    echo -e "${CYAN}Log file will be saved to: ${LOG_FILE}${NC}"
    echo
}

# Function to detect OS
detect_os() {
    print_msg "$BLUE" "Detecting operating system..."
    
    if [ -f /etc/os-release ]; then
        # freedesktop.org and systemd
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    elif type lsb_release >/dev/null 2>&1; then
        # linuxbase.org
        OS=$(lsb_release -si)
        VER=$(lsb_release -sr)
    elif [ -f /etc/lsb-release ]; then
        # For some versions of Debian/Ubuntu without lsb_release command
        . /etc/lsb-release
        OS=$DISTRIB_ID
        VER=$DISTRIB_RELEASE
    elif [ -f /etc/debian_version ]; then
        # Older Debian/Ubuntu/etc.
        OS=Debian
        VER=$(cat /etc/debian_version)
    elif [ -f /etc/SuSe-release ]; then
        # Older SuSE/etc.
        OS=SuSE
        VER=$(cat /etc/SuSe-release)
    elif [ -f /etc/redhat-release ]; then
        # Older Red Hat, CentOS, etc.
        OS=RedHat
        VER=$(cat /etc/redhat-release)
    else
        # Fall back to uname, e.g. "Linux <version>", also works for BSD, etc.
        OS=$(uname -s)
        VER=$(uname -r)
    fi
    
    print_msg "$GREEN" "Detected OS: $OS $VER"
    
    # Determine package manager
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]] || [[ "$OS" == *"Kali"* ]] || [[ "$OS" == *"Mint"* ]]; then
        PKG_MANAGER="apt"
        PKG_UPDATE="sudo apt update"
        PKG_INSTALL="sudo apt install -y"
    elif [[ "$OS" == *"Fedora"* ]]; then
        PKG_MANAGER="dnf"
        PKG_UPDATE="sudo dnf check-update"
        PKG_INSTALL="sudo dnf install -y"
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"RedHat"* ]] || [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"AlmaLinux"* ]]; then
        PKG_MANAGER="yum"
        PKG_UPDATE="sudo yum check-update"
        PKG_INSTALL="sudo yum install -y"
    elif [[ "$OS" == *"Arch"* ]] || [[ "$OS" == *"Manjaro"* ]]; then
        PKG_MANAGER="pacman"
        PKG_UPDATE="sudo pacman -Sy"
        PKG_INSTALL="sudo pacman -S --noconfirm"
    elif [[ "$OS" == *"openSUSE"* ]] || [[ "$OS" == *"SuSE"* ]]; then
        PKG_MANAGER="zypper"
        PKG_UPDATE="sudo zypper refresh"
        PKG_INSTALL="sudo zypper install -y"
    elif [[ "$OS" == *"Alpine"* ]]; then
        PKG_MANAGER="apk"
        PKG_UPDATE="sudo apk update"
        PKG_INSTALL="sudo apk add"
    elif [[ "$OS" == *"macOS"* ]] || [[ "$OS" == *"Darwin"* ]]; then
        if command -v brew >/dev/null 2>&1; then
            PKG_MANAGER="brew"
            PKG_UPDATE="brew update"
            PKG_INSTALL="brew install"
        else
            print_msg "$YELLOW" "Homebrew not found. Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            PKG_MANAGER="brew"
            PKG_UPDATE="brew update"
            PKG_INSTALL="brew install"
        fi
    else
        print_msg "$RED" "Unsupported OS: $OS. Please install dependencies manually."
        exit 1
    fi
    
    print_msg "$GREEN" "Using package manager: $PKG_MANAGER"
}

# Function to update package manager
update_packages() {
    print_msg "$BLUE" "Updating package manager..."
    eval "$PKG_UPDATE"
    print_msg "$GREEN" "Package manager updated successfully"
}

# Function to install Python prerequisites
install_python_prerequisites() {
    print_msg "$BLUE" "Installing Python prerequisites..."
    
    # Install Python and pip
    case $PKG_MANAGER in
        apt)
            $PKG_INSTALL python3 python3-pip python3-dev python3-venv
            ;;
        dnf|yum)
            $PKG_INSTALL python3 python3-pip python3-devel
            ;;
        pacman)
            $PKG_INSTALL python python-pip
            ;;
        zypper)
            $PKG_INSTALL python3 python3-pip python3-devel
            ;;
        apk)
            $PKG_INSTALL python3 py3-pip python3-dev
            ;;
        brew)
            $PKG_INSTALL python@3
            ;;
    esac
    
    # Install virtualenv if needed
    if ! command -v virtualenv >/dev/null 2>&1; then
        pip3 install virtualenv
    fi
    
    print_msg "$GREEN" "Python prerequisites installed successfully"
}

# Function to install common build tools
install_build_tools() {
    print_msg "$BLUE" "Installing build tools and common dependencies..."
    
    case $PKG_MANAGER in
        apt)
            $PKG_INSTALL build-essential libssl-dev libffi-dev libpcap-dev \
                         git curl wget unzip libsqlite3-dev zlib1g-dev \
                         libbz2-dev libreadline-dev libncurses5-dev \
                         libncursesw5-dev xz-utils tk-dev
            ;;
        dnf|yum)
            $PKG_INSTALL make automake gcc gcc-c++ kernel-devel openssl-devel \
                         libffi-devel libpcap-devel git curl wget unzip \
                         sqlite-devel zlib-devel bzip2-devel readline-devel \
                         ncurses-devel tk-devel
            ;;
        pacman)
            $PKG_INSTALL base-devel openssl libffi libpcap git curl wget unzip \
                         sqlite zlib bzip2 readline ncurses tk
            ;;
        zypper)
            $PKG_INSTALL -t pattern devel_basis
            $PKG_INSTALL libopenssl-devel libffi-devel libpcap-devel git curl \
                         wget unzip sqlite3-devel zlib-devel libbz2-devel \
                         readline-devel ncurses-devel tk-devel
            ;;
        apk)
            $PKG_INSTALL build-base openssl-dev libffi-dev libpcap-dev git curl \
                         wget unzip sqlite-dev zlib-dev bzip2-dev readline-dev \
                         ncurses-dev tk-dev
            ;;
        brew)
            $PKG_INSTALL openssl libffi libpcap git curl wget sqlite3 zlib \
                         bzip2 readline ncurses tk
            ;;
    esac
    
    print_msg "$GREEN" "Build tools installed successfully"
}

# Function to install a specific tool
install_tool() {
    local tool_name=$1
    local packages=$2
    local pip_packages=$3
    local custom_cmd=$4
    
    TOTAL_TOOLS=$((TOTAL_TOOLS + 1))
    
    print_msg "$BLUE" "Installing $tool_name..."
    
    # Install distribution packages
    if [ -n "$packages" ]; then
        if ! eval "$PKG_INSTALL $packages"; then
            print_msg "$RED" "Failed to install packages for $tool_name"
            FAILED_TOOLS=$((FAILED_TOOLS + 1))
            return 1
        fi
    fi
    
    # Install pip packages
    if [ -n "$pip_packages" ]; then
        if ! pip3 install $pip_packages; then
            print_msg "$RED" "Failed to install pip packages for $tool_name"
            FAILED_TOOLS=$((FAILED_TOOLS + 1))
            return 1
        fi
    fi
    
    # Run custom commands
    if [ -n "$custom_cmd" ]; then
        if ! eval "$custom_cmd"; then
            print_msg "$RED" "Failed to run custom commands for $tool_name"
            FAILED_TOOLS=$((FAILED_TOOLS + 1))
            return 1
        fi
    fi
    
    print_msg "$GREEN" "$tool_name installed successfully"
    INSTALLED_TOOLS=$((INSTALLED_TOOLS + 1))
    return 0
}

# Function to install network analysis tools
install_network_analysis_tools() {
    print_msg "$PURPLE" "Installing Network Analysis Tools..."
    
    # Wireshark
    install_tool "Wireshark" "wireshark tshark" "" ""
    
    # Snort
    install_tool "Snort" "snort" "" ""
    
    # Suricata
    install_tool "Suricata" "suricata" "" ""
    
    # Zeek (formerly Bro)
    if [[ "$PKG_MANAGER" == "apt" ]]; then
        install_tool "Zeek" "" "" "
            if ! command -v zeek >/dev/null 2>&1; then
                echo 'deb http://download.opensuse.org/repositories/security:/zeek/xUbuntu_20.04/ /' | sudo tee /etc/apt/sources.list.d/security:zeek.list
                curl -fsSL https://download.opensuse.org/repositories/security:zeek/xUbuntu_20.04/Release.key | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/security_zeek.gpg > /dev/null
                sudo apt update
                sudo apt install -y zeek
            fi
        "
    else
        install_tool "Zeek" "zeek" "" ""
    fi
    
    # TCPDump
    install_tool "TCPDump" "tcpdump" "" ""
    
    # Netflow tools
    install_tool "Netflow Tools" "nfdump" "" ""
    
    # Ntop
    if [[ "$PKG_MANAGER" == "apt" ]]; then
        install_tool "Ntop" "ntopng" "" ""
    else
        print_msg "$YELLOW" "Ntop installation not supported for $PKG_MANAGER. Please install manually."
        SKIPPED_TOOLS=$((SKIPPED_TOOLS + 1))
    fi
}

# Function to install intrusion detection/prevention tools
install_ids_ips_tools() {
    print_msg "$PURPLE" "Installing Intrusion Detection/Prevention Tools..."
    
    # OSSEC
    if [[ "$PKG_MANAGER" == "apt" ]]; then
        install_tool "OSSEC" "" "" "
            if ! command -v ossec-control >/dev/null 2>&1; then
                wget -q https://github.com/ossec/ossec-hids/archive/3.6.0.tar.gz
                tar -xzf 3.6.0.tar.gz
                cd ossec-hids-3.6.0/
                sudo ./install.sh
                cd ..
                rm -rf ossec-hids-3.6.0 3.6.0.tar.gz
            fi
        "
    else
        print_msg "$YELLOW" "OSSEC installation not supported for $PKG_MANAGER. Please install manually."
        SKIPPED_TOOLS=$((SKIPPED_TOOLS + 1))
    fi
    
    # Wazuh
    if [[ "$PKG_MANAGER" == "apt" ]]; then
        install_tool "Wazuh" "" "" "
            if ! command -v wazuh-agent >/dev/null 2>&1; then
                curl -sO https://packages.wazuh.com/4.x/apt/pool/main/w/wazuh-agent/wazuh-agent_4.3.10-1_amd64.deb && sudo WAZUH_MANAGER='127.0.0.1' dpkg -i wazuh-agent_4.3.10-1_amd64.deb
                rm wazuh-agent_4.3.10-1_amd64.deb
            fi
        "
    else
        print_msg "$YELLOW" "Wazuh installation not supported for $PKG_MANAGER. Please install manually."
        SKIPPED_TOOLS=$((SKIPPED_TOOLS + 1))
    fi
    
    # Fail2Ban
    install_tool "Fail2Ban" "fail2ban" "" ""
    
    # CrowdSec
    install_tool "CrowdSec" "" "" "
        if ! command -v cscli >/dev/null 2>&1; then
            curl -s https://packagecloud.io/install/repositories/crowdsec/crowdsec/script.deb.sh | sudo bash
            sudo apt install -y crowdsec
        fi
    "
    
    # DDoS detection tools
    install_tool "DDoS Detection Tools" "vnstat" "" ""
}

# Function to install vulnerability scanning tools
install_vuln_scanning_tools() {
    print_msg "$PURPLE" "Installing Vulnerability Scanning Tools..."
    
    # OpenVAS
    if [[ "$PKG_MANAGER" == "apt" ]]; then
        install_tool "OpenVAS" "" "" "
            if ! command -v gvm-check-setup >/dev/null 2>&1; then
                sudo apt install -y software-properties-common
                sudo add-apt-repository -y ppa:mrazavi/gvm
                sudo apt update
                sudo apt install -y gvm
            fi
        "
    else
        print_msg "$YELLOW" "OpenVAS installation not supported for $PKG_MANAGER. Please install manually."
        SKIPPED_TOOLS=$((SKIPPED_TOOLS + 1))
    fi
    
    # Nessus (requires manual installation)
    print_msg "$YELLOW" "Nessus requires manual installation. Please download from https://www.tenable.com/downloads/nessus"
    SKIPPED_TOOLS=$((SKIPPED_TOOLS + 1))
    
    # OWASP ZAP
    install_tool "OWASP ZAP" "" "" "
        if ! command -v zap.sh >/dev/null 2>&1; then
            if [[ \"$PKG_MANAGER\" == \"apt\" ]]; then
                sudo apt install -y default-jre
                wget -q https://github.com/zaproxy/zaproxy/releases/download/v2.12.0/ZAP_2.12.0_Linux.tar.gz
                tar -xzf ZAP_2.12.0_Linux.tar.gz
                sudo mv ZAP_2.12.0 /opt/zap
                sudo ln -s /opt/zap/zap.sh /usr/local/bin/zap.sh
                rm ZAP_2.12.0_Linux.tar.gz
            else
                print_msg \"$YELLOW\" \"OWASP ZAP installation not supported for $PKG_MANAGER. Please install manually.\"
                return 1
            fi
        fi
    "
    
    # Generic vulnerability scanner
    install_tool "Vulnerability Scanner Dependencies" "libxml2-dev libxslt1-dev python3-lxml" "python-owasp-zap-v2.4 vulners" ""
}

# Function to install web security tools
install_web_security_tools() {
    print_msg "$PURPLE" "Installing Web Security Tools..."
    
    # Burp Suite (requires manual installation)
    print_msg "$YELLOW" "Burp Suite requires manual installation. Please download from https://portswigger.net/burp/communitydownload"
    SKIPPED_TOOLS=$((SKIPPED_TOOLS + 1))
    
    # DirBuster alternative (dirb, gobuster)
    install_tool "Directory Busting Tools" "dirb gobuster" "" ""
    
    # Nikto
    install_tool "Nikto" "nikto" "" ""
}

# Function to install firewall tools
install_firewall_tools() {
    print_msg "$PURPLE" "Installing Firewall Tools..."
    
    # UFW
    install_tool "UFW" "ufw" "" ""
    
    # IPTables
    install_tool "IPTables" "iptables iptables-persistent" "" ""
    
    # pfSense/OPNsense (requires dedicated hardware/VM)
    print_msg "$YELLOW" "pfSense/OPNsense require dedicated hardware or VM. They cannot be installed via package manager."
    SKIPPED_TOOLS=$((SKIPPED_TOOLS + 1))
}

# Function to install VPN tools
install_vpn_tools() {
    print_msg "$PURPLE" "Installing VPN Tools..."
    
    # WireGuard
    install_tool "WireGuard" "wireguard" "" ""
    
    # Tailscale
    install_tool "Tailscale" "" "" "
        if ! command -v tailscale >/dev/null 2>&1; then
            if [[ \"$PKG_MANAGER\" == \"apt\" ]]; then
                curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/focal.gpg | sudo apt-key add -
                curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/focal.list | sudo tee /etc/apt/sources.list.d/tailscale.list
                sudo apt update
                sudo apt install -y tailscale
            elif [[ \"$PKG_MANAGER\" == \"dnf\" || \"$PKG_MANAGER\" == \"yum\" ]]; then
                sudo dnf config-manager --add-repo https://pkgs.tailscale.com/stable/centos/tailscale.repo
                sudo dnf install -y tailscale
            else
                print_msg \"$YELLOW\" \"Tailscale installation not supported for $PKG_MANAGER. Please install manually.\"
                return 1
            fi
        fi
    "
}

# Function to install monitoring and logging tools
install_monitoring_tools() {
    print_msg "$PURPLE" "Installing Monitoring and Logging Tools..."
    
    # ELK Stack
    if [[ "$PKG_MANAGER" == "apt" ]]; then
        install_tool "ELK Stack" "" "" "
            if ! command -v elasticsearch >/dev/null 2>&1; then
                wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
                echo \"deb https://artifacts.elastic.co/packages/7.x/apt stable main\" | sudo tee /etc/apt/sources.list.d/elastic-7.x.list
                sudo apt update
                sudo apt install -y elasticsearch kibana logstash
            fi
        "
    else
        print_msg "$YELLOW" "ELK Stack installation not supported for $PKG_MANAGER. Please install manually."
        SKIPPED_TOOLS=$((SKIPPED_TOOLS + 1))
    fi
    
    # Graylog
    print_msg "$YELLOW" "Graylog requires complex setup. Please install manually from https://docs.graylog.org/docs/installing"
    SKIPPED_TOOLS=$((SKIPPED_TOOLS + 1))
    
    # Nagios
    if [[ "$PKG_MANAGER" == "apt" ]]; then
        install_tool "Nagios" "nagios4" "" ""
    else
        print_msg "$YELLOW" "Nagios installation not supported for $PKG_MANAGER. Please install manually."
        SKIPPED_TOOLS=$((SKIPPED_TOOLS + 1))
    fi
    
    # Security Onion (requires dedicated installation)
    print_msg "$YELLOW" "Security Onion requires dedicated installation. Please install manually from https://securityonionsolutions.com"
    SKIPPED_TOOLS=$((SKIPPED_TOOLS + 1))
}

# Function to install DNS security tools
install_dns_security_tools() {
    print_msg "$PURPLE" "Installing DNS Security Tools..."
    
    # Pi-hole (requires dedicated setup)
    print_msg "$YELLOW" "Pi-hole requires dedicated setup. Please install manually."
    SKIPPED_TOOLS=$((SKIPPED_TOOLS + 1))
    
    # Quad9 (DNS service, nothing to install)
    print_msg "$YELLOW" "Quad9 is a DNS service. No installation required. Configure DNS to use 9.9.9.9"
    SKIPPED_TOOLS=$((SKIPPED_TOOLS + 1))
    
    # Cloudflare DNS (DNS service, nothing to install)
    print_msg "$YELLOW" "Cloudflare DNS is a DNS service. No installation required. Configure DNS to use 1.1.1.1"
    SKIPPED_TOOLS=$((SKIPPED_TOOLS + 1))
}

# Function to install honeypot tools
install_honeypot_tools() {
    print_msg "$PURPLE" "Installing Honeypot Tools..."
    
    # Cowrie SSH honeypot
    install_tool "Cowrie" "python3-virtualenv python3-pip authbind python3-dev libssl-dev libffi-dev build-essential libpython3-dev git python3-venv" "" "
        if [ ! -d \"cowrie\" ]; then
            git clone https://github.com/cowrie/cowrie
            cd cowrie
            python3 -m venv cowrie-env
            source cowrie-env/bin/activate
            pip install --upgrade pip
            pip install --upgrade -r requirements.txt
            deactivate
            cd ..
        fi
    "
    
    # Dionaea
    if [[ "$PKG_MANAGER" == "apt" ]]; then
        install_tool "Dionaea" "dionaea" "" ""
    else
        print_msg "$YELLOW" "Dionaea installation not supported for $PKG_MANAGER. Please install manually."
        SKIPPED_TOOLS=$((SKIPPED_TOOLS + 1))
    fi
    
    # Honeyd/Glastopf
    print_msg "$YELLOW" "Honeyd/Glastopf installation requires complex setup. Please install manually."
    SKIPPED_TOOLS=$((SKIPPED_TOOLS + 1))
}

# Function to install password and encryption tools
install_password_tools() {
    print_msg "$PURPLE" "Installing Password and Encryption Tools..."
    
    # VeraCrypt
    if [[ "$PKG_MANAGER" == "apt" ]]; then
        install_tool "VeraCrypt" "" "" "
            if ! command -v veracrypt >/dev/null 2>&1; then
                wget -q https://launchpad.net/veracrypt/trunk/1.25.9/+download/veracrypt-1.25.9-Ubuntu-22.04-amd64.deb
                sudo apt install -y ./veracrypt-1.25.9-Ubuntu-22.04-amd64.deb
                rm veracrypt-1.25.9-Ubuntu-22.04-amd64.deb
            fi
        "
    else
        print_msg "$YELLOW" "VeraCrypt installation not supported for $PKG_MANAGER. Please install manually."
        SKIPPED_TOOLS=$((SKIPPED_TOOLS + 1))
    fi
    
    # BitLocker (Windows only)
    print_msg "$YELLOW" "BitLocker is a Windows-only feature. Not applicable for installation on Linux."
    SKIPPED_TOOLS=$((SKIPPED_TOOLS + 1))
    
    # LastPass CLI
    install_tool "LastPass CLI" "lastpass-cli" "" ""
}

# Function to install incident response tools
install_incident_response_tools() {
    print_msg "$PURPLE" "Installing Incident Response Tools..."
    
    # TheHive + Cortex
    print_msg "$YELLOW" "TheHive + Cortex installation requires complex setup. Please install manually."
    SKIPPED_TOOLS=$((SKIPPED_TOOLS + 1))
    
    # MISP
    print_msg "$YELLOW" "MISP installation requires complex setup. Please install manually."
    SKIPPED_TOOLS=$((SKIPPED_TOOLS + 1))
    
    # Malcolm
    print_msg "$YELLOW" "Malcolm installation requires complex setup. Please install manually from https://github.com/cisagov/Malcolm"
    SKIPPED_TOOLS=$((SKIPPED_TOOLS + 1))
}

# Function to install miscellaneous tools
install_misc_tools() {
    print_msg "$PURPLE" "Installing Miscellaneous Tools..."
    
    # OSINT tools
    install_tool "OSINT Tools" "whois" "shodan" ""
    
    # Penetration testing tools
    install_tool "Penetration Testing Tool Dependencies" "nmap" "crackmapexec" ""
    
    # Social Engineer Toolkit
    if [[ "$PKG_MANAGER" == "apt" ]]; then
        install_tool "Social Engineer Toolkit" "" "" "
            if [ ! -d \"setoolkit\" ]; then
                git clone https://github.com/trustedsec/social-engineer-toolkit setoolkit
                cd setoolkit
                sudo python3 setup.py install
                cd ..
            fi
        "
    else
        print_msg "$YELLOW" "Social Engineer Toolkit installation not supported for $PKG_MANAGER. Please install manually."
        SKIPPED_TOOLS=$((SKIPPED_TOOLS + 1))
    fi
    
    # Python tools from requirements.txt
    install_tool "Python Dependencies" "" "-r requirements.txt" ""
}

# Function to setup Python environment
setup_python_env() {
    print_msg "$BLUE" "Setting up Python virtual environment..."
    
    # Create and activate virtual environment
    if [ ! -d ".venv" ]; then
        python3 -m venv .venv
    fi
    
    source .venv/bin/activate
    
    # Install Python requirements
    pip3 install --upgrade pip
    pip3 install -r requirements.txt
    
    print_msg "$GREEN" "Python virtual environment setup complete"
}

# Function to print summary
print_summary() {
    echo
    echo -e "${BOLD}${BLUE}============================================================${NC}"
    echo -e "${BOLD}${BLUE}                  Installation Summary                     ${NC}"
    echo -e "${BOLD}${BLUE}============================================================${NC}"
    echo
    echo -e "${CYAN}Total tools processed:${NC} $TOTAL_TOOLS"
    echo -e "${GREEN}Installed successfully:${NC} $INSTALLED_TOOLS"
    echo -e "${YELLOW}Skipped (manual installation required):${NC} $SKIPPED_TOOLS"
    echo -e "${RED}Failed to install:${NC} $FAILED_TOOLS"
    echo
    echo -e "${CYAN}Log file:${NC} $LOG_FILE"
    echo
    
    if [ $FAILED_TOOLS -gt 0 ]; then
        echo -e "${YELLOW}Some tools failed to install. Please check the log file for details.${NC}"
    fi
    
    if [ $SKIPPED_TOOLS -gt 0 ]; then
        echo -e "${YELLOW}Some tools require manual installation. Please refer to their respective documentation.${NC}"
    fi
    
    echo -e "${GREEN}Installation process complete!${NC}"
    echo
}

# Function to check for root privileges
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_msg "$YELLOW" "This script will need sudo privileges for some operations."
        print_msg "$YELLOW" "You may be prompted for your password during execution."
    fi
}

# Main function
main() {
    # Initialize log file
    echo "H4X-Tools Security Tools Installation Log" > "$LOG_FILE"
    echo "Date: $(date)" >> "$LOG_FILE"
    echo "----------------------------------------" >> "$LOG_FILE"
    
    print_header
    check_root
    detect_os
    update_packages
    install_python_prerequisites
    install_build_tools
    
    # Install security tools by category
    install_network_analysis_tools
    install_ids_ips_tools
    install_vuln_scanning_tools
    install_web_security_tools
    install_firewall_tools
    install_vpn_tools
    install_monitoring_tools
    install_dns_security_tools
    install_honeypot_tools
    install_password_tools
    install_incident_response_tools
    install_misc_tools
    
    # Setup Python environment
    setup_python_env
    
    # Print summary
    print_summary
}

# Run the main function
main