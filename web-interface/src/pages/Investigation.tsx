import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native-web';
import { useTheme } from '../contexts/ThemeContext';
import { SecurityStats } from '../components/SecurityStats';
import { securityApi } from '../services/securityApi';

interface Investigation {
  id: number;
  title: string;
  description?: string;
  created_at: string;
  status: 'active' | 'archived' | 'closed';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const Investigation: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [selectedInvestigation, setSelectedInvestigation] = useState<Investigation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvestigations();
  }, []);

  const fetchInvestigations = async () => {
    try {
      const response = await securityApi.listInvestigations();
      if (response.status === 'success') {
        setInvestigations(response.data);
      } else {
        setError('Failed to fetch investigations');
      }
    } catch (err) {
      setError('Failed to fetch investigations');
    } finally {
      setIsLoading(false);
    }
  };

  const createInvestigation = async (title: string, severity: Investigation['severity']) => {
    try {
      const response = await securityApi.createInvestigation({
        title,
        severity,
      });
      if (response.status === 'success') {
        setInvestigations(prev => [response.data, ...prev]);
      }
    } catch (err) {
      setError('Failed to create investigation');
    }
  };

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
          Security Investigation
        </Text>
      </View>

      {/* Main Content */}
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 24 }}>
          {/* Active Investigations */}
          <View style={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: isDark ? '#10b981' : '#059669',
              marginBottom: 16,
            }}>
              Active Investigations
            </Text>

            {investigations
              .filter(inv => inv.status === 'active')
              .map(investigation => (
                <View 
                  key={investigation.id}
                  style={{
                    backgroundColor: isDark ? '#374151' : '#f3f4f6',
                    borderRadius: 6,
                    padding: 12,
                    marginBottom: 8,
                    borderLeftWidth: 4,
                    borderLeftColor: getSeverityColor(investigation.severity, isDark),
                  }}
                >
                  <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: isDark ? '#e5e7eb' : '#1f2937',
                    marginBottom: 4,
                  }}>
                    {investigation.title}
                  </Text>
                  
                  {investigation.description && (
                    <Text style={{
                      color: isDark ? '#9ca3af' : '#6b7280',
                      marginBottom: 8,
                    }}>
                      {investigation.description}
                    </Text>
                  )}

                  <View style={{
                    flexDirection: 'row',
                    gap: 8,
                  }}>
                    <View style={{
                      backgroundColor: isDark ? '#1f2937' : '#e5e7eb',
                      paddingVertical: 2,
                      paddingHorizontal: 8,
                      borderRadius: 12,
                    }}>
                      <Text style={{
                        color: getSeverityColor(investigation.severity, isDark),
                        fontSize: 12,
                        fontWeight: 'bold',
                      }}>
                        {investigation.severity.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={{
                      color: isDark ? '#9ca3af' : '#6b7280',
                      fontSize: 12,
                    }}>
                      Created: {new Date(investigation.created_at).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
          </View>

          {/* Security Stats and Events */}
          <SecurityStats />
        </View>
      </ScrollView>
    </View>
  );
};

const getSeverityColor = (severity: Investigation['severity'], isDark: boolean) => {
  switch (severity) {
    case 'critical':
      return isDark ? '#ef4444' : '#dc2626';
    case 'high':
      return isDark ? '#f97316' : '#ea580c';
    case 'medium':
      return isDark ? '#eab308' : '#ca8a04';
    case 'low':
      return isDark ? '#22c55e' : '#16a34a';
    default:
      return isDark ? '#6b7280' : '#4b5563';
  }
};

export default Investigation;