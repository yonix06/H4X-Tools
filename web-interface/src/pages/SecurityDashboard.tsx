import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native-web';
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

export const SecurityDashboard: React.FC = () => {
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
    <View style={{
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
    }}>
      <Text style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: isDark ? '#d1d5db' : '#4b5563',
        marginBottom: 8,
      }}>
        {title}
      </Text>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}>
        <View style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: status === 'active' 
            ? (isDark ? '#22c55e' : '#16a34a')
            : status === 'error'
              ? (isDark ? '#ef4444' : '#dc2626')
              : (isDark ? '#6b7280' : '#9ca3af'),
        }} />
        <Text style={{
          color: isDark ? '#e5e7eb' : '#1f2937',
          fontSize: 14,
        }}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </View>
      {details && (
        <Text style={{
          color: isDark ? '#9ca3af' : '#6b7280',
          fontSize: 14,
          marginTop: 8,
        }}>
          {details}
        </Text>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
        padding: 16,
      }}>
        <Text style={{ 
          fontSize: 24,
          fontWeight: 'bold',
          color: isDark ? '#10b981' : '#059669'
        }}>
          Security Dashboard
        </Text>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }}
        contentContainerStyle={{ padding: 16 }}
      >
        <View style={{ maxWidth: 1200, marginHorizontal: 'auto', width: '100%' }}>
          {/* Status Cards */}
          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
            <View style={{ flex: 1 }}>
              {renderStatusCard(
                'Fail2Ban',
                fail2banStatus?.status || 'inactive',
                fail2banStatus?.status === 'active'
                  ? `${Object.keys(fail2banStatus.jails || {}).length} Active Jails`
                  : undefined
              )}
            </View>
            <View style={{ flex: 1 }}>
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
          <View style={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: isDark ? '#d1d5db' : '#4b5563',
              marginBottom: 16,
            }}>
              Banned IPs
            </Text>

            {bannedIPs.length > 0 ? (
              bannedIPs.map(ip => (
                <View
                  key={`${ip.ip}-${ip.jail}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 12,
                    backgroundColor: isDark ? '#374151' : '#f3f4f6',
                    borderRadius: 6,
                    marginBottom: 8,
                  }}
                >
                  <View>
                    <Text style={{
                      color: isDark ? '#e5e7eb' : '#1f2937',
                      fontWeight: 'bold',
                      marginBottom: 4,
                    }}>
                      {ip.ip}
                    </Text>
                    <Text style={{
                      color: isDark ? '#9ca3af' : '#6b7280',
                      fontSize: 12,
                    }}>
                      Jail: {ip.jail} | Banned: {new Date(ip.timestamp).toLocaleString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleUnbanIP(ip.ip, ip.jail)}
                    style={{
                      backgroundColor: isDark ? '#ef4444' : '#dc2626',
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 'bold',
                    }}>
                      Unban
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={{
                color: isDark ? '#9ca3af' : '#6b7280',
                textAlign: 'center',
                padding: 24,
              }}>
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