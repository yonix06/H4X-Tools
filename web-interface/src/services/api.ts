import axios, { AxiosResponse } from 'axios';
import {
  IgScrapeResult,
  WebSearchResult,
  PhoneLookupResult,
  IpLookupResult,
  PortScannerResult,
  UsernameSearchResult,
  CybercrimeIntResult,
  EmailSearchResult,
  WebhookSpammerResult,
  WhoisLookupResult,
  SmsBomberResult,
  FakeInfoResult,
  WebScrapeResult,
  WifiFinderResult,
  WifiVaultResult,
  DirBusterResult,
  LocalUserEnumResult,
  CaesarCipherResult,
  BasexxResult,
} from './types';

// URL de base de l'API (à configurer selon votre environnement)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Interface pour les réponses de l'API
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  timestamp: string;
}

// Type pour les paramètres d'entrée
type RequestParams = Record<string, string>;

// Service API pour communiquer avec le backend
const apiService = {
  // Fonction générique pour exécuter n'importe quel outil
  executeTool: async <T>(toolId: string, params: RequestParams): Promise<ApiResponse<T>> => {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await axios.post(
        `${API_BASE_URL}/tools/${toolId}`, 
        params
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return error.response.data as ApiResponse<T>;
      }
      
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Fonctions spécifiques pour chaque outil
  igScrape: (username: string) => {
    return apiService.executeTool<IgScrapeResult>('ig_scrape', { username });
  },

  webSearch: (query: string) => {
    return apiService.executeTool<WebSearchResult>('web_search', { query });
  },

  phoneLookup: (phone: string) => {
    return apiService.executeTool<PhoneLookupResult>('phone_lookup', { phone });
  },

  ipLookup: (ip: string) => {
    return apiService.executeTool<IpLookupResult>('ip_lookup', { ip });
  },

  portScanner: (target: string, portRange: string) => {
    return apiService.executeTool<PortScannerResult>('port_scanner', { target, port_range: portRange });
  },

  usernameSearch: (username: string) => {
    return apiService.executeTool<UsernameSearchResult>('username_search', { username });
  },

  cybercrimeInt: (target: string) => {
    return apiService.executeTool<CybercrimeIntResult>('cybercrime_int', { target });
  },

  emailSearch: (email: string) => {
    return apiService.executeTool<EmailSearchResult>('email_search', { email });
  },

  webhookSpammer: (webhookUrl: string, message: string, count: number) => {
    return apiService.executeTool<WebhookSpammerResult>('webhook_spammer', { 
      webhook_url: webhookUrl,
      message,
      count: count.toString()
    });
  },

  whoisLookup: (domain: string) => {
    return apiService.executeTool<WhoisLookupResult>('whois_lookup', { domain });
  },

  smsBomber: (phone: string, count: number) => {
    return apiService.executeTool<SmsBomberResult>('sms_bomber', { 
      phone,
      count: count.toString()
    });
  },

  fakeInfoGenerator: (locale: string = 'en_US') => {
    return apiService.executeTool<FakeInfoResult>('fake_info_generator', { locale });
  },

  webScrape: (url: string) => {
    return apiService.executeTool<WebScrapeResult>('web_scrape', { url });
  },

  wifiFinder: () => {
    return apiService.executeTool<WifiFinderResult>('wifi_finder', {});
  },

  wifiVault: () => {
    return apiService.executeTool<WifiVaultResult>('wifi_vault', {});
  },

  dirBuster: (url: string, wordlist: string = '') => {
    return apiService.executeTool<DirBusterResult>('dir_buster', { url, wordlist });
  },

  localUserEnum: () => {
    return apiService.executeTool<LocalUserEnumResult>('local_user_enum', {});
  },

  caesarCipher: (
    message: string,
    shift: number = 0,
    mode: 'encrypt' | 'decrypt' | 'bruteforce' = 'bruteforce'
  ) => {
    return apiService.executeTool<CaesarCipherResult>('caesar_cipher', {
      message,
      shift: shift.toString(),
      mode
    });
  },

  basexx: (
    message: string,
    mode: 'encode' | 'decode' = 'encode',
    base: '64' | '32' | '16' = '64'
  ) => {
    return apiService.executeTool<BasexxResult>('basexx', { message, mode, base });
  },
};

export default apiService;