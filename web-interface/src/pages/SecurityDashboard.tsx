import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native-web';
import { useTheme } from '../contexts/ThemeContext';
import { SecurityStats } from '../components/SecurityStats';
import { securityApi } from '../services/securityApi';
import { VPNStatus } from '../components/VPNStatus';
import SecurityEvents from '../components/SecurityEvents';

interface BannedIP {
  ip: string;
  jail: string;
  ban_time: string;
  timestamp: string;
}

const SecurityDashboard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [fail2banStatus, setFail2banStatus] = useState<any>(null);
  const [bannedIPs, setBannedIPs] = useState<BannedIP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSecurityData = async () => {
    try {
      setIsLoading(true);
      const [fail2banRes, bannedIPsRes] = await Promise.all([
        securityApi.getFail2banStatus(),
        securityApi.getBannedIPs()
      ]);

      if (fail2banRes.status === 'success') {
        setFail2banStatus(fail2banRes.data);
      }
      if (bannedIPsRes.status === 'success') {
        setBannedIPs(bannedIPsRes.data);
      }
    } catch (err) {
      setError('Failed to fetch security data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnbanIP = async (ip: string, jail?: string) => {
    try {
      const response = await securityApi.unbanIP(ip, jail);
      if (response.status === 'success') {
        setBannedIPs(prev => prev.filter(item => item.ip !== ip));
      }
    } catch (err) {
      setError('Failed to unban IP');
    }
  };

  return (
    <ScrollView className="flex-1 bg-dark-gray-900">
      <View className="max-w-7xl mx-auto p-4">
        {/* Security Overview Cards */}
        <View className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <View className={`rounded-lg p-6 ${
            isDark ? 'bg-dark-gray-800' : 'bg-white'
          }`}>
            <Text className="text-lg font-bold text-hacker-green mb-2">
              System Status
            </Text>
            <View className="flex flex-row items-center space-x-2">
              <View className={`w-3 h-3 rounded-full ${
                fail2banStatus?.status === 'active' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <Text className="text-gray-300">
                {fail2banStatus?.status === 'active' ? 'Protected' : 'Vulnerable'}
              </Text>
            </View>
          </View>

          <VPNStatus />

          <View className={`rounded-lg p-6 ${
            isDark ? 'bg-dark-gray-800' : 'bg-white'
          }`}>
            <Text className="text-lg font-bold text-hacker-green mb-2">
              Active Threats
            </Text>
            <Text className="text-2xl font-bold text-gray-300">
              {bannedIPs.length}
            </Text>
            <Text className="text-gray-400 text-sm">
              Blocked IPs
            </Text>
          </View>
        </View>

        {/* Banned IPs Section */}
        <View className={`rounded-lg p-6 mb-6 ${
          isDark ? 'bg-dark-gray-800' : 'bg-white'
        }`}>
          <Text className="text-lg font-bold text-hacker-green mb-4">
            Banned IPs
          </Text>

          {bannedIPs.length > 0 ? (
            <View className="space-y-2">
              {bannedIPs.map((ip, index) => (
                <View key={`${ip.ip}-${index}`} 
                  className="flex flex-row items-center justify-between p-4 rounded-lg bg-dark-gray-700">
                  <View>
                    <Text className="text-gray-200 font-mono">
                      {ip.ip}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      Jail: {ip.jail} | {new Date(ip.timestamp).toLocaleString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleUnbanIP(ip.ip, ip.jail)}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                  >
                    <Text className="text-white">Unban</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-gray-400 text-center py-4">
              No banned IPs found
            </Text>
          )}
        </View>

        {/* Security Events Timeline */}
        <SecurityEvents />

        {/* Security Stats */}
        <SecurityStats />
      </View>
    </ScrollView>
  );
};

export default SecurityDashboard;