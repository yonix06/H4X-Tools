import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native-web';
import { useHistory, HistoryEntry } from '../contexts/HistoryContext';
import { useTheme } from '../contexts/ThemeContext';

interface HistoryPanelProps {
  onSelectFromHistory: (entry: HistoryEntry) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ onSelectFromHistory }) => {
  const { history, clearHistory } = useHistory();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View className="bg-dark-gray-800 p-4 rounded-md mb-6">
      <View className="flex flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-hacker-green">
          Command History
        </Text>
        <TouchableOpacity
          onPress={clearHistory}
          className="px-3 py-1 rounded-md bg-dark-gray-700 hover:bg-dark-gray-600"
        >
          <Text className="text-gray-300">Clear History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="max-h-96">
        {history.map((entry, index) => (
          <TouchableOpacity
            key={index} // Using index as key since HistoryEntry doesn't have an id
            onPress={() => onSelectFromHistory(entry)}
            className="p-3 mb-2 rounded-md bg-dark-gray-900 hover:bg-dark-gray-700"
          >
            <Text className="text-lg font-semibold text-gray-200 mb-1">
              {entry.tool}
            </Text>
            <Text className="text-xs text-gray-400">
              {new Date(entry.timestamp).toLocaleString()}
            </Text>
            <Text className="mt-1 text-sm font-mono whitespace-pre-wrap text-gray-300">
              {JSON.stringify(entry.params, null, 2)}
            </Text>
            <View className="flex flex-row items-center mt-2">
              <Text className={`text-xs mr-2 ${
                entry.response.status === 'success'
                  ? 'text-hacker-green'
                  : 'text-red-500'
              }`}>
                {entry.response.status}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};