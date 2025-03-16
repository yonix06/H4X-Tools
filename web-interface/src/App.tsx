import React from 'react';
import { View, Text } from 'react-native-web';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { HistoryProvider } from './contexts/HistoryContext';
import RootLayout from './components/RootLayout';
import Tools from './pages/Tools';
import Investigation from './pages/Investigation';
import SecurityDashboard from './pages/SecurityDashboard';
import './App.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <View style={{ flex: 1, minHeight: '100vh' }}>
          {/* Navigation */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: '#111827',
            padding: 16,
          }}>
            <Link 
              to="/"
              style={{
                color: '#10b981',
                marginRight: 24,
                textDecoration: 'none',
                fontSize: 18,
                fontWeight: 'bold',
              }}
            >
              H4X-Tools
            </Link>
            <Link 
              to="/security"
              style={{
                color: '#d1d5db',
                marginRight: 16,
                textDecoration: 'none',
              }}
            >
              Security Dashboard
            </Link>
            <Link 
              to="/tools"
              style={{
                color: '#d1d5db',
                marginRight: 16,
                textDecoration: 'none',
              }}
            >
              Tools
            </Link>
            <Link 
              to="/investigation"
              style={{
                color: '#d1d5db',
                textDecoration: 'none',
              }}
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
              <View style={{ 
                flex: 1,
                padding: 24,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text style={{
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: '#10b981',
                  marginBottom: 16,
                }}>
                  Welcome to H4X-Tools Web Interface
                </Text>
                <Text style={{
                  color: '#d1d5db',
                  fontSize: 18,
                  textAlign: 'center',
                  maxWidth: 600,
                }}>
                  A comprehensive toolkit for network security monitoring,
                  investigation, and OSINT research. Choose a section from
                  the navigation menu above to get started.
                </Text>
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
