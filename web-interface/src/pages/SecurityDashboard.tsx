import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const SecurityDashboard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const securityStats = [
    {
      title: 'Alertes actives',
      value: '5',
      trend: 'up',
      description: 'Nouvelles menaces détectées'
    },
    {
      title: 'Vulnérabilités',
      value: '12',
      trend: 'down',
      description: '3 corrections appliquées'
    },
    {
      title: 'Score de sécurité',
      value: '85%',
      trend: 'up',
      description: '+5% depuis la dernière analyse'
    },
    {
      title: 'Tests réussis',
      value: '28/30',
      trend: 'up',
      description: 'Tests de sécurité automatisés'
    }
  ];

  const recentAlerts = [
    {
      id: '1',
      title: 'Tentative d&apos;accès non autorisé',
      severity: 'high',
      timestamp: '2024-02-20T10:30:00',
      status: 'active'
    },
    {
      id: '2',
      title: 'Vulnérabilité CVE détectée',
      severity: 'medium',
      timestamp: '2024-02-19T15:45:00',
      status: 'investigating'
    },
    {
      id: '3',
      title: 'Mise à jour de sécurité disponible',
      severity: 'low',
      timestamp: '2024-02-18T09:15:00',
      status: 'resolved'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800';
      case 'investigating':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`flex-1 h-full overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="max-w-7xl mx-auto">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Tableau de bord de sécurité
            </h1>
            <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Vue d'ensemble de la sécurité et des alertes
            </p>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {securityStats.map((stat, index) => (
                <div
                  key={index}
                  className={`
                    p-6 rounded-xl shadow-lg border transition-all
                    ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {stat.title}
                    </h3>
                    <span className={`
                      text-xs px-2 py-1 rounded-full
                      ${stat.trend === 'up' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'}
                    `}>
                      {stat.trend === 'up' ? '↑' : '↓'}
                    </span>
                  </div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </p>
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Alertes récentes */}
            <div className={`
              p-6 rounded-xl shadow-lg border
              ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
            `}>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Alertes récentes
              </h2>
              <div className="space-y-4">
                {recentAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`
                      p-4 rounded-lg border
                      ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {alert.title}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(alert.status)}`}>
                          {alert.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions rapides */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`
                p-6 rounded-xl shadow-lg border
                ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
              `}>
                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Actions recommandées
                </h2>
                <div className="space-y-3">
                  <button className="btn-primary w-full justify-between">
                    <span>Lancer une analyse complète</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button className="btn-secondary w-full justify-between">
                    <span>Mettre à jour les signatures</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className={`
                p-6 rounded-xl shadow-lg border
                ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
              `}>
                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Rapports
                </h2>
                <div className="space-y-3">
                  <button className="btn-secondary w-full justify-between">
                    <span>Générer un rapport complet</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  <button className="btn-secondary w-full justify-between">
                    <span>Exporter les données</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;