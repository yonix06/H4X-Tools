import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingSpinner from '../LoadingSpinner';

interface FakeInfoResult {
  name: string;
  address: string;
  email: string;
  phone: string;
  ssn: string;
  credit_card: string;
  job: string;
  company: string;
  birth_date: string;
  username: string;
  website: string;
  ip_address: string;
}

const FakeInfoGenerator: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [locale, setLocale] = useState<string>('en_US');
  const [count, setCount] = useState<number>(1);
  const [result, setResult] = useState<FakeInfoResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/tools/fake-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          locale,
          count
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Error generating fake information");
      }

      if (data.status === "error") {
        throw new Error(data.message);
      }

      // Ensure result is always an array
      const resultData = Array.isArray(data.data) ? data.data : [data.data];
      setResult(resultData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const copyAllToClipboard = () => {
    if (!result) return;
    
    const formattedResult = result.map(person => {
      return `
Name: ${person.name}
Email: ${person.email}
Phone: ${person.phone}
Address: ${person.address}
Birth Date: ${person.birth_date}
Job: ${person.job}
Company: ${person.company}
Username: ${person.username}
Website: ${person.website}
SSN: ${person.ssn}
Credit Card: ${person.credit_card}
IP Address: ${person.ip_address}
      `.trim();
    }).join('\n\n----------\n\n');
    
    navigator.clipboard.writeText(formattedResult);
  };

  const locales = [
    { value: 'en_US', label: 'United States' },
    { value: 'en_GB', label: 'United Kingdom' },
    { value: 'fr_FR', label: 'France' },
    { value: 'de_DE', label: 'Germany' },
    { value: 'ja_JP', label: 'Japan' },
    { value: 'es_ES', label: 'Spain' },
    { value: 'it_IT', label: 'Italy' },
    { value: 'zh_CN', label: 'China' },
    { value: 'ru_RU', label: 'Russia' },
    { value: 'pt_BR', label: 'Brazil' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className={`
        p-4 rounded-lg border 
        ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Fake Info Generator
        </h2>
        <p className={`mb-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Generate realistic fake personal information for testing purposes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label 
                htmlFor="locale" 
                className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Locale
              </label>
              <select
                id="locale"
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="input-field"
              >
                {locales.map(loc => (
                  <option key={loc.value} value={loc.value}>{loc.label}</option>
                ))}
              </select>
              <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Select a locale to generate appropriate regional information
              </p>
            </div>

            <div>
              <label 
                htmlFor="count" 
                className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Number of Profiles
              </label>
              <input
                id="count"
                type="number"
                min="1"
                max="10"
                value={count}
                onChange={(e) => setCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                className="input-field"
              />
              <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Generate up to 10 profiles at once
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? <LoadingSpinner size="small" /> : "Generate"}
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
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Generated Information
            </h3>
            <button
              onClick={copyAllToClipboard}
              className="btn-secondary text-sm flex items-center gap-1"
              title="Copy all to clipboard"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy All
            </button>
          </div>

          {result.map((person, index) => (
            <div
              key={`profile-${index}`}
              className={`
                rounded-lg border
                ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                overflow-hidden
              `}
            >
              <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex justify-between items-center">
                  <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Profile {index + 1}: {person.name}
                  </h3>
                  <button
                    onClick={() => {
                      const formattedPerson = `
Name: ${person.name}
Email: ${person.email}
Phone: ${person.phone}
Address: ${person.address}
Birth Date: ${person.birth_date}
Job: ${person.job}
Company: ${person.company}
Username: ${person.username}
Website: ${person.website}
SSN: ${person.ssn}
Credit Card: ${person.credit_card}
IP Address: ${person.ip_address}
                      `.trim();
                      navigator.clipboard.writeText(formattedPerson);
                    }}
                    className="text-xs px-2 py-1 rounded hover:bg-gray-600/20"
                    title="Copy profile to clipboard"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="Name" value={person.name} isDark={isDark} />
                  <InfoItem label="Email" value={person.email} isDark={isDark} />
                  <InfoItem label="Phone" value={person.phone} isDark={isDark} />
                  <InfoItem label="Address" value={person.address} isDark={isDark} />
                  <InfoItem label="Birth Date" value={person.birth_date} isDark={isDark} />
                  <InfoItem label="Job" value={person.job} isDark={isDark} />
                  <InfoItem label="Company" value={person.company} isDark={isDark} />
                  <InfoItem label="Username" value={person.username} isDark={isDark} />
                  <InfoItem label="Website" value={person.website} isDark={isDark} />
                  <InfoItem label="SSN" value={person.ssn} isDark={isDark} />
                  <InfoItem label="Credit Card" value={person.credit_card} isDark={isDark} />
                  <InfoItem label="IP Address" value={person.ip_address} isDark={isDark} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface InfoItemProps {
  label: string;
  value: string;
  isDark: boolean;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, isDark }) => {
  return (
    <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
      <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {label}
      </div>
      <div className={`text-sm break-all ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
        {value}
      </div>
    </div>
  );
};

export default FakeInfoGenerator;