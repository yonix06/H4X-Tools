import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native-web';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { HistoryProvider } from '../contexts/HistoryContext';
import RootLayout from '../layout/RootLayout';
import Tools from './Tools';
import Investigation from './Investigation';
import SecurityDashboard from './SecurityDashboard';

const StatsCard = ({ title, value, trend }: { title: string; value: string; trend?: 'up' | 'down' }) => (
  <View className="bg-dark-gray-800 rounded-xl p-6 border border-dark-gray-700 hover:border-hacker-green transition-all duration-200">
    <Text className="text-gray-400 text-sm mb-2">{title}</Text>
    <Text className="text-2xl font-bold text-gray-100">{value}</Text>
    {trend && (
      <Text className={`text-sm mt-2 ${trend === 'up' ? 'text-red-400' : 'text-green-400'}`}>
        {trend === 'up' ? '↑' : '↓'} vs last week
      </Text>
    )}
  </View>
);

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  onClick 
}: { 
  icon: string; 
  title: string; 
  description: string; 
  onClick: () => void;
}) => (
  <TouchableOpacity 
    onPress={onClick}
    className="bg-dark-gray-800 rounded-xl p-6 border border-dark-gray-700 hover:border-hacker-green 
              transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
  >
    <Text className="text-4xl mb-4">{icon}</Text>
    <Text className="text-xl font-bold text-gray-100 mb-2">{title}</Text>
    <Text className="text-gray-400">{description}</Text>
  </TouchableOpacity>
);

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <View className="min-h-screen bg-dark-gray-900">
      <View className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <View className="text-center mb-16">
          <Text className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-hacker-green to-emerald-400 mb-6">
            H4X-Tools Dashboard
          </Text>
          <Text className="text-xl text-gray-400 max-w-3xl mx-auto">
            Advanced security monitoring and investigation platform for network protection
          </Text>
        </View>

        {/* Quick Stats */}
        <View className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <StatsCard title="Active Threats" value="12" trend="up" />
          <StatsCard title="Security Score" value="86%" trend="down" />
          <StatsCard title="Events Today" value="234" />
          <StatsCard title="Active Investigations" value="3" />
        </View>

        {/* Main Features */}
        <View className="mb-16">
          <Text className="text-2xl font-bold text-gray-100 mb-8">Core Features</Text>
          <View className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🛡️"
              title="Security Tools"
              description="Comprehensive suite of network security and analysis tools"
              onClick={() => navigate('/tools')}
            />
            <FeatureCard
              icon="🔍"
              title="Investigation"
              description="Track and analyze security incidents and threats"
              onClick={() => navigate('/investigation')}
            />
            <FeatureCard
              icon="📊"
              title="Security Dashboard"
              description="Real-time monitoring and security metrics"
              onClick={() => navigate('/security')}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-16">
          <Text className="text-2xl font-bold text-gray-100 mb-8">Quick Actions</Text>
          <View className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TouchableOpacity
              onPress={() => navigate('/security')}
              className="bg-dark-gray-800 rounded-lg p-6 border border-dark-gray-700 hover:border-hacker-green
                        transform transition-all duration-200 hover:scale-102"
            >
              <View className="flex-row items-center space-x-4">
                <Text className="text-3xl">🔒</Text>
                <View>
                  <Text className="text-xl font-semibold text-gray-100">Check Security Status</Text>
                  <Text className="text-gray-400">View current security metrics and alerts</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigate('/investigation')}
              className="bg-dark-gray-800 rounded-lg p-6 border border-dark-gray-700 hover:border-hacker-green
                        transform transition-all duration-200 hover:scale-102"
            >
              <View className="flex-row items-center space-x-4">
                <Text className="text-3xl">📝</Text>
                <View>
                  <Text className="text-xl font-semibold text-gray-100">New Investigation</Text>
                  <Text className="text-gray-400">Start tracking a new security incident</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View>
          <Text className="text-2xl font-bold text-gray-100 mb-8">Recent Activity</Text>
          <View className="bg-dark-gray-800 rounded-xl p-6 border border-dark-gray-700">
            <View className="space-y-4">
              {[
                { icon: '🚨', text: 'New security alert detected', time: '2 minutes ago' },
                { icon: '🔍', text: 'Investigation #127 updated', time: '15 minutes ago' },
                { icon: '🛡️', text: 'Firewall rules updated', time: '1 hour ago' },
                { icon: '📊', text: 'Daily security report generated', time: '3 hours ago' }
              ].map((item, index) => (
                <View 
                  key={index} 
                  className="flex-row items-center space-x-4 p-4 rounded-lg bg-dark-gray-700 hover:bg-dark-gray-600 
                            transition-colors duration-200"
                >
                  <Text className="text-2xl">{item.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-gray-200">{item.text}</Text>
                    <Text className="text-gray-500 text-sm">{item.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <HistoryProvider>
        <Router>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              <Route index element={<WelcomePage />} />
              <Route path="tools" element={<Tools />} />
              <Route path="investigation" element={<Investigation />} />
              <Route path="security" element={<SecurityDashboard />} />
            </Route>
          </Routes>
        </Router>
      </HistoryProvider>
    </ThemeProvider>
  );
};

export default App;
