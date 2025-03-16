import { ApiResponse } from './api';

export interface SecurityEvent {
  id: number;
  event_type: 'fail2ban' | 'vpn' | 'custom';
  source_ip?: string;
  timestamp: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved';
  investigation_id?: number;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const securityEventsApi = {
  getEvents: async (): Promise<ApiResponse<SecurityEvent[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/security/events`);
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch security events',
        timestamp: new Date().toISOString()
      };
    }
  },

  updateEventStatus: async (eventId: number, status: SecurityEvent['status']): Promise<ApiResponse<SecurityEvent>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/security/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to update event status',
        timestamp: new Date().toISOString()
      };
    }
  },

  linkToInvestigation: async (eventId: number, investigationId: number): Promise<ApiResponse<SecurityEvent>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/security/events/${eventId}/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ investigation_id: investigationId })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to link event to investigation',
        timestamp: new Date().toISOString()
      };
    }
  }
};