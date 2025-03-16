import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native-web';
import { useTheme } from '../contexts/ThemeContext';

interface VPNStatusData {
  is_active: boolean;
  current_ip: string;
  location: string;
  ping: number;
}

export const VPNStatus: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [status, setStatus] = useState<VPNStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVPNStatus = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/security/vpn`);
        const data = await response.json();
        if (data.status === 'success') {
          setStatus(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch VPN status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVPNStatus();
    const interval = setInterval(fetchVPNStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View className="bg-dark-gray-800 p-4 rounded-md mb-6">
      <View className="flex flex-row items-center mb-4">
        <Text className="text-lg font-bold text-hacker-green">
          VPN Status
        </Text>
        <View className={`ml-3 w-3 h-3 rounded-full ${
          status?.is_active 
            ? 'bg-hacker-green'
            : 'bg-red-500'
        }`} />
      </View>

      {isLoading ? (
        <Text className="text-gray-400">
          Loading VPN status...
        </Text>
      ) : status ? (
        <View className="space-y-2">
          <Text className="text-gray-300">
            IP: {status.current_ip}
          </Text>
          <Text className="text-gray-300">
            Location: {status.location}
          </Text>
          <Text className="text-gray-300">
            Ping: {status.ping}ms
          </Text>
        </View>
      ) : (
        <Text className="text-gray-400">
          Failed to load VPN status
        </Text>
      )}
    </View>
  );
};