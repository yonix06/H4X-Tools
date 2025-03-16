import React from 'react';
import { View, Text } from 'react-native-web';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { HistoryProvider } from './contexts/HistoryContext';
import RootLayout from './components/RootLayout';
import Tools from './pages/Tools';
import Investigation from './pages/Investigation';
import SecurityDashboard from './pages/SecurityDashboard';
import './App.css';

const WelcomePage: React.FC = () => (
  <View className="flex-1 p-6 flex items-center justify-center">
    <View className="text-center max-w-2xl">
      <Text className="text-4xl font-bold text-hacker-green mb-4">
        Welcome to H4X-Tools Web Interface
      </Text>
      <Text className="text-gray-300 text-lg">
        A comprehensive toolkit for network security monitoring,
        investigation, and OSINT research. Choose a section from
        the navigation menu above to get started.
      </Text>
    </View>
  </View>
);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <HistoryProvider>
        <Router>
          <View className="min-h-screen bg-dark-gray-900">
            <Routes>
              <Route path="/" element={<RootLayout />}>
                <Route index element={<WelcomePage />} />
                <Route path="tools" element={<Tools />} />
                <Route path="investigation" element={<Investigation />} />
                <Route path="security" element={<SecurityDashboard />} />
              </Route>
            </Routes>
          </View>
        </Router>
      </HistoryProvider>
    </ThemeProvider>
  );
};

export default App;
