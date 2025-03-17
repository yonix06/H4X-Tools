import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingSpinner from '../LoadingSpinner';

interface IpLookupResult {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  postal?: string;
  timezone?: string;
  asn?: string;
  threat_level?: string;
}

const IpLookup: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [ipAddress, setIpAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IpLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipAddress.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tools/ip-lookup?ip=${encodeURIComponent(ipAddress)}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la recherche IP');
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="ipAddress" 
            className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
          >
            Adresse IP
          </label>
          <div className="flex space-x-2">
            <input
              id="ipAddress"
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="Entrez une adresse IP"
              className="input-field flex-1"
            />
            <button
              type="submit"
              disabled={isLoading || !ipAddress.trim()}
              className="btn-primary min-w-[100px]"
            >
              {isLoading ? <LoadingSpinner size="small" /> : 'Rechercher'}
            </button>
          </div>
        </div>
      </form>

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
              Résultats pour {result.ip}
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(result).map(([key, value]) => (
                key !== 'ip' && (
                  <div key={key} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}
                    </div>
                    <div className={isDark ? 'text-white' : 'text-gray-900'}>
                      {value || 'N/A'}
                    </div>
                  </div>
                )
              ))}
            </div>

            {result.loc && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Localisation
                </h4>
                <div className="aspect-[16/9] w-full rounded-lg overflow-hidden">
                  <iframe
                    title="Location Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${result.loc}&layer=mapnik`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IpLookup;