import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native-web';
import { useTheme } from '../contexts/ThemeContext';

interface Report {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'open' | 'closed' | 'investigating';
}

interface NewReport {
  title: string;
  description: string;
}

const Reports: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [reports, setReports] = useState<Report[]>([]);
  const [newReport, setNewReport] = useState<NewReport>({
    title: '',
    description: ''
  });

  const handleSubmit = () => {
    const report: Report = {
      id: Math.random().toString(36).substr(2, 9),
      title: newReport.title,
      description: newReport.description,
      timestamp: new Date().toISOString(),
      status: 'open'
    };

    setReports(prev => [report, ...prev]);
    setNewReport({ title: '', description: '' });
  };

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-600 text-yellow-100';
      case 'investigating':
        return 'bg-blue-600 text-blue-100';
      case 'closed':
        return 'bg-green-600 text-green-100';
      default:
        return 'bg-gray-600 text-gray-100';
    }
  };

  return (
    <ScrollView className="flex-1 bg-dark-gray-900">
      <View className="max-w-4xl mx-auto p-4">
        <View className="bg-dark-gray-800 rounded-lg p-4 mb-6">
          <Text className="text-xl font-bold text-gray-200 mb-4">
            Submit New Report
          </Text>

          <View className="mb-4">
            <Text className="text-gray-300 text-sm mb-2">Title</Text>
            <TextInput
              className="input-field"
              value={newReport.title}
              onChangeText={(text: string) => setNewReport(prev => ({ ...prev, title: text }))}
              placeholder="Report title..."
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-300 text-sm mb-2">Description</Text>
            <TextInput
              className="input-field min-h-[100px]"
              multiline
              value={newReport.description}
              onChangeText={(text: string) => setNewReport(prev => ({ ...prev, description: text }))}
              placeholder="Detailed description of the incident..."
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            className="btn-primary"
            disabled={!newReport.title || !newReport.description}
          >
            <Text className="text-white text-center font-bold">
              Submit Report
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-dark-gray-800 rounded-lg p-4">
          <Text className="text-xl font-bold text-gray-200 mb-4">
            Recent Reports
          </Text>

          {reports.length === 0 ? (
            <Text className="text-gray-500 text-center p-4">
              No reports submitted yet
            </Text>
          ) : (
            reports.map(report => (
              <View key={report.id} className="border-b border-dark-gray-700 last:border-0 py-4">
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-lg font-bold text-gray-200">
                    {report.title}
                  </Text>
                  <View className={`px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                    <Text className="text-xs font-medium">
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <Text className="text-gray-400 mb-2">
                  {report.description}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {new Date(report.timestamp).toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default Reports;