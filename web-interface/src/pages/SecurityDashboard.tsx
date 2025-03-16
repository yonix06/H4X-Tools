import React from 'react';
import { View, Text, ScrollView } from 'react-native-web';
import { useTheme } from '../contexts/ThemeContext';
import { SecurityEvents } from '../components/SecurityEvents';
import { VPNStatus } from '../components/VPNStatus';
import { SecurityStats } from '../components/SecurityStats';

const SecurityDashboard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Text style={{ 
          fontSize: 24,
          fontWeight: 'bold',
          color: isDark ? '#10b981' : '#059669'
        }}>
          Security Dashboard
        </Text>
      </View>

      {/* Main Content */}
      <ScrollView style={{ padding: 24 }}>
        {/* VPN Status Component */}
        <VPNStatus />

        {/* Security Stats Component */}
        <SecurityStats />

        {/* Security Events Component */}
        <SecurityEvents />
      </ScrollView>
    </View>
  );
};

export default SecurityDashboard;