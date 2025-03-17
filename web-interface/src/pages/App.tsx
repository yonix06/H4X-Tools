import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native-web';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const featuredTools = [
    {
      title: 'IP Lookup',
      description: 'Recherchez des informations détaillées sur une adresse IP',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      path: '/tools?tool=ip-lookup'
    },
    {
      title: 'Port Scanner',
      description: 'Analysez les ports ouverts sur un hôte distant',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      path: '/tools?tool=port-scanner'
    },
    {
      title: 'Web Scraper',
      description: 'Extrayez des données de pages web',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      path: '/tools?tool=web-scraper'
    }
  ];

  return (
    <div className={`flex-1 p-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Bienvenue sur H4X Tools
          </h1>
          <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Une suite complète d'outils de sécurité et d'investigation
          </p>
        </div>

        {/* Featured Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featuredTools.map((tool) => (
            <Link
              key={tool.title}
              to={tool.path}
              className={`
                p-6 rounded-xl shadow-lg transition-all transform hover:scale-105
                ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}
              `}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-purple-900' : 'bg-purple-100'}`}>
                  {tool.icon}
                </div>
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {tool.title}
                  </h3>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {tool.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Access Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Investigation rapide
            </h2>
            <div className="space-y-4">
              <Link
                to="/investigation"
                className={`block p-4 rounded-lg transition-colors
                  ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    Lancer une nouvelle investigation
                  </span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Tableau de bord de sécurité
            </h2>
            <div className="space-y-4">
              <Link
                to="/security"
                className={`block p-4 rounded-lg transition-colors
                  ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    Voir les analyses de sécurité
                  </span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
