import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native-web';
import { useTheme } from '../contexts/ThemeContext';
import { SecurityEvent } from '../services/securityEvents';

interface SecurityStats {
  total: number;
  by_severity: Record<SecurityEvent['severity'], number>;
  by_status: Record<SecurityEvent['status'], number>;
  by_type: Record<string, number>;
}

export const SecurityStats: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/security/events`);
        const data = await response.json();
        if (data.status === 'success' && Array.isArray(data.data)) {
          const events = data.data as SecurityEvent[];
          const stats: SecurityStats = {
            total: events.length,
            by_severity: {
              critical: 0,
              high: 0,
              medium: 0,
              low: 0
            },
            by_status: {
              new: 0,
              investigating: 0,
              resolved: 0
            },
            by_type: {}
          };

          events.forEach(event => {
            stats.by_severity[event.severity]++;
            stats.by_status[event.status]++;
            stats.by_type[event.event_type] = (stats.by_type[event.event_type] || 0) + 1;
          });

          setStats(stats);
        }
      } catch (error) {
        console.error('Failed to fetch security stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatBox: React.FC<{
    label: string;
    value: number;
    color?: string;
  }> = ({ label, value, color }) => (
    <View style={{
      backgroundColor: isDark ? '#374151' : '#e5e7eb',
      padding: 12,
      borderRadius: 6,
      minWidth: 120
    }}>
      <Text style={{
        color: color || (isDark ? '#d1d5db' : '#4b5563'),
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4
      }}>
        {value}
      </Text>
      <Text style={{
        color: isDark ? '#9ca3af' : '#6b7280',
        fontSize: 12
      }}>
        {label}
      </Text>
    </View>
  );

  return (
    <View style={{
      backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
      padding: 16,
      borderRadius: 6,
      marginBottom: 24
    }}>
      <Text style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: isDark ? '#10b981' : '#059669',
        marginBottom: 16
      }}>
        Security Overview
      </Text>

      {isLoading ? (
        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
          Loading statistics...
        </Text>
      ) : stats ? (
        <>
          {/* Summary Stats */}
          <View style={{
            flexDirection: 'row',
            gap: 12,
            marginBottom: 16,
            flexWrap: 'wrap'
          }}>
            <StatBox 
              label="Total Events" 
              value={stats.total}
              color={isDark ? '#10b981' : '#059669'}
            />
            <StatBox 
              label="New Events" 
              value={stats.by_status.new}
              color={isDark ? '#ef4444' : '#dc2626'}
            />
            <StatBox 
              label="Investigating" 
              value={stats.by_status.investigating}
              color={isDark ? '#f59e0b' : '#d97706'}
            />
            <StatBox 
              label="Resolved" 
              value={stats.by_status.resolved}
              color={isDark ? '#34d399' : '#059669'}
            />
          </View>

          {/* Severity Breakdown */}
          <Text style={{
            color: isDark ? '#d1d5db' : '#4b5563',
            fontWeight: 'bold',
            marginBottom: 8
          }}>
            By Severity
          </Text>
          <View style={{
            flexDirection: 'row',
            gap: 12,
            marginBottom: 16,
            flexWrap: 'wrap'
          }}>
            {Object.entries(stats.by_severity).map(([severity, count]) => (
              <StatBox
                key={severity}
                label={severity.toUpperCase()}
                value={count}
                color={
                  severity === 'critical' ? (isDark ? '#ef4444' : '#dc2626') :
                  severity === 'high' ? (isDark ? '#f97316' : '#ea580c') :
                  severity === 'medium' ? (isDark ? '#f59e0b' : '#d97706') :
                  (isDark ? '#10b981' : '#059669')
                }
              />
            ))}
          </View>

          {/* Event Type Breakdown */}
          <Text style={{
            color: isDark ? '#d1d5db' : '#4b5563',
            fontWeight: 'bold',
            marginBottom: 8
          }}>
            By Type
          </Text>
          <View style={{
            flexDirection: 'row',
            gap: 12,
            flexWrap: 'wrap'
          }}>
            {Object.entries(stats.by_type).map(([type, count]) => (
              <StatBox
                key={type}
                label={type.toUpperCase()}
                value={count}
              />
            ))}
          </View>
        </>
      ) : (
        <Text style={{ color: isDark ? '#ef4444' : '#dc2626' }}>
          Failed to load security statistics
        </Text>
      )}
    </View>
  );
};