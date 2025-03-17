import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search logic here
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className={`
      px-4 h-16 flex items-center justify-between
      ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
      border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}
      shadow-sm
    `}>
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">H4X Tools</h1>
        
        <form onSubmit={handleSearch} className="hidden md:flex items-center">
          <div className="relative">
            <input
              type="search"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`
                pl-10 pr-4 py-2 rounded-lg w-64
                ${isDark ? 'bg-gray-700 focus:bg-gray-600' : 'bg-gray-100 focus:bg-white'}
                focus:outline-none focus:ring-2 focus:ring-purple-500
                transition-colors
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
        </form>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className={`
            p-2 rounded-lg
            ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
            transition-colors
          `}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>

        <button
          className={`
            p-2 rounded-lg
            ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
            transition-colors
            relative
          `}
          aria-label="Notifications"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
          <span>H</span>
        </div>
      </div>
    </header>
  );
};

export default Header;