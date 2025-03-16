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

  const getSeverityClass = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusClass = (status: SecurityEvent['status']) => {
    switch (status) {
      case 'new':
        return 'bg-red-500';
      case 'investigating':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (error) {
    return (
      <View className="bg-dark-gray-800 rounded-lg p-4 mb-6">
        <Text className="text-red-500 text-center">
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View className={`bg-dark-gray-800 rounded-lg p-4 mb-6 ${isLoading ? 'opacity-70' : ''}`}>
      <Text className="text-lg font-bold text-hacker-green mb-4">
        Security Events {isLoading && '(Updating...)'}
      </Text>

      <ScrollView className="max-h-[400px]">
        {events.map((event) => (
          <View
            key={event.id}
            className="bg-dark-gray-900 rounded-lg p-4 mb-2"
          >
            <View className="flex flex-row justify-between items-center mb-2">
              <View>
                <Text className="text-base font-bold text-gray-200">
                  {event.event_type.toUpperCase()}
                </Text>
                <Text className="text-gray-400 text-xs">
                  {new Date(event.timestamp).toLocaleString()}
                </Text>
              </View>

              <View className="flex flex-row gap-2">
                <View className={`px-2 py-1 rounded-full ${getSeverityClass(event.severity)}`}>
                  <Text className="text-white text-xs font-bold">
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
                  className={`px-2 py-1 rounded-full ${getStatusClass(event.status)}`}
                >
                  <Text className="text-white text-xs font-bold">
                    {event.status.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {event.source_ip && (
              <Text className="text-gray-300 text-sm mb-1">
                Source IP: {event.source_ip}
              </Text>
            )}

            <View className="bg-dark-gray-800 rounded p-3 mt-2">
              <Text className="text-gray-300 text-sm font-mono whitespace-pre-wrap">
                {JSON.stringify(event.details, null, 2)}
              </Text>
            </View>
          </View>
        ))}

        {events.length === 0 && !isLoading && (
          <Text className="text-gray-500 text-center py-4">
            No security events found
          </Text>
        )}
      </ScrollView>
    </View>
  );
};