import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native-web';
import { useTheme } from '../contexts/ThemeContext';

interface VPNStatusData {
  is_active: boolean;
  connections: string[];
  last_check: string;
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
    <View style={{
      backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
      padding: 16,
      borderRadius: 6,
      marginBottom: 24
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
      }}>
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: isDark ? '#10b981' : '#059669'
        }}>
          VPN Status
        </Text>
        <View style={{
          marginLeft: 12,
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: status?.is_active 
            ? (isDark ? '#34d399' : '#059669')
            : (isDark ? '#ef4444' : '#dc2626')
        }} />
      </View>

      {isLoading ? (
        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
          Loading VPN status...
        </Text>
      ) : status ? (
        <>
          <Text style={{ 
            color: isDark ? '#d1d5db' : '#4b5563',
            marginBottom: 8 
          }}>
            Status: {status.is_active ? 'Active' : 'Inactive'}
          </Text>
          
          {status.connections.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ 
                color: isDark ? '#d1d5db' : '#4b5563',
                marginBottom: 4
              }}>
                Active Connections:
              </Text>
              {status.connections.map((conn, index) => (
                <Text key={index} style={{
                  color: isDark ? '#9ca3af' : '#6b7280',
                  fontFamily: 'monospace',
                  fontSize: 14
                }}>
                  {conn}
                </Text>
              ))}
            </View>
          )}

          <Text style={{ 
            color: isDark ? '#9ca3af' : '#6b7280',
            fontSize: 12,
            marginTop: 8
          }}>
            Last checked: {new Date(status.last_check).toLocaleString()}
          </Text>
        </>
      ) : (
        <Text style={{ color: isDark ? '#ef4444' : '#dc2626' }}>
          Failed to load VPN status
        </Text>
      )}
    </View>
  );
};