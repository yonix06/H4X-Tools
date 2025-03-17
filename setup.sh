#!/usr/bin/env bash

# Copyright (c) 2024. Vili and contributors.
# This script sets up H4X-Tools and installs all required security tools

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
    echo -e "${BOLD}${BLUE}                H4X-Tools Setup Script                     ${NC}"
    echo -e "${BOLD}${BLUE}============================================================${NC}"
    echo
    echo -e "${CYAN}This script will set up H4X-Tools and install required security tools.${NC}"
    echo -e "${CYAN}It may ask for your sudo password multiple times.${NC}"
    echo -e "${CYAN}Log file will be saved to: ${LOG_FILE}${NC}"
    echo
    echo -e "${CYAN}~~by Vili (https://vili.dev)${NC}"
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
    
    # Install PyInstaller if needed
    if ! command -v pyinstaller >/dev/null 2>&1; then
        pip3 install pyinstaller
    fi
    
    print_msg "$GREEN" "Python virtual environment setup complete"
}

# Function to build H4X-Tools executable
build_executable() {
    print_msg "$BLUE" "Building H4X-Tools to a single executable..."
    
    if [ -f "h4xtools.spec" ]; then
        pyinstaller h4xtools.spec --clean
    else
        # Handle path separator difference between Windows and Unix-like systems
        if [[ "$OS" == *"Windows"* ]]; then
            pyinstaller h4xtools.py --add-data "resources/*;resources" --onefile -F --clean
        else
            pyinstaller h4xtools.py --add-data "resources/*:resources" --onefile -F --clean
        fi
    fi
    
    if [ -f "dist/h4xtools" ] || [ -f "dist/h4xtools.exe" ]; then
        print_msg "$GREEN" "H4X-Tools executable built successfully"
        
        # Move the executable to appropriate location
        if [ -f "dist/h4xtools" ]; then
            chmod +x dist/h4xtools
            sudo mv dist/h4xtools /usr/local/bin/ 2>/dev/null || \
            print_msg "$YELLOW" "Could not move h4xtools to /usr/local/bin/. You can find it in the dist/ directory."
        fi
        
        # Clean up build files
        rm -f h4xtools.spec 2>/dev/null
        rm -rf build 2>/dev/null
        
        print_msg "$GREEN" "Done! Type h4xtools in your terminal to start!"
    else
        print_msg "$RED" "Failed to build H4X-Tools executable"
        FAILED_TOOLS=$((FAILED_TOOLS + 1))
    fi
}

# Function to check for root privileges
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_msg "$YELLOW" "This script will need sudo privileges for some operations."
        print_msg "$YELLOW" "You may be prompted for your password during execution."
    fi
}

# Function to install essential security tools
install_essential_security_tools() {
    print_msg "$PURPLE" "Installing Essential Security Tools..."
    
    # Wireshark
    install_tool "Wireshark" "wireshark tshark" "" ""
    
    # Snort
    install_tool "Snort" "snort" "" ""
    
    # TCPDump
    install_tool "TCPDump" "tcpdump" "" ""
    
    # Fail2Ban
    install_tool "Fail2Ban" "fail2ban" "" ""
    
    # UFW
    install_tool "UFW" "ufw" "" ""
    
    # Nmap
    install_tool "Nmap" "nmap" "" ""
    
    # DirBuster alternative
    install_tool "Directory Busting Tools" "dirb gobuster" "" ""
    
    # OSINT tools
    install_tool "OSINT Tools" "whois" "shodan" ""
    
    print_msg "$GREEN" "Essential security tools installed successfully"
}

# Function to ask user if they want to install all security tools
ask_install_all_tools() {
    echo
    read -r -p "Do you want to install all available security tools? This may take a long time. (y/n): " answer
    if [[ $answer == "y" || $answer == "Y" || $answer == "yes" || $answer == "Yes" ]]; then
        return 0
    else
        return 1
    fi
}

# Function to install network analysis tools
install_network_analysis_tools() {
    print_msg "$PURPLE" "Installing Network Analysis Tools..."
    
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

# Function to install advanced IDS/IPS tools
install_ids_ips_tools() {
    print_msg "$PURPLE" "Installing Advanced Intrusion Detection/Prevention Tools..."
    
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
    
    # CrowdSec
    install_tool "CrowdSec" "" "" "
        if ! command -v cscli >/dev/null 2>&1; then
            curl -s https://packagecloud.io/install/repositories/crowdsec/crowdsec/script.deb.sh | sudo bash
            sudo apt install -y crowdsec
        fi
    "
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
        echo -e "${YELLOW}Some tools require manual installation. Please refer to their documentation.${NC}"
    fi
    
    echo -e "${GREEN}H4X-Tools installation complete!${NC}"
    echo
    
    if command -v h4xtools >/dev/null 2>&1; then
        read -r -p "Do you want to start H4XTools now? (y/n) " answer
        if [[ $answer == "y" ||  $answer == "Y" || $answer == "yes" || $answer == "Yes" ]]; then
            h4xtools
        fi
    fi
}

# Main function
main() {
    # Initialize log file
    echo "H4X-Tools Installation Log" > "$LOG_FILE"
    echo "Date: $(date)" >> "$LOG_FILE"
    echo "----------------------------------------" >> "$LOG_FILE"
    
    print_header
    check_root
    detect_os
    update_packages
    install_python_prerequisites
    install_build_tools
    
    # Setup Python environment
    setup_python_env
    
    # Build executable
    build_executable
    
    # Install essential security tools
    install_essential_security_tools
    
    # Ask if user wants to install all tools
    if ask_install_all_tools; then
        install_network_analysis_tools
        install_ids_ips_tools
        # Uncomment below if you want to add more tool installations
        # install_vuln_scanning_tools
        # install_web_security_tools
        # install_firewall_tools
        # install_vpn_tools
        # install_monitoring_tools
        # install_dns_security_tools
        # install_honeypot_tools
        # install_password_tools
        # install_incident_response_tools
        # install_misc_tools
    fi
    
    # Print summary
    print_summary
}

# Run the main function
main