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
    <View className="flex flex-col flex-1">
      {/* Header */}
      <View className="flex flex-row items-center justify-between bg-dark-gray-800 p-4">
        <Text className="text-2xl font-bold text-hacker-green">
          Security Investigation
        </Text>
      </View>

      {/* Main Content */}
      <View className="flex-1">
        <ScrollView className="p-6">
          <View className="p-6">
            {/* Active Investigations */}
            <View className="bg-dark-gray-800 rounded-lg p-4 mb-6">
              <Text className="text-xl font-bold text-hacker-green mb-4">
                Active Investigations
              </Text>

              {investigations
                .filter(inv => inv.status === 'active')
                .map(investigation => (
                  <View 
                    key={investigation.id}
                    className={`bg-dark-gray-900 rounded-md p-3 mb-2 border-l-4 ${
                      investigation.severity === 'critical' ? 'border-red-500' :
                      investigation.severity === 'high' ? 'border-orange-500' :
                      investigation.severity === 'medium' ? 'border-yellow-500' :
                      'border-blue-500'
                    }`}
                  >
                    <Text className="text-base font-bold text-gray-200 mb-1">
                      {investigation.title}
                    </Text>
                    
                    {investigation.description && (
                      <Text className="text-gray-400 mb-2">
                        {investigation.description}
                      </Text>
                    )}

                    <View className="flex flex-row gap-2">
                      <View className="bg-dark-gray-800 py-1 px-2 rounded-full">
                        <Text className={`text-xs font-bold ${
                          investigation.severity === 'critical' ? 'text-red-500' :
                          investigation.severity === 'high' ? 'text-orange-500' :
                          investigation.severity === 'medium' ? 'text-yellow-500' :
                          'text-blue-500'
                        }`}>
                          {investigation.severity.toUpperCase()}
                        </Text>
                      </View>
                      <Text className="text-gray-400 text-xs">
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
    </View>
  );
};

export default Investigation;