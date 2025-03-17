import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingSpinner from '../LoadingSpinner';

interface CaesarCipherResult {
  original: string;
  results: {
    shift: number;
    result: string;
  }[];
  mode: string;
}

const CaesarCipher: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt' | 'bruteforce'>('encrypt');
  const [shift, setShift] = useState<number>(3);
  const [result, setResult] = useState<CaesarCipherResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/tools/caesar-cipher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message,
          mode,
          shift: mode !== 'bruteforce' ? shift : undefined,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Error processing Caesar cipher operation");
      }

      if (data.status === "error") {
        throw new Error(data.message);
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const displayResults = () => {
    if (!result) return null;

    if (mode === 'bruteforce') {
      return (
        <div className="space-y-4">
          <h4 className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            All Possible Shifts:
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-custom">
            {result.results.map((item) => (
              <div 
                key={`shift-${item.shift}`}
                className={`
                  p-3 rounded-lg border
                  ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}
                `}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Shift: {item.shift}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(item.result)}
                    className="text-xs px-2 py-1 rounded hover:bg-gray-600/20"
                    title="Copy to clipboard"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
                <div className={`text-sm font-mono break-all ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                  {item.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      const resultItem = result.results[0];
      return (
        <div>
          <h4 className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {mode === 'encrypt' ? 'Encrypted Output:' : 'Decrypted Output:'}
          </h4>
          <div className={`
            p-3 rounded-lg font-mono text-sm break-all mb-2
            ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}
          `}>
            {resultItem.result}
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Using shift: {resultItem.shift}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className={`
        p-4 rounded-lg border 
        ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Caesar Cipher
        </h2>
        <p className={`mb-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Encrypt, decrypt, or bruteforce a message using Caesar&apos;s cipher.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="message" 
              className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter text to process"
              rows={4}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label 
                htmlFor="mode" 
                className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Mode
              </label>
              <select
                id="mode"
                value={mode}
                onChange={(e) => setMode(e.target.value as 'encrypt' | 'decrypt' | 'bruteforce')}
                className="input-field"
              >
                <option value="encrypt">Encrypt</option>
                <option value="decrypt">Decrypt</option>
                <option value="bruteforce">Bruteforce (Try all shifts)</option>
              </select>
            </div>

            {mode !== 'bruteforce' && (
              <div>
                <label 
                  htmlFor="shift" 
                  className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Shift (1-25)
                </label>
                <input
                  id="shift"
                  type="number"
                  min="1"
                  max="25"
                  value={shift}
                  onChange={(e) => setShift(parseInt(e.target.value) || 3)}
                  className="input-field"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="btn-primary"
            >
              {isLoading ? <LoadingSpinner size="small" /> : 
                mode === 'encrypt' ? "Encrypt" : 
                mode === 'decrypt' ? "Decrypt" : "Bruteforce"
              }
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/50' : 'bg-red-100'}`}>
          <p className={`text-sm ${isDark ? 'text-red-200' : 'text-red-800'}`}>{error}</p>
        </div>
      )}

      {result && (
        <div className={`
          rounded-lg border
          ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          overflow-hidden
        `}>
          <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {mode === 'encrypt' ? 'Encryption Result' : 
               mode === 'decrypt' ? 'Decryption Result' : 'Bruteforce Results'}
            </h3>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <h4 className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Original Input:
              </h4>
              <div className={`
                p-3 rounded-lg font-mono text-sm break-all
                ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}
              `}>
                {result.original}
              </div>
            </div>
            
            {displayResults()}
            
            <div className="mt-4 flex justify-end">
              {mode !== 'bruteforce' && result.results.length > 0 && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.results[0].result);
                  }}
                  className="btn-secondary text-sm flex items-center gap-1"
                  title="Copy to clipboard"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy Result
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaesarCipher;