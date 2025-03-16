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
    <div className="min-h-screen bg-dark-gray-900">
      {/* Header */}
      <div className="bg-dark-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex flex-row justify-between items-center">
          {/* Logo */}
          <div className="flex flex-row items-center">
            <span className="text-2xl font-bold text-hacker-green mr-2">
              H4X-Tools
            </span>
            <span className="text-gray-400">
              Web Interface
            </span>
          </div>

          <div className="flex flex-row items-center gap-4">
            {/* Navigation Menu */}
            <div className="flex flex-row gap-2">
              <button
                className={`px-3 py-2 rounded-md ${
                  isActive('/') 
                    ? 'bg-hacker-green text-white'
                    : 'bg-dark-gray-700 text-gray-300 hover:text-white'
                }`}
                onClick={() => navigate('/')}
              >
                Home
              </button>

              <button
                className={`px-3 py-2 rounded-md ${
                  isActive('/tools')
                    ? 'bg-hacker-green text-white'
                    : 'bg-dark-gray-700 text-gray-300 hover:text-white'
                }`}
                onClick={() => navigate('/tools')}
              >
                Tools
              </button>
            </div>

            <button
              onClick={toggleTheme}
              className="px-3 py-2 rounded-md bg-dark-gray-700 text-gray-300 hover:text-white"
            >
              Toggle Theme
            </button>

            <span className="text-gray-400">v1.0.0</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <Outlet />

      {/* Footer */}
      <div className="bg-dark-gray-800 p-4 mt-auto">
        <span className="text-gray-400 text-center">
          H4X-Tools Web Interface - Based on the original H4X-Tools by vil - FOR EDUCATIONAL PURPOSES ONLY
        </span>
      </div>
    </div>
  );
};

export default RootLayout;