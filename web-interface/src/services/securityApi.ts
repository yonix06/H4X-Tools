import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  timestamp?: string;
}

export const securityApi = {
  // Security monitoring endpoints
  async getFail2banStatus(): Promise<ApiResponse> {
    const response = await axios.get(`${BASE_URL}/security/fail2ban`);
    return response.data;
  },

  async getVPNStatus(): Promise<ApiResponse> {
    const response = await axios.get(`${BASE_URL}/security/vpn`);
    return response.data;
  },

  async getBannedIPs(jail?: string): Promise<ApiResponse> {
    const response = await axios.get(`${BASE_URL}/security/banned-ips`, {
      params: { jail }
    });
    return response.data;
  },

  async unbanIP(ip: string, jail?: string): Promise<ApiResponse> {
    const response = await axios.post(`${BASE_URL}/security/unban-ip`, {
      ip,
      jail
    });
    return response.data;
  },

  async getSecurityEvents(): Promise<ApiResponse> {
    const response = await axios.get(`${BASE_URL}/security/events`);
    return response.data;
  },

  // Investigation management
  async listInvestigations(): Promise<ApiResponse> {
    const response = await axios.get(`${BASE_URL}/investigations`);
    return response.data;
  },

  async createInvestigation(data: {
    title: string;
    description?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<ApiResponse> {
    const response = await axios.post(`${BASE_URL}/investigations`, data);
    return response.data;
  },

  async getInvestigation(id: number): Promise<ApiResponse> {
    const response = await axios.get(`${BASE_URL}/investigations/${id}`);
    return response.data;
  },

  async updateInvestigation(id: number, data: {
    title?: string;
    description?: string;
    status?: 'active' | 'archived' | 'closed';
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<ApiResponse> {
    const response = await axios.put(`${BASE_URL}/investigations/${id}`, data);
    return response.data;
  },

  async deleteInvestigation(id: number): Promise<ApiResponse> {
    const response = await axios.delete(`${BASE_URL}/investigations/${id}`);
    return response.data;
  },

  async getInvestigationNotes(id: number): Promise<ApiResponse> {
    const response = await axios.get(`${BASE_URL}/investigations/${id}/notes`);
    return response.data;
  },

  async addInvestigationNote(id: number, content: string): Promise<ApiResponse> {
    const response = await axios.post(`${BASE_URL}/investigations/${id}/notes`, {
      content
    });
    return response.data;
  },

  // Tool execution
  async executeTool(toolId: string, params: Record<string, any>): Promise<ApiResponse> {
    const response = await axios.post(`${BASE_URL}/tools/${toolId}`, params);
    return response.data;
  },

  // Error handling wrapper
  async executeRequest<T>(request: () => Promise<T>): Promise<ApiResponse<T>> {
    try {
      const result = await request();
      return {
        status: 'success',
        data: result,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error.response?.data?.message || error.message || 'An error occurred',
        timestamp: new Date().toISOString()
      };
    }
  }
};