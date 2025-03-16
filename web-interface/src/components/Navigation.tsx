import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native-web';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const Navigation: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const links = [
    { path: '/', label: 'Tools' },
    { path: '/investigation', label: 'Investigation' },
    { path: '/security', label: 'Security Dashboard' }
  ];

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: isDark ? '#111827' : '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : '#e5e7eb'
    }}>
      {links.map(({ path, label }) => (
        <Link
          key={path}
          to={path}
          style={{ textDecoration: 'none' }}
        >
          <View style={{
            marginRight: 16,
            backgroundColor: isActive(path) 
              ? (isDark ? '#374151' : '#e5e7eb')
              : 'transparent',
            padding: 8,
            borderRadius: 6
          }}>
            <Text style={{
              color: isDark ? '#ffffff' : '#111827',
              fontWeight: isActive(path) ? 'bold' : 'normal'
            }}>
              {label}
            </Text>
          </View>
        </Link>
      ))}

      <TouchableOpacity
        onPress={toggleTheme}
        style={{
          marginLeft: 'auto',
          backgroundColor: isDark ? '#374151' : '#e5e7eb',
          padding: 8,
          borderRadius: 6
        }}
      >
        <Text style={{
          color: isDark ? '#ffffff' : '#111827'
        }}>
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Navigation;