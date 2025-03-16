import { ApiResponse } from './api';

interface BannedIP {
  ip: string;
  timestamp: string;
  attempts: number;
  jail: string;
  status: 'active' | 'expired';
}

interface VPNStatus {
  is_active: boolean;
  connections: string[];
  last_check: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const securityApi = {
  getFail2banStatus: async (): Promise<ApiResponse<BannedIP[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/security/fail2ban`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch Fail2ban status',
        timestamp: new Date().toISOString()
      };
    }
  },

  getVPNStatus: async (): Promise<ApiResponse<VPNStatus>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/security/vpn`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch VPN status',
        timestamp: new Date().toISOString()
      };
    }
  }
};