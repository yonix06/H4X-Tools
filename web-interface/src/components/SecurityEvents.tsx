import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native-web';
import { useTheme } from '../contexts/ThemeContext';
import { securityEventsApi, SecurityEvent } from '../services/securityEvents';

const SecurityEvents: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{
    severity: SecurityEvent['severity'] | 'all';
    status: SecurityEvent['status'] | 'all';
  }>({
    severity: 'all',
    status: 'all'
  });

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, []);

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
      setError('Failed to update event status');
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSeverity = filter.severity === 'all' || event.severity === filter.severity;
    const matchesStatus = filter.status === 'all' || event.status === filter.status;
    return matchesSeverity && matchesStatus;
  });

  const severityClasses = {
    critical: 'bg-red-900 text-red-300',
    high: 'bg-orange-900 text-orange-300',
    medium: 'bg-yellow-900 text-yellow-300',
    low: 'bg-blue-900 text-blue-300'
  };

  const statusClasses = {
    new: 'bg-red-900 text-red-300',
    investigating: 'bg-yellow-900 text-yellow-300',
    resolved: 'bg-green-900 text-green-300'
  };

  return (
    <View className={`rounded-lg p-6 ${
      isDark ? 'bg-dark-gray-800' : 'bg-white'
    }`}>
      <Text className="text-lg font-bold text-hacker-green mb-4">
        Security Events Timeline
      </Text>

      {/* Filters */}
      <View className="flex-row space-x-4 mb-6">
        <View>
          <Text className="text-gray-400 mb-2 text-sm">Severity</Text>
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => setFilter(prev => ({ ...prev, severity: 'all' }))}
              className={`px-3 py-1 rounded-full ${
                filter.severity === 'all'
                  ? 'bg-hacker-green text-white'
                  : 'bg-dark-gray-700 text-gray-400'
              }`}
            >
              <Text>All</Text>
            </TouchableOpacity>
            {(['critical', 'high', 'medium', 'low'] as SecurityEvent['severity'][]).map(severity => (
              <TouchableOpacity
                key={severity}
                onPress={() => setFilter(prev => ({ ...prev, severity }))}
                className={`px-3 py-1 rounded-full ${
                  filter.severity === severity
                    ? severityClasses[severity]
                    : 'bg-dark-gray-700 text-gray-400'
                }`}
              >
                <Text className="capitalize">{severity}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <Text className="text-gray-400 mb-2 text-sm">Status</Text>
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => setFilter(prev => ({ ...prev, status: 'all' }))}
              className={`px-3 py-1 rounded-full ${
                filter.status === 'all'
                  ? 'bg-hacker-green text-white'
                  : 'bg-dark-gray-700 text-gray-400'
              }`}
            >
              <Text>All</Text>
            </TouchableOpacity>
            {(['new', 'investigating', 'resolved'] as SecurityEvent['status'][]).map(status => (
              <TouchableOpacity
                key={status}
                onPress={() => setFilter(prev => ({ ...prev, status }))}
                className={`px-3 py-1 rounded-full ${
                  filter.status === status
                    ? statusClasses[status]
                    : 'bg-dark-gray-700 text-gray-400'
                }`}
              >
                <Text className="capitalize">{status}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Events Timeline */}
      <ScrollView className="max-h-[600px]">
        {filteredEvents.length > 0 ? (
          <View className="relative">
            {/* Timeline line */}
            <View className="absolute left-4 top-0 bottom-0 w-0.5 bg-dark-gray-700" />

            {/* Events */}
            <View className="space-y-4">
              {filteredEvents.map((event) => (
                <View key={event.id} className="flex-row">
                  {/* Event dot */}
                  <View className={`w-8 h-8 rounded-full z-10 flex items-center justify-center ${
                    severityClasses[event.severity].split(' ')[0]
                  }`}>
                    {event.event_type === 'fail2ban' && '🛡️'}
                    {event.event_type === 'vpn' && '🔒'}
                    {event.event_type === 'custom' && '⚡'}
                  </View>

                  {/* Event content */}
                  <View className="flex-1 ml-4">
                    <View className="bg-dark-gray-700 rounded-lg p-4">
                      <View className="flex-row justify-between items-start mb-2">
                        <View>
                          <Text className="text-lg font-bold text-gray-200">
                            {event.event_type.toUpperCase()} Event
                          </Text>
                          {event.source_ip && (
                            <Text className="text-gray-400">
                              Source IP: {event.source_ip}
                            </Text>
                          )}
                        </View>
                        
                        <View className="flex-row space-x-2">
                          <View className={`px-3 py-1 rounded-full ${severityClasses[event.severity]}`}>
                            <Text className="text-sm capitalize">
                              {event.severity}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => {
                              const nextStatus: Record<SecurityEvent['status'], SecurityEvent['status']> = {
                                new: 'investigating',
                                investigating: 'resolved',
                                resolved: 'new'
                              };
                              handleStatusChange(event.id, nextStatus[event.status]);
                            }}
                            className={`px-3 py-1 rounded-full ${statusClasses[event.status]}`}
                          >
                            <Text className="text-sm capitalize">
                              {event.status}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View className="bg-dark-gray-800 rounded p-3 mt-2">
                        <Text className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                          {JSON.stringify(event.details, null, 2)}
                        </Text>
                      </View>

                      <Text className="text-gray-500 text-sm mt-2">
                        {new Date(event.timestamp).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <Text className="text-gray-400 text-center py-4">
            No security events found
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

export default SecurityEvents;