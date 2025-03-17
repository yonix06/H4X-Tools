import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface Case {
  id: string;
  title: string;
  status: 'active' | 'closed' | 'pending';
  created: string;
  lastUpdated: string;
  description: string;
  tools: string[];
}

const Investigation: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [cases, setCases] = useState<Case[]>([]);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [newCase, setNewCase] = useState<Partial<Case>>({
    title: '',
    description: '',
    tools: [],
  });

  const handleCreateCase = () => {
    if (!newCase.title) return;

    const caseToAdd: Case = {
      id: Date.now().toString(),
      title: newCase.title,
      description: newCase.description || '',
      status: 'active',
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      tools: newCase.tools || [],
    };

    setCases([caseToAdd, ...cases]);
    setIsNewCaseModalOpen(false);
    setNewCase({ title: '', description: '', tools: [] });
  };

  return (
    <div className={`flex-1 h-full overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Investigations
              </h1>
              <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Gérez vos investigations et suivez leur progression
              </p>
            </div>
            <button
              onClick={() => setIsNewCaseModalOpen(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Nouvelle investigation</span>
            </button>
          </div>
        </div>

        {/* Liste des investigations */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {cases.length === 0 ? (
              <div className={`
                text-center p-12 rounded-lg border-2 border-dashed
                ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-600'}
              `}>
                <svg 
                  className="w-12 h-12 mx-auto mb-4 opacity-50" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                  />
                </svg>
                <h3 className="text-lg font-medium mb-2">Aucune investigation en cours</h3>
                <p>Commencez par créer une nouvelle investigation</p>
                <button
                  onClick={() => setIsNewCaseModalOpen(true)}
                  className="mt-4 btn-secondary inline-flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Créer une investigation</span>
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cases.map(case_ => (
                  <div
                    key={case_.id}
                    className={`
                      p-6 rounded-xl shadow-lg border transition-all hover:shadow-xl
                      ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                    `}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {case_.title}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Créé le {new Date(case_.created).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`
                        px-2 py-1 text-xs rounded-full
                        ${case_.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : case_.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'}
                      `}>
                        {case_.status === 'active' ? 'Actif' : case_.status === 'pending' ? 'En attente' : 'Fermé'}
                      </span>
                    </div>
                    <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {case_.description}
                    </p>
                    {case_.tools.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {case_.tools.map(tool => (
                          <span
                            key={tool}
                            className={`
                              px-2 py-1 text-xs rounded-full
                              ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}
                            `}
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal nouvelle investigation */}
      {isNewCaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className={`
            w-full max-w-md rounded-xl shadow-xl
            ${isDark ? 'bg-gray-800' : 'bg-white'}
            p-6
          `}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Nouvelle investigation
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Titre
                </label>
                <input
                  type="text"
                  value={newCase.title}
                  onChange={e => setNewCase({ ...newCase, title: e.target.value })}
                  className="input-field"
                  placeholder="Nom de l'investigation"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={newCase.description}
                  onChange={e => setNewCase({ ...newCase, description: e.target.value })}
                  className="input-field min-h-[100px]"
                  placeholder="Description détaillée de l'investigation"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsNewCaseModalOpen(false)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateCase}
                  className="btn-primary"
                  disabled={!newCase.title}
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investigation;