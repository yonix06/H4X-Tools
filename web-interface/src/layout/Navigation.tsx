import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native-web';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const Navigation: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/tools', label: 'Tools', icon: '🛠' },
    { path: '/investigation', label: 'Investigation', icon: '🔍' },
    { path: '/security', label: 'Security', icon: '🛡️' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <View className={`border-b ${
      isDark ? 'bg-dark-gray-800 border-dark-gray-700' : 'bg-white border-gray-200'
    }`}>
      <View className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <View className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <View className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Text className={`text-xl font-bold ${
                isDark ? 'text-hacker-green' : 'text-emerald-600'
              }`}>
                H4X-Tools
              </Text>
            </Link>

            {/* Desktop Navigation */}
            <View className="hidden md:ml-6 md:flex md:space-x-4 items-center">
              {links.map(({ path, label, icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive(path)
                      ? isDark 
                        ? 'bg-dark-gray-700 text-hacker-green'
                        : 'bg-emerald-100 text-emerald-700'
                      : isDark
                        ? 'text-gray-300 hover:bg-dark-gray-700 hover:text-hacker-green'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <View className="flex flex-row items-center space-x-2">
                    <Text>{icon}</Text>
                    <Text>{label}</Text>
                  </View>
                </Link>
              ))}
            </View>
          </View>

          {/* Right side buttons */}
          <View className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <TouchableOpacity
              onPress={toggleTheme}
              className={`p-2 rounded-md ${
                isDark 
                  ? 'hover:bg-dark-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Text className="text-lg">{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>

            {/* Mobile menu button */}
            <TouchableOpacity
              onPress={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-dark-gray-700"
            >
              <Text className="text-xl text-gray-300">{isMobileMenuOpen ? '✕' : '☰'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <View className="md:hidden absolute top-16 left-0 right-0 z-50">
          <View className={`px-2 pt-2 pb-3 space-y-1 shadow-lg border-b ${
            isDark ? 'bg-dark-gray-800 border-dark-gray-700' : 'bg-white border-gray-200'
          }`}>
            {links.map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(path)
                    ? isDark 
                      ? 'bg-dark-gray-700 text-hacker-green'
                      : 'bg-emerald-100 text-emerald-700'
                    : isDark
                      ? 'text-gray-300 hover:bg-dark-gray-700 hover:text-hacker-green'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <View className="flex flex-row items-center space-x-2">
                  <Text>{icon}</Text>
                  <Text>{label}</Text>
                </View>
              </Link>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default Navigation;