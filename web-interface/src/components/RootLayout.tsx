import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native-web';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const RootLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <View className="min-h-screen bg-dark-gray-900">
      {/* Header */}
      <View className="bg-dark-gray-800 p-4">
        <View className="max-w-7xl mx-auto flex flex-row justify-between items-center">
          {/* Logo */}
          <View className="flex flex-row items-center">
            <Text className="text-2xl font-bold text-hacker-green mr-2">
              H4X-Tools
            </Text>
            <Text className="text-gray-400">
              Web Interface
            </Text>
          </View>

          <View className="flex flex-row items-center gap-4">
            {/* Navigation Menu */}
            <View className="flex flex-row gap-2">
              <TouchableOpacity
                className={`px-3 py-2 rounded-md ${
                  isActive('/') 
                    ? 'bg-hacker-green text-white'
                    : 'bg-dark-gray-700 text-gray-300 hover:text-white'
                }`}
                onPress={() => navigate('/')}
              >
                <Text className="text-inherit">
                  Dashboard
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`px-3 py-2 rounded-md ${
                  isActive('/tools')
                    ? 'bg-hacker-green text-white'
                    : 'bg-dark-gray-700 text-gray-300 hover:text-white'
                }`}
                onPress={() => navigate('/tools')}
              >
                <Text className="text-inherit">
                  Tools
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`px-3 py-2 rounded-md ${
                  isActive('/investigation')
                    ? 'bg-hacker-green text-white'
                    : 'bg-dark-gray-700 text-gray-300 hover:text-white'
                }`}
                onPress={() => navigate('/investigation')}
              >
                <Text className="text-inherit">
                  Investigation
                </Text>
              </TouchableOpacity>
            </View>

            {/* Theme Toggle */}
            <TouchableOpacity
              onPress={toggleTheme}
              className="px-3 py-2 rounded-md bg-dark-gray-700 text-gray-300 hover:text-white"
            >
              <Text className="text-inherit">
                {isDark ? '🌞 Light Mode' : '🌙 Dark Mode'}
              </Text>
            </TouchableOpacity>

            <Text className="text-gray-400">v1.0.0</Text>
          </View>
        </View>
      </View>

      {/* Main Content Area */}
      <Outlet />

      {/* Footer */}
      <View className="bg-dark-gray-800 p-4 mt-auto">
        <Text className="text-gray-400 text-center">
          H4X-Tools Web Interface - Based on the original H4X-Tools by vil - FOR EDUCATIONAL PURPOSES ONLY
        </Text>
      </View>
    </View>
  );
};

export default RootLayout;