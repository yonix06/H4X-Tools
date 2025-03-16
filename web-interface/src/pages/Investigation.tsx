import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native-web';
import { useTheme } from '../contexts/ThemeContext';
import Reports from '../components/Reports';
import SecurityStats from '../components/SecurityStats';
import { securityApi } from '../services/securityApi';

const Investigation: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [vpnStatus, setVpnStatus] = useState<{
    is_active: boolean;
    connections: string[];
    last_check: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVPNStatus = async () => {
      try {
        const response = await securityApi.getVPNStatus();
        if (response.status === 'success' && response.data) {
          setVpnStatus(response.data);
        } else {
          setError(response.message || 'Failed to fetch VPN status');
        }
      } catch (err) {
        setError('Failed to fetch VPN status');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVPNStatus();
    // Poll VPN status every 30 seconds
    const interval = setInterval(fetchVPNStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Text style={{ 
          fontSize: 24,
          fontWeight: 'bold',
          color: isDark ? '#10b981' : '#059669'
        }}>
          Investigation Dashboard
        </Text>
      </View>

      {/* Main Content */}
      <ScrollView style={{ padding: 24 }}>
        {/* VPN Status Card */}
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
            VPN Status {isLoading && '(Updating...)'}
          </Text>
          
          {error ? (
            <Text style={{ 
              color: isDark ? '#ef4444' : '#dc2626',
              textAlign: 'center'
            }}>
              {error}
            </Text>
          ) : (
            <View style={{ 
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 16
            }}>
              <View style={{
                backgroundColor: isDark ? '#374151' : '#e5e7eb',
                padding: 16,
                borderRadius: 6,
                flex: 1,
                minWidth: 200
              }}>
                <Text style={{ 
                  color: isDark ? '#d1d5db' : '#4b5563',
                  marginBottom: 8
                }}>
                  Active Connections
                </Text>
                <Text style={{ 
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: isDark ? '#ef4444' : '#dc2626'
                }}>
                  {vpnStatus?.connections.length || 0}
                </Text>
              </View>

              <View style={{
                backgroundColor: isDark ? '#374151' : '#e5e7eb',
                padding: 16,
                borderRadius: 6,
                flex: 1,
                minWidth: 200
              }}>
                <Text style={{ 
                  color: isDark ? '#d1d5db' : '#4b5563',
                  marginBottom: 8
                }}>
                  VPN Service Status
                </Text>
                <View style={{
                  backgroundColor: vpnStatus?.is_active
                    ? (isDark ? '#10b981' : '#059669')
                    : (isDark ? '#dc2626' : '#ef4444'),
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: 12,
                  alignSelf: 'flex-start'
                }}>
                  <Text style={{
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}>
                    {vpnStatus?.is_active ? 'ONLINE' : 'OFFLINE'}
                  </Text>
                </View>
              </View>

              <View style={{
                backgroundColor: isDark ? '#374151' : '#e5e7eb',
                padding: 16,
                borderRadius: 6,
                flex: 1,
                minWidth: 200
              }}>
                <Text style={{ 
                  color: isDark ? '#d1d5db' : '#4b5563',
                  marginBottom: 8
                }}>
                  Last Check
                </Text>
                <Text style={{ 
                  color: isDark ? '#9ca3af' : '#6b7280',
                  fontSize: 14
                }}>
                  {vpnStatus?.last_check 
                    ? new Date(vpnStatus.last_check).toLocaleString()
                    : 'No data available'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Security Stats Component */}
        <SecurityStats />

        {/* Reports Component */}
        <Reports />
      </ScrollView>
    </View>
  );
};

export default Investigation;