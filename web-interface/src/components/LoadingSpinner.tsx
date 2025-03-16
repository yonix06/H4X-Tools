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
    <View className="absolute inset-0 bg-black/70 dark:bg-white/70 flex justify-center items-center z-50">
      <View className="bg-dark-gray-800 dark:bg-white p-6 rounded-lg shadow-lg">
        <View className="flex items-center">
          <View className={`w-12 h-12 rounded-full border-4 border-t-transparent ${
            isDark ? 'border-hacker-green' : 'border-hacker-green-600'
          } animate-spin`} />
          <Text className="mt-4 text-base text-gray-300 dark:text-gray-600">
            {message}
          </Text>
        </View>
      </View>
    </View>
  );
};