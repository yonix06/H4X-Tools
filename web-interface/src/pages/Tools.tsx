import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import IpLookup from '../components/tools/IpLookup';
import WhoisLookup from '../components/tools/WhoisLookup';
import WebSearch from '../components/tools/WebSearch';
import LeakSearch from '../components/tools/LeakSearch';
import BaseXX from '../components/tools/BaseXX';

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
    },
    {
      id: 'whois-lookup',
      name: 'WhoIs Lookup',
      description: 'Looks up a domain and returns information about it.',
      category: 'Investigation',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      id: 'web-search',
      name: 'Web Search',
      description: 'Searches the internet for the given query.',
      category: 'Search',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'leak-search',
      name: 'Leak Search',
      description: 'Searches if given email/domain has been compromised and leaked.',
      category: 'Investigation',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    },
    {
      id: 'fake-info',
      name: 'Fake Info Generator',
      description: 'Generates fake information using Faker.',
      category: 'Utilities',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'wifi-finder',
      name: 'Wi-Fi Finder',
      description: 'Scans for nearby Wi-Fi networks.',
      category: 'Network',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.75a6 6 0 00-6-6v-1.5m6 7.5a6 6 0 016-6v-1.5m-6 7.5l6-6M6 11.25v3.75a9 9 0 1018 0v-3.75m-9 3.75a9 9 0 11-18 0z" />
        </svg>
      ),
    },
    {
      id: 'wifi-vault',
      name: 'Wi-Fi Vault',
      description: 'Scans for locally saved Wi-Fi passwords.',
      category: 'Network',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L15 17H9l-1.257-4.257A6 6 0 012 9m13 5h-1.5M21 12a4 4 0 00-4 4M3 4h18M3 4a16 16 0 014.216 5.195M3 4a15 15 0 013.183 4.803" />
        </svg>
      ),
    },
    {
      id: 'dirbuster',
      name: 'Dir Buster',
      description: 'Bruteforce directories on a website.',
      category: 'Web',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
    },
    {
      id: 'local-users',
      name: 'Local Users',
      description: 'Enumerates local user accounts on the current machine.',
      category: 'System',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: 'caesar-cipher',
      name: 'Caesar Cipher',
      description: "Cipher/decipher/bruteforce a message using the Caesar's code.",
      category: 'Cryptography',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
    },
    {
      id: 'basexx',
      name: 'BaseXX',
      description: 'Encodes/decodes a message using Base64/32/16.',
      category: 'Cryptography',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
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
                  {selectedTool === 'whois-lookup' && <WhoisLookup />}
                  {selectedTool === 'web-search' && <WebSearch />}
                  {selectedTool === 'leak-search' && <LeakSearch />}
                  {selectedTool === 'fake-info' && <p className={`p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Fake Info Generator in development...</p>}
                  {selectedTool === 'wifi-finder' && <p className={`p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Wi-Fi Finder in development...</p>}
                  {selectedTool === 'wifi-vault' && <p className={`p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Wi-Fi Vault in development...</p>}
                  {selectedTool === 'dirbuster' && <p className={`p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Dir Buster in development...</p>}
                  {selectedTool === 'local-users' && <p className={`p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Local Users in development...</p>}
                  {selectedTool === 'caesar-cipher' && <p className={`p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Caesar Cipher in development...</p>}
                  {selectedTool === 'basexx' && <BaseXX />}
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
