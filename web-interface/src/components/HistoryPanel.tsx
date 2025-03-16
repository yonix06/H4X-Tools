import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native-web';
import { useHistory } from '../contexts/HistoryContext';
import { useTheme } from '../contexts/ThemeContext';

interface HistoryPanelProps {
  onSelectFromHistory: (toolId: string, params: Record<string, string>) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ onSelectFromHistory }) => {
  const { history, clearHistory } = useHistory();
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <View style={{ 
      backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
      padding: 16,
      borderRadius: 6,
      marginBottom: 24 
    }}>
      <View style={{ 
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
      }}>
        <Text style={{ 
          fontSize: 18,
          fontWeight: 'bold',
          color: isDark ? '#10b981' : '#059669'
        }}>
          Command History
        </Text>
        <TouchableOpacity
          onPress={clearHistory}
          style={{
            backgroundColor: isDark ? '#374151' : '#e5e7eb',
            padding: 8,
            borderRadius: 4
          }}
        >
          <Text style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>Clear History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ maxHeight: 200 }}>
        {history.map((entry, index) => (
          <TouchableOpacity
            key={index}
            style={{
              backgroundColor: isDark ? '#374151' : '#e5e7eb',
              padding: 12,
              borderRadius: 6,
              marginBottom: 8
            }}
            onPress={() => onSelectFromHistory(entry.tool.id, entry.params)}
          >
            <Text style={{ 
              color: isDark ? '#ffffff' : '#111827',
              fontWeight: 'bold'
            }}>
              {entry.tool.name}
            </Text>
            <Text style={{ 
              color: isDark ? '#9ca3af' : '#6b7280',
              fontSize: 12,
              marginTop: 4
            }}>
              {new Date(entry.timestamp).toLocaleString()}
            </Text>
            <Text style={{ 
              color: isDark ? '#d1d5db' : '#4b5563',
              fontSize: 14,
              marginTop: 4,
              fontFamily: 'monospace'
            }}>
              {JSON.stringify(entry.params, null, 2)}
            </Text>
            <View style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 8
            }}>
              <Text style={{ 
                color: entry.response.status === 'success' 
                  ? (isDark ? '#34d399' : '#059669')
                  : (isDark ? '#ef4444' : '#dc2626'),
                fontSize: 12,
                marginRight: 8
              }}>
                {entry.response.status}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};