import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingSpinner from '../LoadingSpinner';

interface BaseXXResult {
  original: string;
  result: string;
  mode: string;
  base: string;
}

const BaseXX: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [encoding, setEncoding] = useState<'64' | '32' | '16'>('64');
  const [result, setResult] = useState<BaseXXResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/tools/basexx", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message,
          mode,
          encoding
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Error processing BaseXX operation");
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

  return (
    <div className="p-6 space-y-6">
      <div className={`
        p-4 rounded-lg border 
        ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          BaseXX Encoder/Decoder
        </h2>
        <p className={`mb-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Encode or decode text using Base64, Base32, or Base16 (Hex) encoding.
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
              placeholder="Enter text to encode or decode"
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
                onChange={(e) => setMode(e.target.value as 'encode' | 'decode')}
                className="input-field"
              >
                <option value="encode">Encode</option>
                <option value="decode">Decode</option>
              </select>
            </div>

            <div>
              <label 
                htmlFor="encoding" 
                className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Encoding
              </label>
              <select
                id="encoding"
                value={encoding}
                onChange={(e) => setEncoding(e.target.value as '64' | '32' | '16')}
                className="input-field"
              >
                <option value="64">Base64</option>
                <option value="32">Base32</option>
                <option value="16">Base16 (Hex)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="btn-primary"
            >
              {isLoading ? <LoadingSpinner size="small" /> : (mode === 'encode' ? "Encode" : "Decode")}
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
              {mode === 'encode' ? 'Encoded Result' : 'Decoded Result'}
            </h3>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Using Base{encoding}
            </div>
          </div>
          
          <div className="p-4">
            <div className="mb-2">
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
            
            <div>
              <h4 className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {mode === 'encode' ? 'Encoded Output:' : 'Decoded Output:'}
              </h4>
              <div className={`
                p-3 rounded-lg font-mono text-sm break-all
                ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}
              `}>
                {result.result}
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.result);
                }}
                className="btn-secondary text-sm flex items-center gap-1"
                title="Copy to clipboard"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy Result
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseXX;
