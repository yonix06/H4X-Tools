import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native-web';
import { useTheme } from '../contexts/ThemeContext';
import { SecurityStats } from '../components/SecurityStats';
import { securityApi } from '../services/securityApi';

interface BannedIP {
  ip: string;
  timestamp: string;
  attempts: number;
  jail: string;
  status: 'active' | 'expired';
}

const SecurityDashboard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [fail2banStatus, setFail2banStatus] = useState<any>(null);
  const [vpnStatus, setVpnStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSecurityStatus = async () => {
    try {
      const [fail2banResponse, vpnResponse] = await Promise.all([
        securityApi.getFail2banStatus(),
        securityApi.getVPNStatus()
      ]);

      if (fail2banResponse.status === 'success') {
        setFail2banStatus(fail2banResponse.data);
      }
      if (vpnResponse.status === 'success') {
        setVpnStatus(vpnResponse.data);
      }
    } catch (err) {
      setError('Failed to fetch security status');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityStatus();
    // Poll status every 30 seconds
    const interval = setInterval(fetchSecurityStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#f9fafb' }}>
      <View style={{ padding: 16, maxWidth: 1200, marginHorizontal: 'auto', width: '100%' }}>
        {/* Header */}
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: isDark ? '#10b981' : '#059669',
          marginBottom: 24,
        }}>
          Security Dashboard
        </Text>

        {/* Status Cards */}
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
        }}>
          {/* VPN Status Card */}
          <View style={{
            flex: 1,
            minWidth: 300,
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderRadius: 8,
            padding: 16,
            borderWidth: 1,
            borderColor: isDark ? '#374151' : '#e5e7eb',
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: isDark ? '#10b981' : '#059669',
              marginBottom: 16,
            }}>
              VPN Status
            </Text>
            {vpnStatus ? (
              <>
                <View style={{
                  backgroundColor: vpnStatus.is_active ? '#059669' : '#dc2626',
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: 12,
                  alignSelf: 'flex-start',
                  marginBottom: 12,
                }}>
                  <Text style={{
                    color: '#ffffff',
                    fontWeight: 'bold',
                  }}>
                    {vpnStatus.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </Text>
                </View>
                <Text style={{
                  color: isDark ? '#d1d5db' : '#4b5563',
                  marginBottom: 8,
                }}>
                  Active Connections: {vpnStatus.connections.length}
                </Text>
                <Text style={{
                  color: isDark ? '#9ca3af' : '#6b7280',
                  fontSize: 12,
                }}>
                  Last Updated: {new Date(vpnStatus.last_check).toLocaleString()}
                </Text>
              </>
            ) : (
              <Text style={{ color: isDark ? '#d1d5db' : '#4b5563' }}>
                Loading VPN status...
              </Text>
            )}
          </View>

          {/* Fail2ban Status Card */}
          <View style={{
            flex: 1,
            minWidth: 300,
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderRadius: 8,
            padding: 16,
            borderWidth: 1,
            borderColor: isDark ? '#374151' : '#e5e7eb',
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: isDark ? '#10b981' : '#059669',
              marginBottom: 16,
            }}>
              Fail2ban Status
            </Text>
            {fail2banStatus ? (
              <View>
                {Object.entries(fail2banStatus.jails || {}).map(([jail, count]) => (
                  <View key={jail} style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                    padding: 8,
                    backgroundColor: isDark ? '#374151' : '#f3f4f6',
                    borderRadius: 4,
                  }}>
                    <Text style={{ color: isDark ? '#d1d5db' : '#4b5563' }}>
                      {jail}
                    </Text>
                    <Text style={{
                      color: isDark ? '#ef4444' : '#dc2626',
                      fontWeight: 'bold',
                    }}>
                      {count} banned IPs
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ color: isDark ? '#d1d5db' : '#4b5563' }}>
                Loading Fail2ban status...
              </Text>
            )}
          </View>
        </View>

        {/* Security Events Timeline */}
        <SecurityStats />
      </View>
    </ScrollView>
  );
};

export default SecurityDashboard;