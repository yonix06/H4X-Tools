import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingSpinner from '../LoadingSpinner';

interface VulnScanResult {
  status: string;
  target: string;
  start_time: string;
  end_time: string;
  scan_type: string;
  vulnerabilities: Vulnerability[];
  open_ports: PortInfo[];
  services: ServiceInfo[];
  os_info: OSInfo | null;
  scan_stats: ScanStats;
  errors: string[];
}

interface Vulnerability {
  id: string;
  name: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  description: string;
  affected_component: string;
  cve_id?: string;
  cvss_score?: number;
  references?: string[];
  solution?: string;
}

interface PortInfo {
  port: number;
  protocol: string;
  state: string;
  service: string;
  version?: string;
}

interface ServiceInfo {
  name: string;
  version?: string;
  product?: string;
  cpe?: string;
  extra_info?: string;
}

interface OSInfo {
  name: string;
  version?: string;
  type?: string;
  cpe?: string;
  confidence?: number;
}

interface ScanStats {
  total_hosts: number;
  total_ports: number;
  open_ports: number;
  filtered_ports: number;
  closed_ports: number;
  duration: number;
  start_time: string;
  end_time: string;
}

const VulnScanner: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [target, setTarget] = useState<string>('');
  const [scanType, setScanType] = useState<string>('vuln');
  const [intensity, setIntensity] = useState<string>('normal');
  const [results, setResults] = useState<VulnScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!target) {
      setError("Please enter a target IP or hostname");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("/api/tools/vuln-scanner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target,
          scan_type: scanType,
          intensity
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Error running vulnerability scan");
      }

      if (data.status === "error") {
        throw new Error(data.message || data.data?.errors?.[0] || "Unknown error occurred");
      }

      setResults(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return isDark ? 'text-red-400' : 'text-red-600';
      case 'High':
        return isDark ? 'text-orange-400' : 'text-orange-600';
      case 'Medium':
        return isDark ? 'text-yellow-400' : 'text-yellow-600';
      case 'Low':
        return isDark ? 'text-blue-400' : 'text-blue-600';
      case 'Info':
        return isDark ? 'text-gray-400' : 'text-gray-600';
      default:
        return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800';
      case 'High':
        return isDark ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-800';
      case 'Medium':
        return isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800';
      case 'Info':
        return isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-800';
      default:
        return isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className={`
        p-4 rounded-lg border 
        ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Vulnerability Scanner
        </h2>
        <p className={`mb-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Scan for security vulnerabilities and open ports on network hosts.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="target" 
              className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Target
            </label>
            <input
              id="target"
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="IP address or hostname (e.g. 192.168.1.1 or example.com)"
              className="input-field"
            />
            <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Single IP, hostname, or CIDR notation (e.g., 192.168.1.0/24)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label 
                htmlFor="scanType" 
                className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Scan Type
              </label>
              <select
                id="scanType"
                value={scanType}
                onChange={(e) => setScanType(e.target.value)}
                className="input-field"
              >
                <option value="vuln">Vulnerability Scan</option>
                <option value="port">Port Scan</option>
                <option value="service">Service Detection</option>
                <option value="os">OS Detection</option>
                <option value="full">Full Scan (Comprehensive)</option>
              </select>
              <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Type of scan to perform
              </p>
            </div>

            <div>
              <label 
                htmlFor="intensity" 
                className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Scan Intensity
              </label>
              <select
                id="intensity"
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                className="input-field"
              >
                <option value="light">Light (Fast but less thorough)</option>
                <option value="normal">Normal (Balanced)</option>
                <option value="aggressive">Aggressive (Thorough but slow)</option>
              </select>
              <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Determines scan speed and thoroughness
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !target.trim()}
              className="btn-primary"
            >
              {isLoading ? (
                <LoadingSpinner size="small" />
              ) : (
                "Start Scan"
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/50' : 'bg-red-100'}`}>
          <p className={`text-sm ${isDark ? 'text-red-200' : 'text-red-800'}`}>{error}</p>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className={`
            rounded-lg border
            ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
            overflow-hidden
          `}>
            <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Scan Summary
              </h3>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {new Date(results.start_time).toLocaleString()} - {new Date(results.end_time).toLocaleString()}
                {results.scan_stats && ` (${Math.round(results.scan_stats.duration)} seconds)`}
              </div>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`
                  p-4 rounded-lg
                  ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}
                `}>
                  <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Target
                  </div>
                  <div className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {results.target}
                  </div>
                </div>
                
                <div className={`
                  p-4 rounded-lg
                  ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}
                `}>
                  <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Scan Type
                  </div>
                  <div className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {results.scan_type.charAt(0).toUpperCase() + results.scan_type.slice(1)}
                  </div>
                </div>
                
                <div className={`
                  p-4 rounded-lg
                  ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}
                `}>
                  <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Vulnerabilities
                  </div>
                  <div className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {results.vulnerabilities.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vulnerabilities */}
          {results.vulnerabilities.length > 0 ? (
            <div className={`
              rounded-lg border
              ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
              overflow-hidden
            `}>
              <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Vulnerabilities ({results.vulnerabilities.length})
                </h3>
              </div>
              
              <div className="p-0">
                <div className="divide-y divide-gray-700">
                  {results.vulnerabilities.map((vuln, index) => (
                    <div key={vuln.id} className={`p-4 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                        <div>
                          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {vuln.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`
                              inline-flex text-xs px-2 py-0.5 rounded-full
                              ${getSeverityBgColor(vuln.severity)}
                            `}>
                              {vuln.severity}
                            </span>
                            {vuln.cve_id && (
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {vuln.cve_id}
                              </span>
                            )}
                            {vuln.cvss_score && (
                              <span className={`text-xs font-medium ${getSeverityColor(vuln.severity)}`}>
                                CVSS: {vuln.cvss_score.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2 md:mt-0`}>
                          Affects: {vuln.affected_component}
                        </div>
                      </div>
                      
                      <div className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {vuln.description}
                      </div>
                      
                      {vuln.solution && (
                        <div className="mt-3">
                          <h5 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Solution:
                          </h5>
                          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {vuln.solution}
                          </p>
                        </div>
                      )}
                      
                      {vuln.references && vuln.references.length > 0 && (
                        <div className="mt-3">
                          <h5 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            References:
                          </h5>
                          <ul className={`text-xs mt-1 space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {vuln.references.map((ref, i) => (
                              <li key={i}>
                                <a 
                                  href={ref} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className={`text-blue-500 hover:underline`}
                                >
                                  {ref}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className={`
              p-4 rounded-lg text-center
              ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}
            `}>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                No vulnerabilities were detected during the scan.
              </p>
            </div>
          )}

          {/* Open Ports */}
          {results.open_ports && results.open_ports.length > 0 && (
            <div className={`
              rounded-lg border
              ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
              overflow-hidden
            `}>
              <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Open Ports & Services ({results.open_ports.length})
                </h3>
              </div>
              
              <div className="p-0">
                <div className="overflow-x-auto">
                  <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">Port</th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">Protocol</th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">State</th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">Service</th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">Version</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {results.open_ports.map((port, index) => (
                        <tr key={index} className={isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}>
                          <td className="px-4 py-4">
                            <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {port.port}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {port.protocol.toUpperCase()}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {port.state}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {port.service}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {port.version || '-'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* OS Detection */}
          {results.os_info && (
            <div className={`
              rounded-lg border
              ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
              overflow-hidden
            `}>
              <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Operating System Detection
                </h3>
              </div>
              
              <div className="p-4">
                <div className={`
                  p-4 rounded-lg
                  ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}
                `}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Name
                      </div>
                      <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {results.os_info.name}
                      </div>
                    </div>
                    
                    <div>
                      <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Version
                      </div>
                      <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {results.os_info.version || '-'}
                      </div>
                    </div>
                    
                    <div>
                      <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Type
                      </div>
                      <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {results.os_info.type || '-'}
                      </div>
                    </div>
                    
                    <div>
                      <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Confidence
                      </div>
                      <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {results.os_info.confidence ? `${results.os_info.confidence}%` : '-'}
                      </div>
                    </div>
                  </div>
                  
                  {results.os_info.cpe && (
                    <div className="mt-3">
                      <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        CPE
                      </div>
                      <div className={`text-sm font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {results.os_info.cpe}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Errors & Warnings */}
          {results.errors && results.errors.length > 0 && (
            <div className={`
              rounded-lg border
              ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
              overflow-hidden
            `}>
              <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700 bg-red-900/30' : 'border-gray-200 bg-red-50'}`}>
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-red-800'}`}>
                  Errors & Warnings
                </h3>
              </div>
              
              <div className="p-4">
                <ul className="space-y-2">
                  {results.errors.map((error, index) => (
                    <li key={index} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VulnScanner;