import React from 'react';
import { View, Text } from 'react-native-web';
import { useTheme } from '../contexts/ThemeContext';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Running tool...' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <View style={{
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        padding: 24,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}>
        <View style={{ alignItems: 'center' }}>
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            borderWidth: 4,
            borderColor: isDark ? '#10b981' : '#059669',
            borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite',
          }} />
          <Text style={{
            marginTop: 16,
            color: isDark ? '#d1d5db' : '#4b5563',
            fontSize: 16,
          }}>
            {message}
          </Text>
        </View>
      </View>
    </View>
  );
};