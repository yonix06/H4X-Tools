import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native-web';
import { useTheme } from '../contexts/ThemeContext';
import { securityApi } from '../services/securityApi';

interface Event {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: string;
  timestamp: string;
}

export const SecurityStats: React.FC = () => {
  const { theme } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSecurityEvents();
  }, []);

  const fetchSecurityEvents = async () => {
    try {
      const response = await securityApi.getSecurityEvents();
      if (response.status === 'success') {
        setEvents(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch security events');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex flex-col gap-4">
      {/* Stats Overview */}
      <View className="bg-dark-gray-800 rounded-lg p-4">
        <Text className="text-gray-300 font-bold text-base mb-4">
          Security Overview
        </Text>
        <Text className="text-gray-300 text-sm">
          Today's Events: {events.filter(e => {
            const today = new Date();
            const eventDate = new Date(e.timestamp);
            return today.toDateString() === eventDate.toDateString();
          }).length}
        </Text>
      </View>

      {/* Recent Events */}
      <View className="bg-dark-gray-800 rounded-lg p-4">
        <Text className="text-gray-300 font-bold text-base mb-4">
          Recent Security Events
        </Text>
        
        <View className="max-h-400">
          {events.length > 0 ? (
            <View className="flex flex-col">
              {events.map(event => (
                <View 
                  key={event.id} 
                  className="flex flex-row items-start mb-4 relative"
                >
                  {/* Timeline line */}
                  <View className="absolute left-3 top-6 bottom-0 w-0.5 bg-dark-gray-700" />
                  
                  {/* Event dot */}
                  <View className={`w-6 h-6 rounded-full z-10 ${
                    event.severity === 'critical' ? 'bg-red-500' :
                    event.severity === 'high' ? 'bg-orange-500' :
                    event.severity === 'medium' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  
                  {/* Event content */}
                  <View className="flex-1 ml-3">
                    <Text className="text-gray-200 font-bold text-sm mb-1">
                      {event.title}
                    </Text>
                    <Text className="text-gray-400 text-sm mb-1"></Text>
                      {event.description}
                    </Text>
                    
                    {/* Event metadata */}
                    <View className="flex flex-row gap-2">
                      <View className="bg-dark-gray-900 px-2 py-0.5 rounded-full">
                        <Text className="text-gray-300 text-xs">
                          {event.type}
                        </Text>
                      </View>
                      <View className={`px-2 py-0.5 rounded-full ${
                        event.severity === 'critical' ? 'bg-red-900' :
                        event.severity === 'high' ? 'bg-orange-900' :
                        event.severity === 'medium' ? 'bg-yellow-900' :
                        'bg-blue-900'
                      }`}>
                        <Text className={`text-xs font-bold ${
                          event.severity === 'critical' ? 'text-red-300' :
                          event.severity === 'high' ? 'text-orange-300' :
                          event.severity === 'medium' ? 'text-yellow-300' :
                          'text-blue-300'
                        }`}>
                          {event.severity}
                        </Text>
                      </View>
                      <Text className="text-gray-500 text-xs">
                        {new Date(event.timestamp).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-gray-500 text-center p-6">
              No security events recorded
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};