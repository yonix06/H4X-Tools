import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native-web';
import { useTheme } from '../contexts/ThemeContext';
import { SecurityStats } from '../components/SecurityStats';
import { securityApi } from '../services/securityApi';

interface BannedIP {
  ip: string;
  jail: string;
  ban_time: string;
  timestamp: string;
}

interface VPNStatus {
  is_active: boolean;
  service: string;
  connections: string[];
  error?: string;
  last_check: string;
}

const SecurityDashboard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [fail2banStatus, setFail2banStatus] = useState<any>(null);
  const [vpnStatus, setVPNStatus] = useState<VPNStatus | null>(null);
  const [bannedIPs, setBannedIPs] = useState<BannedIP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSecurityData();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSecurityData = async () => {
    try {
      setIsLoading(true);
      const [fail2banRes, vpnRes, bannedIPsRes] = await Promise.all([
        securityApi.getFail2banStatus(),
        securityApi.getVPNStatus(),
        securityApi.getBannedIPs()
      ]);

      if (fail2banRes.status === 'success') {
        setFail2banStatus(fail2banRes.data);
      }
      if (vpnRes.status === 'success') {
        setVPNStatus(vpnRes.data);
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
        // Refresh banned IPs list
        const bannedIPsRes = await securityApi.getBannedIPs();
        if (bannedIPsRes.status === 'success') {
          setBannedIPs(bannedIPsRes.data);
        }
      }
    } catch (err) {
      setError('Failed to unban IP');
    }
  };

  const renderStatusCard = (
    title: string,
    status: 'active' | 'inactive' | 'error',
    details?: string
  ) => (
    <View className="bg-dark-gray-800 rounded-lg p-4 mb-4">
      <Text className="text-lg font-bold text-gray-300 mb-2">
        {title}
      </Text>
      <View className="flex flex-row items-center gap-2">
        <View className={`w-3 h-3 rounded-full ${
          status === 'active' 
            ? 'bg-green-500'
            : status === 'error'
              ? 'bg-red-500'
              : 'bg-gray-500'
        }`} />
        <Text className="text-gray-200 text-sm">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </View>
      {details && (
        <Text className="text-gray-400 text-sm mt-2">
          {details}
        </Text>
      )}
    </View>
  );

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="bg-dark-gray-800 p-4">
        <Text className="text-2xl font-bold text-hacker-green">
          Security Dashboard
        </Text>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 bg-dark-gray-900">
        <View className="p-4 max-w-7xl mx-auto w-full">
          {/* Status Cards */}
          <View className="flex flex-row gap-4 mb-6">
            <View className="flex-1">
              {renderStatusCard(
                'Fail2Ban',
                fail2banStatus?.status || 'inactive',
                fail2banStatus?.status === 'active'
                  ? `${Object.keys(fail2banStatus.jails || {}).length} Active Jails`
                  : undefined
              )}
            </View>
            <View className="flex-1">
              {renderStatusCard(
                'VPN Service',
                vpnStatus?.is_active ? 'active' : 'inactive',
                vpnStatus?.service
                  ? `${vpnStatus.service.toUpperCase()} - ${vpnStatus.connections?.length || 0} Active Connections`
                  : undefined
              )}
            </View>
          </View>

          {/* Banned IPs */}
          <View className="bg-dark-gray-800 rounded-lg p-4 mb-6">
            <Text className="text-xl font-bold text-gray-300 mb-4">
              Banned IPs
            </Text>

            {bannedIPs.length > 0 ? (
              bannedIPs.map(ip => (
                <View
                  key={`${ip.ip}-${ip.jail}`}
                  className="flex flex-row items-center justify-between p-3 bg-dark-gray-900 rounded-md mb-2"
                >
                  <View>
                    <Text className="text-base font-bold text-gray-200 mb-1">
                      {ip.ip}
                    </Text>
                    <Text className="text-sm text-gray-400">
                      Jail: {ip.jail} | Banned: {new Date(ip.timestamp).toLocaleString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleUnbanIP(ip.ip, ip.jail)}
                    className="bg-red-600 px-3 py-2 rounded-md"
                  >
                    <Text className="text-xs font-bold text-white">
                      Unban
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text className="text-center text-gray-500 p-6">
                No banned IPs
              </Text>
            )}
          </View>

          {/* Security Events Timeline */}
          <SecurityStats />
        </View>
      </ScrollView>
    </View>
  );
};

export default SecurityDashboard;