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
    <View style={{ 
      flex: 1, 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: isDark ? '#111827' : '#ffffff'
    }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ 
            fontSize: 24,
            fontWeight: 'bold',
            color: isDark ? '#10b981' : '#059669',
            marginRight: 8
          }}>
            H4X-Tools
          </Text>
          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
            Web Interface
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          {/* Navigation Menu */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={{
                backgroundColor: isActive('/') 
                  ? (isDark ? '#047857' : '#d1fae5')
                  : (isDark ? '#374151' : '#e5e7eb'),
                padding: 8,
                borderRadius: 4,
              }}
              onPress={() => navigate('/')}
            >
              <Text style={{ 
                color: isActive('/') 
                  ? (isDark ? '#ffffff' : '#047857')
                  : (isDark ? '#9ca3af' : '#4b5563')
              }}>
                Tools
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: isActive('/investigation') 
                  ? (isDark ? '#047857' : '#d1fae5')
                  : (isDark ? '#374151' : '#e5e7eb'),
                padding: 8,
                borderRadius: 4,
              }}
              onPress={() => navigate('/investigation')}
            >
              <Text style={{ 
                color: isActive('/investigation')
                  ? (isDark ? '#ffffff' : '#047857')
                  : (isDark ? '#9ca3af' : '#4b5563')
              }}>
                Investigation
              </Text>
            </TouchableOpacity>
          </View>

          {/* Theme Toggle */}
          <TouchableOpacity
            onPress={toggleTheme}
            style={{
              backgroundColor: isDark ? '#374151' : '#e5e7eb',
              padding: 8,
              borderRadius: 4,
            }}
          >
            <Text style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>
              {isDark ? '🌞 Light Mode' : '🌙 Dark Mode'}
            </Text>
          </TouchableOpacity>

          <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>v1.0.0</Text>
        </View>
      </View>

      {/* Main Content Area */}
      <Outlet />

      {/* Footer */}
      <View style={{ 
        backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
        padding: 16
      }}>
        <Text style={{ 
          color: isDark ? '#9ca3af' : '#6b7280',
          textAlign: 'center'
        }}>
          H4X-Tools Web Interface - Based on the original H4X-Tools by vil - FOR EDUCATIONAL PURPOSES ONLY
        </Text>
      </View>
    </View>
  );
};

export default RootLayout;