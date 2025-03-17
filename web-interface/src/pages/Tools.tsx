import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import IpLookup from '../components/tools/IpLookup';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
}

const Tools: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const location = useLocation();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const tools: Tool[] = [
    {
      id: 'ip-lookup',
      name: 'IP Lookup',
      description: 'Look up detailed information about an IP address',
      category: 'Network',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
    },
    {
      id: 'port-scanner',
      name: 'Port Scanner',
      description: 'Scan open ports on a remote host',
      category: 'Network',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'web-scraper',
      name: 'Web Scraper',
      description: 'Extract data from web pages',
      category: 'Web',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
    },
    {
      id: 'email-search',
      name: 'Email Search',
      description: 'Search for information about an email address',
      category: 'Investigation',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'username-search',
      name: 'Username Search',
      description: 'Search for a username across different platforms',
      category: 'Investigation',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    }
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const toolId = params.get('tool');
    if (toolId) {
      setSelectedTool(toolId);
    }
  }, [location]);

  const categories = [...new Set(tools.map(tool => tool.category))];
  
  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`flex-1 h-full overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="h-full flex flex-col">
        {/* Header with search bar */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="max-w-4xl mx-auto">
            <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Available Tools
            </h1>
            <div className="relative">
              <input
                type="search"
                placeholder="Search for a tool..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`
                  w-full pl-10 pr-4 py-2 rounded-lg
                  ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
                  border ${isDark ? 'border-gray-700' : 'border-gray-300'}
                  focus:outline-none focus:ring-2 focus:ring-purple-500
                `}
              />
              <svg
                className={`absolute left-3 top-2.5 h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {categories.map(category => {
              const categoryTools = filteredTools.filter(tool => tool.category === category);
              if (categoryTools.length === 0) return null;

              return (
                <div key={category} className="mb-8">
                  <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryTools.map(tool => (
                      <button
                        key={tool.id}
                        onClick={() => setSelectedTool(tool.id)}
                        className={`
                          p-4 rounded-xl text-left transition-all
                          ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}
                          ${selectedTool === tool.id ? 'ring-2 ring-purple-500' : ''}
                          border ${isDark ? 'border-gray-700' : 'border-gray-200'}
                          hover:shadow-lg group
                        `}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`
                            p-2 rounded-lg
                            ${isDark ? 'bg-gray-700 group-hover:bg-gray-600' : 'bg-gray-100 group-hover:bg-gray-200'}
                          `}>
                            {tool.icon}
                          </div>
                          <div>
                            <h3 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {tool.name}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {tool.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected tool area */}
        {selectedTool && (
          <div className={`
            fixed inset-0 z-50 flex items-center justify-center p-4
            bg-black bg-opacity-50 animate-fade-in
          `}>
            <div className={`
              w-full max-w-4xl max-h-[90vh] overflow-auto rounded-xl
              ${isDark ? 'bg-gray-800' : 'bg-white'}
              p-6 shadow-xl animate-fade-in
            `}>
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {tools.find(t => t.id === selectedTool)?.name}
                  </h2>
                  <button
                    onClick={() => setSelectedTool(null)}
                    className={`
                      p-2 rounded-lg transition-colors
                      ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                    `}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Tool content */}
                <div className={`
                  flex-1 rounded-lg overflow-hidden
                  ${isDark ? 'bg-gray-700' : 'bg-gray-100'}
                `}>
                  {selectedTool === 'ip-lookup' && <IpLookup />}
                  {selectedTool === 'port-scanner' && <p className={`p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Port Scanner in development...</p>}
                  {selectedTool === 'web-scraper' && <p className={`p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Web Scraper in development...</p>}
                  {selectedTool === 'email-search' && <p className={`p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email Search in development...</p>}
                  {selectedTool === 'username-search' && <p className={`p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Username Search in development...</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tools;