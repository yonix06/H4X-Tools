import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native-web';
import { useTheme } from '../contexts/ThemeContext';
import { securityEventsApi, SecurityEvent } from '../services/securityEvents';
import { LoadingSpinner } from './LoadingSpinner';

export const SecurityEvents: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await securityEventsApi.getEvents();
        if (response.status === 'success' && response.data) {
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

    fetchEvents();
    // Poll events every 30 seconds
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (eventId: number, newStatus: SecurityEvent['status']) => {
    try {
      const response = await securityEventsApi.updateEventStatus(eventId, newStatus);
      if (response.status === 'success' && response.data) {
        setEvents(prev => 
          prev.map(event => 
            event.id === eventId ? { ...event, status: newStatus } : event
          )
        );
      }
    } catch (err) {
      console.error('Failed to update event status:', err);
    }
  };

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return isDark ? '#ef4444' : '#dc2626';
      case 'high':
        return isDark ? '#f97316' : '#ea580c';
      case 'medium':
        return isDark ? '#f59e0b' : '#d97706';
      case 'low':
        return isDark ? '#10b981' : '#059669';
      default:
        return isDark ? '#6b7280' : '#9ca3af';
    }
  };

  const getStatusColor = (status: SecurityEvent['status']) => {
    switch (status) {
      case 'new':
        return isDark ? '#ef4444' : '#dc2626';
      case 'investigating':
        return isDark ? '#f59e0b' : '#d97706';
      case 'resolved':
        return isDark ? '#10b981' : '#059669';
      default:
        return isDark ? '#6b7280' : '#9ca3af';
    }
  };

  if (error) {
    return (
      <View style={{
        backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
        padding: 16,
        borderRadius: 6,
        marginBottom: 24
      }}>
        <Text style={{
          color: isDark ? '#ef4444' : '#dc2626',
          textAlign: 'center'
        }}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={{
      backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
      padding: 16,
      borderRadius: 6,
      marginBottom: 24,
      opacity: isLoading ? 0.7 : 1
    }}>
      <Text style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: isDark ? '#10b981' : '#059669',
        marginBottom: 16
      }}>
        Security Events {isLoading && '(Updating...)'}
      </Text>

      <ScrollView style={{ maxHeight: 400 }}>
        {events.map((event) => (
          <View
            key={event.id}
            style={{
              backgroundColor: isDark ? '#374151' : '#e5e7eb',
              padding: 16,
              borderRadius: 6,
              marginBottom: 8
            }}
          >
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <View>
                <Text style={{
                  color: isDark ? '#ffffff' : '#111827',
                  fontWeight: 'bold',
                  fontSize: 16
                }}>
                  {event.event_type.toUpperCase()}
                </Text>
                <Text style={{
                  color: isDark ? '#9ca3af' : '#6b7280',
                  fontSize: 12
                }}>
                  {new Date(event.timestamp).toLocaleString()}
                </Text>
              </View>

              <View style={{
                flexDirection: 'row',
                gap: 8
              }}>
                <View style={{
                  backgroundColor: getSeverityColor(event.severity),
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: 12
                }}>
                  <Text style={{
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}>
                    {event.severity.toUpperCase()}
                  </Text>
                </View>
                
                <TouchableOpacity
                  onPress={() => {
                    const nextStatus: Record<SecurityEvent['status'], SecurityEvent['status']> = {
                      'new': 'investigating',
                      'investigating': 'resolved',
                      'resolved': 'new'
                    };
                    handleStatusChange(event.id, nextStatus[event.status]);
                  }}
                  style={{
                    backgroundColor: getStatusColor(event.status),
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 12
                  }}
                >
                  <Text style={{
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}>
                    {event.status.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {event.source_ip && (
              <Text style={{
                color: isDark ? '#d1d5db' : '#4b5563',
                fontSize: 14,
                marginBottom: 4
              }}>
                Source IP: {event.source_ip}
              </Text>
            )}

            <View style={{
              backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
              padding: 12,
              borderRadius: 4,
              marginTop: 8
            }}>
              <Text style={{
                color: isDark ? '#d1d5db' : '#4b5563',
                fontSize: 14,
                fontFamily: 'monospace'
              }}>
                {JSON.stringify(event.details, null, 2)}
              </Text>
            </View>
          </View>
        ))}

        {events.length === 0 && !isLoading && (
          <Text style={{
            color: isDark ? '#9ca3af' : '#6b7280',
            textAlign: 'center',
            padding: 16
          }}>
            No security events found
          </Text>
        )}
      </ScrollView>
    </View>
  );
};