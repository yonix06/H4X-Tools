// Types communs pour les outils H4X-Tools

// Type pour les outils
export interface Tool {
  id: string;
  name: string;
  description: string;
  inputs: InputField[];
  loading?: boolean;
  isAvailable?: boolean;
  category?: string;
}

// Type pour les champs d'entrée des outils
export interface InputField {
  name: string;
  placeholder: string;
  type: 'text' | 'number' | 'password';
  value: string;
}

// Types spécifiques pour les résultats des différents outils

// Instagram Scrape
export interface IgScrapeResult {
  username: string;
  full_name: string;
  biography: string;
  followers: number;
  following: number;
  posts: number;
  profile_url: string;
  is_private: boolean;
  is_verified: boolean;
  recent_posts?: {
    url: string;
    caption: string;
    likes: number;
    comments: number;
  }[];
}

// Web Search
export interface WebSearchResult {
  query: string;
  results: {
    title: string;
    url: string;
    description: string;
  }[];
}

// Phone Lookup
export interface PhoneLookupResult {
  number: string;
  country_code: string;
  carrier: string;
  line_type: string;
  location: string;
  is_valid: boolean;
}

// IP Lookup
export interface IpLookupResult {
  ip: string;
  hostname: string;
  city: string;
  region: string;
  country: string;
  loc: string;
  org: string;
  postal: string;
  timezone: string;
}

// Port Scanner
export interface PortScannerResult {
  target: string;
  open_ports: number[];
  closed_ports: number[];
  scan_time: string;
}

// Username Search
export interface UsernameSearchResult {
  username: string;
  found_on: {
    site: string;
    url: string;
    exists: boolean;
  }[];
}

// Cybercrime Int
export interface CybercrimeIntResult {
  target: string;
  breaches: {
    name: string;
    domain: string;
    breach_date: string;
    description: string;
    data_classes: string[];
  }[];
}

// Email Search
export interface EmailSearchResult {
  email: string;
  services: {
    name: string;
    exists: boolean;
    url: string;
  }[];
}

// Webhook Spammer
export interface WebhookSpammerResult {
  webhook_url: string;
  messages_sent: number;
  success_count: number;
  failed_count: number;
}

// Whois Lookup
export interface WhoisLookupResult {
  domain: string;
  registrar: string;
  whois_server: string;
  creation_date: string;
  expiration_date: string;
  name_servers: string[];
  status: string[];
  registrant: {
    name: string;
    organization: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    email: string;
    phone: string;
  };
}

// SMS Bomber
export interface SmsBomberResult {
  target: string;
  messages_sent: number;
  success_count: number;
  failed_count: number;
}

// Fake Info Generator
export interface FakeInfoResult {
  name: string;
  address: string;
  email: string;
  phone: string;
  ssn: string;
  credit_card: string;
  job: string;
  company: string;
  birth_date: string;
}

// Web Scrape
export interface WebScrapeResult {
  url: string;
  links: string[];
  images: string[];
  scripts: string[];
  title: string;
}

// WiFi Finder
export interface WifiFinderResult {
  networks: {
    ssid: string;
    bssid: string;
    signal_strength: string;
    channel: number;
    security: string;
  }[];
}

// WiFi Vault
export interface WifiVaultResult {
  saved_networks: {
    ssid: string;
    password: string;
    security: string;
  }[];
}

// Dir Buster
export interface DirBusterResult {
  url: string;
  found_paths: {
    path: string;
    status_code: number;
    content_type: string;
    size: number;
  }[];
}

// Local User Enum
export interface LocalUserEnumResult {
  users: {
    username: string;
    uid: string;
    gid: string;
    home: string;
    shell: string;
  }[];
}

// Caesar Cipher
export interface CaesarCipherResult {
  original: string;
  results: {
    shift: number;
    result: string;
  }[];
  mode: string;
}

// BaseXX
export interface BasexxResult {
  original: string;
  result: string;
  mode: string;
  base: string;
}