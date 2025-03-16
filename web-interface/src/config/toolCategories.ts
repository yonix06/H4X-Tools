export type CategoryKey = 'osint' | 'network' | 'system' | 'utility';

interface ToolInput {
  name: string;
  type: 'text' | 'number' | 'password' | 'email' | 'url';
  placeholder?: string;
  required?: boolean;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: CategoryKey;
  function: 'investigation' | 'analysis' | 'monitoring' | 'utility';
  inputs: ToolInput[];
}

interface Category {
  name: string;
  description: string;
  icon?: string;
}

export const CATEGORIES: Record<CategoryKey, Category> = {
  osint: {
    name: 'OSINT',
    description: 'Open Source Intelligence tools for gathering public information',
    icon: '🔍'
  },
  network: {
    name: 'Network',
    description: 'Network analysis and security tools',
    icon: '🌐'
  },
  system: {
    name: 'System',
    description: 'System security and monitoring tools',
    icon: '💻'
  },
  utility: {
    name: 'Utility',
    description: 'General purpose security utilities',
    icon: '🛠️'
  }
};

export const TOOLS: Tool[] = [
  {
    id: 'ig_scrape',
    name: 'Instagram Scraper',
    description: 'Scrapes public information from Instagram accounts',
    category: 'osint',
    function: 'investigation',
    inputs: [
      {
        name: 'username',
        type: 'text',
        placeholder: 'Instagram username',
        required: true
      }
    ]
  },
  {
    id: 'ip_lookup',
    name: 'IP Lookup',
    description: 'Gathers information about an IP address or domain',
    category: 'network',
    function: 'investigation',
    inputs: [
      {
        name: 'ip',
        type: 'text',
        placeholder: 'IP address or domain',
        required: true
      }
    ]
  },
  {
    id: 'port_scanner',
    name: 'Port Scanner',
    description: 'Scans for open ports on a target host',
    category: 'network',
    function: 'analysis',
    inputs: [
      {
        name: 'target',
        type: 'text',
        placeholder: 'IP address or domain',
        required: true
      },
      {
        name: 'port_range',
        type: 'text',
        placeholder: '1-1000',
        required: false
      }
    ]
  },
  {
    id: 'cybercrime_int',
    name: 'Cybercrime Intelligence',
    description: 'Checks if email/domain has been compromised in known breaches',
    category: 'osint',
    function: 'investigation',
    inputs: [
      {
        name: 'target',
        type: 'text',
        placeholder: 'Email or domain',
        required: true
      }
    ]
  },
  {
    id: 'email_search',
    name: 'Email Search',
    description: 'Finds registered accounts associated with an email address',
    category: 'osint',
    function: 'investigation',
    inputs: [
      {
        name: 'email',
        type: 'email',
        placeholder: 'Email address',
        required: true
      }
    ]
  },
  {
    id: 'username_search',
    name: 'Username Search',
    description: 'Searches for a username across multiple platforms',
    category: 'osint',
    function: 'investigation',
    inputs: [
      {
        name: 'username',
        type: 'text',
        placeholder: 'Username to search',
        required: true
      }
    ]
  },
  {
    id: 'whois_lookup',
    name: 'WHOIS Lookup',
    description: 'Retrieves WHOIS information for a domain',
    category: 'network',
    function: 'investigation',
    inputs: [
      {
        name: 'domain',
        type: 'text',
        placeholder: 'Domain name',
        required: true
      }
    ]
  },
  {
    id: 'wifi_finder',
    name: 'Wi-Fi Network Scanner',
    description: 'Scans for nearby Wi-Fi networks',
    category: 'network',
    function: 'monitoring',
    inputs: []
  },
  {
    id: 'wifi_vault',
    name: 'Wi-Fi Password Vault',
    description: 'Manages saved Wi-Fi network credentials',
    category: 'system',
    function: 'utility',
    inputs: []
  },
  {
    id: 'dir_buster',
    name: 'Directory Buster',
    description: 'Discovers hidden directories on web servers',
    category: 'network',
    function: 'analysis',
    inputs: [
      {
        name: 'url',
        type: 'url',
        placeholder: 'Target URL',
        required: true
      },
      {
        name: 'wordlist',
        type: 'text',
        placeholder: 'Path to wordlist (optional)',
        required: false
      }
    ]
  },
  {
    id: 'local_user_enum',
    name: 'Local User Enumeration',
    description: 'Enumerates local system user accounts',
    category: 'system',
    function: 'analysis',
    inputs: []
  }
];