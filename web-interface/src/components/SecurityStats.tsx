import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native-web';
import { useTheme } from '../contexts/ThemeContext';
import { securityApi } from '../services/securityApi';

interface SecurityEvent {
  id: number;
  event_type: 'fail2ban' | 'vpn' | 'custom';
  source_ip?: string;
  timestamp: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved';
}

export const SecurityStats: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSecurityEvents = async () => {
    try {
      const response = await securityApi.getSecurityEvents();
      if (response.status === 'success') {
        setEvents(response.data);
      } else {
        setError(response.message || 'Failed to fetch security events');
      }
    } catch (err) {
      setError('Failed to fetch security events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityEvents();
    // Poll for new events every minute
    const interval = setInterval(fetchSecurityEvents, 60000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return isDark ? '#ef4444' : '#dc2626';
      case 'high':
        return isDark ? '#f97316' : '#ea580c';
      case 'medium':
        return isDark ? '#eab308' : '#ca8a04';
      case 'low':
        return isDark ? '#22c55e' : '#16a34a';
      default:
        return isDark ? '#6b7280' : '#4b5563';
    }
  };

  const getEventTypeIcon = (type: SecurityEvent['event_type']) => {
    switch (type) {
      case 'fail2ban':
        return '🛡️';
      case 'vpn':
        return '🔒';
      case 'custom':
        return '⚡';
      default:
        return '📌';
    }
  };

  return (
    <View style={{
      backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
      borderRadius: 8,
      padding: 16,
      marginBottom: 24,
    }}>
      <Text style={{
        fontSize: 20,
        fontWeight: 'bold',
        color: isDark ? '#10b981' : '#059669',
        marginBottom: 16,
      }}>
        Security Monitoring
      </Text>

      {isLoading ? (
        <Text style={{
          color: isDark ? '#d1d5db' : '#4b5563',
          textAlign: 'center',
          padding: 16,
        }}>
          Loading security events...
        </Text>
      ) : error ? (
        <Text style={{
          color: isDark ? '#ef4444' : '#dc2626',
          textAlign: 'center',
          padding: 16,
        }}>
          {error}
        </Text>
      ) : (
        <View>
          {/* Event Timeline */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              color: isDark ? '#d1d5db' : '#4b5563',
              fontSize: 16,
              fontWeight: 'bold',
              marginBottom: 12,
            }}>
              Recent Events
            </Text>
            {events.length === 0 ? (
              <Text style={{
                color: isDark ? '#9ca3af' : '#6b7280',
                textAlign: 'center',
                padding: 16,
              }}>
                No recent security events
              </Text>
            ) : (
              events.map(event => (
                <View
                  key={event.id}
                  style={{
                    backgroundColor: isDark ? '#374151' : '#e5e7eb',
                    borderRadius: 6,
                    padding: 12,
                    marginBottom: 8,
                    borderLeftWidth: 4,
                    borderLeftColor: getSeverityColor(event.severity),
                  }}
                >
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}>
                    <Text style={{ marginRight: 8 }}>
                      {getEventTypeIcon(event.event_type)}
                    </Text>
                    <Text style={{
                      color: isDark ? '#e5e7eb' : '#1f2937',
                      fontWeight: 'bold',
                      flex: 1,
                    }}>
                      {event.event_type.toUpperCase()}
                    </Text>
                    <Text style={{
                      color: isDark ? '#9ca3af' : '#6b7280',
                      fontSize: 12,
                    }}>
                      {new Date(event.timestamp).toLocaleString()}
                    </Text>
                  </View>

                  {event.source_ip && (
                    <Text style={{
                      color: isDark ? '#d1d5db' : '#4b5563',
                      marginBottom: 4,
                    }}>
                      Source IP: {event.source_ip}
                    </Text>
                  )}

                  <Text style={{
                    color: isDark ? '#9ca3af' : '#6b7280',
                    fontSize: 14,
                  }}>
                    {typeof event.details === 'string' 
                      ? event.details 
                      : JSON.stringify(event.details, null, 2)}
                  </Text>

                  <View style={{
                    flexDirection: 'row',
                    marginTop: 8,
                    gap: 8,
                  }}>
                    <View style={{
                      backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                      paddingVertical: 2,
                      paddingHorizontal: 8,
                      borderRadius: 12,
                    }}>
                      <Text style={{
                        color: getSeverityColor(event.severity),
                        fontSize: 12,
                        fontWeight: 'bold',
                      }}>
                        {event.severity.toUpperCase()}
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                      paddingVertical: 2,
                      paddingHorizontal: 8,
                      borderRadius: 12,
                    }}>
                      <Text style={{
                        color: isDark ? '#d1d5db' : '#4b5563',
                        fontSize: 12,
                      }}>
                        {event.status}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      )}
    </View>
  );
};