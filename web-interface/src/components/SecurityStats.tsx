import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native-web';
import { useTheme } from '../contexts/ThemeContext';
import { securityApi } from '../services/securityApi';

interface BannedIP {
  ip: string;
  timestamp: string;
  attempts: number;
  jail: string;
  status: 'active' | 'expired';
}

const SecurityStats: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bannedIPs, setBannedIPs] = useState<BannedIP[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await securityApi.getFail2banStatus();
        if (response.status === 'success' && response.data) {
          setBannedIPs(response.data);
        } else {
          setError(response.message || 'Failed to fetch security data');
        }
      } catch (err) {
        setError('Failed to fetch security data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalBans = bannedIPs.length;
  const activeBans = bannedIPs.filter(ip => ip.status === 'active').length;
  const recentAttempts = bannedIPs.reduce((sum, ip) => sum + ip.attempts, 0);

  const stats = [
    { label: 'Total Banned IPs', value: totalBans },
    { label: 'Active Bans', value: activeBans },
    { label: 'Recent Failed Attempts', value: recentAttempts }
  ];

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
        Security Statistics {isLoading && '(Updating...)'}
      </Text>

      {/* Stats Grid */}
      <View style={{
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
        flexWrap: 'wrap'
      }}>
        {stats.map((stat, index) => (
          <View
            key={index}
            style={{
              backgroundColor: isDark ? '#374151' : '#e5e7eb',
              padding: 16,
              borderRadius: 6,
              flex: 1,
              minWidth: 200
            }}
          >
            <Text style={{
              color: isDark ? '#d1d5db' : '#4b5563',
              marginBottom: 4
            }}>
              {stat.label}
            </Text>
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: isDark ? '#ef4444' : '#dc2626'
            }}>
              {stat.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Banned IPs List */}
      <View style={{
        backgroundColor: isDark ? '#374151' : '#e5e7eb',
        padding: 16,
        borderRadius: 6
      }}>
        <Text style={{
          color: isDark ? '#ffffff' : '#111827',
          fontWeight: 'bold',
          marginBottom: 12
        }}>
          Recently Banned IPs
        </Text>

        <ScrollView style={{ maxHeight: 300 }}>
          {bannedIPs.length > 0 ? (
            bannedIPs.map((ban, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  padding: 12,
                  borderRadius: 4,
                  marginBottom: 8,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <View>
                  <Text style={{
                    color: isDark ? '#ffffff' : '#111827',
                    fontWeight: 'bold'
                  }}>
                    {ban.ip}
                  </Text>
                  <Text style={{
                    color: isDark ? '#9ca3af' : '#6b7280',
                    fontSize: 12
                  }}>
                    {new Date(ban.timestamp).toLocaleString()} - {ban.jail}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{
                    color: isDark ? '#9ca3af' : '#6b7280',
                    fontSize: 12
                  }}>
                    {ban.attempts} attempts
                  </Text>
                  <View style={{
                    backgroundColor: ban.status === 'active'
                      ? (isDark ? '#10b981' : '#059669')
                      : (isDark ? '#6b7280' : '#9ca3af'),
                    paddingVertical: 2,
                    paddingHorizontal: 6,
                    borderRadius: 12
                  }}>
                    <Text style={{
                      color: '#ffffff',
                      fontSize: 12,
                      textTransform: 'uppercase'
                    }}>
                      {ban.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={{
              color: isDark ? '#9ca3af' : '#6b7280',
              textAlign: 'center',
              padding: 16
            }}>
              No banned IPs found
            </Text>
          )}
        </ScrollView>

        <TouchableOpacity
          style={{
            backgroundColor: isDark ? '#10b981' : '#059669',
            padding: 12,
            borderRadius: 6,
            alignItems: 'center',
            marginTop: 12
          }}
          onPress={() => {/* TODO: Implement full log view */}}
        >
          <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>
            View Full Logs
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SecurityStats;