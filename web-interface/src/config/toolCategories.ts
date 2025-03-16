export type CategoryKey = 
  | 'network'
  | 'web'
  | 'osint'
  | 'forensics'
  | 'crypto'
  | 'security';

interface Category {
  name: string;
  description: string;
  icon: string;
}

interface Input {
  name: string;
  type: 'text' | 'number' | 'password' | 'url' | 'textarea';
  placeholder: string;
  required: boolean;
  defaultValue?: string | number;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: CategoryKey;
  function: string;
  inputs: Input[];
}

export const CATEGORIES: Record<CategoryKey, Category> = {
  network: {
    name: 'Network',
    description: 'Network scanning and analysis tools',
    icon: '🌐'
  },
  web: {
    name: 'Web',
    description: 'Web application security tools',
    icon: '🕸️'
  },
  osint: {
    name: 'OSINT',
    description: 'Open Source Intelligence tools',
    icon: '🔍'
  },
  forensics: {
    name: 'Forensics',
    description: 'Digital forensics and analysis tools',
    icon: '🔬'
  },
  crypto: {
    name: 'Crypto',
    description: 'Cryptography and encoding tools',
    icon: '🔐'
  },
  security: {
    name: 'Security',
    description: 'System security and monitoring tools',
    icon: '🛡️'
  }
};

export const TOOLS: Tool[] = [
  {
    id: 'port_scanner',
    name: 'Port Scanner',
    description: 'Scan for open ports on a target host',
    category: 'network',
    function: 'scan',
    inputs: [
      {
        name: 'target',
        type: 'text',
        placeholder: 'Enter IP address or hostname',
        required: true
      },
      {
        name: 'port_range',
        type: 'text',
        placeholder: 'Port range (e.g. 1-1000)',
        required: false,
        defaultValue: '1-1000'
      }
    ]
  },
  {
    id: 'ip_lookup',
    name: 'IP Lookup',
    description: 'Get information about an IP address',
    category: 'network',
    function: 'lookup',
    inputs: [
      {
        name: 'ip',
        type: 'text',
        placeholder: 'Enter IP address',
        required: true
      }
    ]
  },
  {
    id: 'dir_buster',
    name: 'Directory Buster',
    description: 'Find hidden directories on a web server',
    category: 'web',
    function: 'scan',
    inputs: [
      {
        name: 'url',
        type: 'url',
        placeholder: 'Enter target URL',
        required: true
      },
      {
        name: 'wordlist',
        type: 'text',
        placeholder: 'Wordlist path (optional)',
        required: false
      }
    ]
  },
  {
    id: 'web_scrape',
    name: 'Web Scraper',
    description: 'Extract information from web pages',
    category: 'web',
    function: 'scrape',
    inputs: [
      {
        name: 'url',
        type: 'url',
        placeholder: 'Enter URL to scrape',
        required: true
      },
      {
        name: 'selector',
        type: 'text',
        placeholder: 'CSS selector (optional)',
        required: false
      }
    ]
  },
  {
    id: 'username_search',
    name: 'Username Search',
    description: 'Search for username across platforms',
    category: 'osint',
    function: 'search',
    inputs: [
      {
        name: 'username',
        type: 'text',
        placeholder: 'Enter username',
        required: true
      }
    ]
  },
  {
    id: 'email_search',
    name: 'Email Search',
    description: 'Find information about an email address',
    category: 'osint',
    function: 'search',
    inputs: [
      {
        name: 'email',
        type: 'text',
        placeholder: 'Enter email address',
        required: true
      }
    ]
  },
  {
    id: 'phone_lookup',
    name: 'Phone Lookup',
    description: 'Get information about a phone number',
    category: 'osint',
    function: 'lookup',
    inputs: [
      {
        name: 'phone',
        type: 'text',
        placeholder: 'Enter phone number',
        required: true
      }
    ]
  },
  {
    id: 'ig_scrape',
    name: 'Instagram Scraper',
    description: 'Extract information from Instagram profiles',
    category: 'osint',
    function: 'scrape',
    inputs: [
      {
        name: 'username',
        type: 'text',
        placeholder: 'Enter Instagram username',
        required: true
      }
    ]
  },
  {
    id: 'whois_lookup',
    name: 'WHOIS Lookup',
    description: 'Get domain registration information',
    category: 'osint',
    function: 'lookup',
    inputs: [
      {
        name: 'domain',
        type: 'text',
        placeholder: 'Enter domain name',
        required: true
      }
    ]
  },
  {
    id: 'wifi_finder',
    name: 'WiFi Finder',
    description: 'Scan for nearby wireless networks',
    category: 'network',
    function: 'scan',
    inputs: []
  },
  {
    id: 'local_user_enum',
    name: 'Local User Enumeration',
    description: 'Enumerate local system users',
    category: 'forensics',
    function: 'enumerate',
    inputs: []
  },
  {
    id: 'caesar_cipher',
    name: 'Caesar Cipher',
    description: 'Encrypt/decrypt text using Caesar cipher',
    category: 'crypto',
    function: 'encrypt/decrypt',
    inputs: [
      {
        name: 'text',
        type: 'textarea',
        placeholder: 'Enter text to encrypt/decrypt',
        required: true
      },
      {
        name: 'shift',
        type: 'number',
        placeholder: 'Enter shift value',
        required: true,
        defaultValue: 3
      }
    ]
  },
  {
    id: 'basexx',
    name: 'Base Encoder/Decoder',
    description: 'Encode/decode text in various base formats',
    category: 'crypto',
    function: 'encode/decode',
    inputs: [
      {
        name: 'text',
        type: 'textarea',
        placeholder: 'Enter text to encode/decode',
        required: true
      },
      {
        name: 'format',
        type: 'text',
        placeholder: 'Enter base format (16/32/64/85)',
        required: true,
        defaultValue: '64'
      }
    ]
  }
];