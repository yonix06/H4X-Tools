import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const WebSearch: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tools/web-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      setResult({ status: 'error', message: 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Web Search
      </h2>
      <div className="mb-4">
        <label htmlFor="query" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Query:
        </label>
        <input
          type="text"
          id="query"
          className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : ''}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <button
        onClick={handleSubmit}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Search'}
      </button>

      {result && (
        <div className="mt-4">
          <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Result:
          </h3>
          <pre className={`rounded-md p-4 overflow-x-auto ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default WebSearch;
