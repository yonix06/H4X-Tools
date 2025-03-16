import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native-web';
import { useTheme } from '../contexts/ThemeContext';
import { securityApi } from '../services/securityApi';

interface SecurityEvent {
  id: number;
  event_type: string;
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

  useEffect(() => {
    fetchSecurityEvents();
    // Poll for new events every 30 seconds
    const interval = setInterval(fetchSecurityEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSecurityEvents = async () => {
    try {
      const response = await securityApi.getSecurityEvents();
      if (response.status === 'success') {
        setEvents(response.data);
      } else {
        setError('Failed to fetch security events');
      }
    } catch (err) {
      setError('Failed to fetch security events');
    } finally {
      setIsLoading(false);
    }
  };

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

  const getStatusColor = (status: SecurityEvent['status']) => {
    switch (status) {
      case 'new':
        return isDark ? '#f97316' : '#ea580c';
      case 'investigating':
        return isDark ? '#eab308' : '#ca8a04';
      case 'resolved':
        return isDark ? '#22c55e' : '#16a34a';
      default:
        return isDark ? '#6b7280' : '#4b5563';
    }
  };

  const formatEventDetails = (event: SecurityEvent) => {
    switch (event.event_type) {
      case 'fail2ban':
        return `IP ${event.source_ip} banned in ${event.details.jail}`;
      case 'vpn':
        return `VPN connection ${event.details.action} from ${event.source_ip}`;
      default:
        return JSON.stringify(event.details);
    }
  };

  if (isLoading) {
    return (
      <View style={{
        padding: 16,
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderRadius: 8,
      }}>
        <Text style={{ color: isDark ? '#d1d5db' : '#4b5563' }}>
          Loading security events...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{
        padding: 16,
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderRadius: 8,
      }}>
        <Text style={{ color: isDark ? '#ef4444' : '#dc2626' }}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={{
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderRadius: 8,
      padding: 16,
    }}>
      <Text style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: isDark ? '#d1d5db' : '#4b5563',
        marginBottom: 16,
      }}>
        Security Events Timeline
      </Text>

      <ScrollView style={{ maxHeight: 400 }}>
        {events.map((event, index) => (
          <View
            key={event.id}
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              marginBottom: 16,
              position: 'relative',
            }}
          >
            {/* Timeline line */}
            {index < events.length - 1 && (
              <View style={{
                position: 'absolute',
                left: 12,
                top: 24,
                bottom: -8,
                width: 2,
                backgroundColor: isDark ? '#374151' : '#e5e7eb',
              }} />
            )}

            {/* Event dot */}
            <View style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: getSeverityColor(event.severity),
              marginRight: 12,
              zIndex: 1,
            }} />

            {/* Event content */}
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: isDark ? '#e5e7eb' : '#1f2937',
                marginBottom: 4,
              }}>
                {event.event_type}
              </Text>
              
              <Text style={{
                color: isDark ? '#9ca3af' : '#6b7280',
                marginBottom: 4,
              }}>
                {formatEventDetails(event)}
              </Text>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                {event.source_ip && (
                  <View style={{
                    backgroundColor: isDark ? '#374151' : '#f3f4f6',
                    paddingVertical: 2,
                    paddingHorizontal: 8,
                    borderRadius: 12,
                  }}>
                    <Text style={{
                      color: isDark ? '#d1d5db' : '#4b5563',
                      fontSize: 12,
                    }}>
                      IP: {event.source_ip}
                    </Text>
                  </View>
                )}

                <View style={{
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
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
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  paddingVertical: 2,
                  paddingHorizontal: 8,
                  borderRadius: 12,
                }}>
                  <Text style={{
                    color: getStatusColor(event.status),
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}>
                    {event.status.toUpperCase()}
                  </Text>
                </View>

                <Text style={{
                  color: isDark ? '#6b7280' : '#9ca3af',
                  fontSize: 12,
                }}>
                  {new Date(event.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {events.length === 0 && (
          <Text style={{
            color: isDark ? '#9ca3af' : '#6b7280',
            textAlign: 'center',
            padding: 24,
          }}>
            No security events to display
          </Text>
        )}
      </ScrollView>
    </View>
  );
};