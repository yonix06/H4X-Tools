import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native-web';
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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newInvestigation, setNewInvestigation] = useState({
    title: '',
    description: '',
    severity: 'medium' as Investigation['severity']
  });

  useEffect(() => {
    fetchInvestigations();
  }, []);

  const fetchInvestigations = async () => {
    try {
      const response = await securityApi.listInvestigations();
      if (response.status === 'success' && response.data) {
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

  const createInvestigation = async () => {
    try {
      const response = await securityApi.createInvestigation(newInvestigation);
      if (response.status === 'success') {
        setInvestigations(prev => [response.data, ...prev]);
        setNewInvestigation({ title: '', description: '', severity: 'medium' });
      } else {
        setError('Failed to create investigation');
      }
    } catch (err) {
      setError('Failed to create investigation');
    }
  };

  const updateInvestigationStatus = async (id: number, status: Investigation['status']) => {
    try {
      const response = await securityApi.updateInvestigation(id, { status });
      if (response.status === 'success') {
        setInvestigations(prev =>
          prev.map(inv => inv.id === id ? { ...inv, status } : inv)
        );
      }
    } catch (err) {
      setError('Failed to update investigation status');
    }
  };

  const severityClasses = {
    critical: 'bg-red-900 text-red-300',
    high: 'bg-orange-900 text-orange-300',
    medium: 'bg-yellow-900 text-yellow-300',
    low: 'bg-blue-900 text-blue-300'
  };

  const statusClasses = {
    active: 'bg-green-900 text-green-300',
    archived: 'bg-gray-700 text-gray-300',
    closed: 'bg-blue-900 text-blue-300'
  };

  return (
    <ScrollView className="flex-1 bg-dark-gray-900">
      <View className="max-w-7xl mx-auto p-4">
        {/* New Investigation Form */}
        <View className="bg-dark-gray-800 rounded-lg p-6 mb-6">
          <Text className="text-xl font-bold text-hacker-green mb-4">
            Create New Investigation
          </Text>

          <View className="space-y-4">
            <View>
              <Text className="text-gray-300 mb-2">Title *</Text>
              <TextInput
                className="input-field"
                value={newInvestigation.title}
                onChangeText={(text) => setNewInvestigation(prev => ({ ...prev, title: text }))}
                placeholder="Investigation title..."
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              />
            </View>

            <View>
              <Text className="text-gray-300 mb-2">Description</Text>
              <TextInput
                className="input-field min-h-[100px]"
                multiline
                value={newInvestigation.description}
                onChangeText={(text) => setNewInvestigation(prev => ({ ...prev, description: text }))}
                placeholder="Investigation details..."
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              />
            </View>

            <View>
              <Text className="text-gray-300 mb-2">Severity</Text>
              <View className="flex-row space-x-2">
                {(['low', 'medium', 'high', 'critical'] as Investigation['severity'][]).map(severity => (
                  <TouchableOpacity
                    key={severity}
                    onPress={() => setNewInvestigation(prev => ({ ...prev, severity }))}
                    className={`px-4 py-2 rounded-full ${
                      newInvestigation.severity === severity
                        ? severityClasses[severity]
                        : 'bg-dark-gray-700 text-gray-400'
                    }`}
                  >
                    <Text className="capitalize">
                      {severity}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={createInvestigation}
              disabled={!newInvestigation.title}
              className={`btn-primary w-full ${!newInvestigation.title ? 'opacity-50' : ''}`}
            >
              <Text className="text-center text-white font-bold">
                Create Investigation
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Investigations */}
        <View className="bg-dark-gray-800 rounded-lg p-6 mb-6">
          <Text className="text-xl font-bold text-hacker-green mb-4">
            Active Investigations
          </Text>

          {investigations
            .filter(inv => inv.status === 'active')
            .map(investigation => (
              <View 
                key={investigation.id}
                className="bg-dark-gray-700 rounded-lg p-4 mb-4 border-l-4 border-hacker-green"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <Text className="text-lg font-bold text-gray-200">
                      {investigation.title}
                    </Text>
                    {investigation.description && (
                      <Text className="text-gray-400 mt-1">
                        {investigation.description}
                      </Text>
                    )}
                  </View>
                  
                  <View className="flex-row space-x-2">
                    <View className={`px-3 py-1 rounded-full ${severityClasses[investigation.severity]}`}>
                      <Text className="text-sm font-medium capitalize">
                        {investigation.severity}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => updateInvestigationStatus(investigation.id, 'archived')}
                      className="px-3 py-1 rounded-full bg-dark-gray-600 hover:bg-dark-gray-500"
                    >
                      <Text className="text-sm text-gray-300">
                        Archive
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text className="text-gray-500 text-sm">
                  Created: {new Date(investigation.created_at).toLocaleString()}
                </Text>
              </View>
            ))}

          {investigations.filter(inv => inv.status === 'active').length === 0 && (
            <Text className="text-gray-400 text-center py-4">
              No active investigations
            </Text>
          )}
        </View>

        {/* Archived Investigations */}
        <View className="bg-dark-gray-800 rounded-lg p-6">
          <Text className="text-xl font-bold text-gray-400 mb-4">
            Archived Investigations
          </Text>

          {investigations
            .filter(inv => inv.status === 'archived')
            .map(investigation => (
              <View 
                key={investigation.id}
                className="bg-dark-gray-700 rounded-lg p-4 mb-4 opacity-75"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <Text className="text-lg font-bold text-gray-300">
                      {investigation.title}
                    </Text>
                    {investigation.description && (
                      <Text className="text-gray-400 mt-1">
                        {investigation.description}
                      </Text>
                    )}
                  </View>
                  
                  <View className="flex-row space-x-2">
                    <View className={`px-3 py-1 rounded-full ${severityClasses[investigation.severity]}`}>
                      <Text className="text-sm font-medium capitalize">
                        {investigation.severity}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => updateInvestigationStatus(investigation.id, 'active')}
                      className="px-3 py-1 rounded-full bg-dark-gray-600 hover:bg-dark-gray-500"
                    >
                      <Text className="text-sm text-gray-300">
                        Reopen
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text className="text-gray-500 text-sm">
                  Created: {new Date(investigation.created_at).toLocaleString()}
                </Text>
              </View>
            ))}

          {investigations.filter(inv => inv.status === 'archived').length === 0 && (
            <Text className="text-gray-400 text-center py-4">
              No archived investigations
            </Text>
          )}
        </View>

        {/* Security Stats at the bottom */}
        <SecurityStats />
      </View>
    </ScrollView>
  );
};

export default Investigation;