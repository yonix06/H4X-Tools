import React from 'react';
import { View } from 'react-native-web';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { HistoryProvider } from './contexts/HistoryContext';
import Tools from './pages/Tools';
import Investigation from './pages/Investigation';
import { SecurityDashboard } from './pages/SecurityDashboard';
import './App.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <View className="flex flex-col min-h-screen">
          {/* Navigation */}
          <View className="flex flex-row bg-dark-gray-900 p-4">
            <Link 
              to="/"
              className="text-hacker-green mr-6 no-underline text-lg font-bold"
            >
              H4X-Tools
            </Link>
            <Link 
              to="/security"
              className="text-gray-300 mr-4 no-underline hover:text-white transition-colors"
            >
              Security Dashboard
            </Link>
            <Link 
              to="/tools"
              className="text-gray-300 mr-4 no-underline hover:text-white transition-colors"
            >
              Tools
            </Link>
            <Link 
              to="/investigation"
              className="text-gray-300 no-underline hover:text-white transition-colors"
            >
              Investigation
            </Link>
          </View>

          {/* Routes */}
          <Routes>
            <Route path="/tools" element={<Tools />} />
            <Route path="/investigation" element={<Investigation />} />
            <Route path="/security" element={<SecurityDashboard />} />
            <Route path="/" element={
              <View className="flex-1 p-6 items-center justify-center">
                <View className="text-center max-w-2xl">
                  <View className="text-4xl font-bold text-hacker-green mb-4">
                    Welcome to H4X-Tools Web Interface
                  </View>
                  <View className="text-gray-300 text-lg">
                    A comprehensive toolkit for network security monitoring,
                    investigation, and OSINT research. Choose a section from
                    the navigation menu above to get started.
                  </View>
                </View>
              </View>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </View>
      </Router>
    </ThemeProvider>
  );
};

export default App;
