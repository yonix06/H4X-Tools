import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingSpinner from '../LoadingSpinner';

interface SnortAlert {
  message: string;
  classification: string;
  priority: string;
  protocol: string;
  src_ip: string;
  src_port: string;
  dst_ip: string;
  dst_port: string;
  timestamp: string;
}

interface SnortResults {
  status: string;
  alerts: SnortAlert[];
  stats: {
    packets_received: number;
    packets_analyzed: number;
    packets_dropped: number;
    alert_count: number;
    version?: string;
  };
  errors: string[];
  timestamp: string;
  duration?: number;
}

const SnortIDS: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [interface_, setInterface] = useState<string>('');
  const [duration, setDuration] = useState<number>(60);
  const [results, setResults] = useState<SnortResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interfaces, setInterfaces] = useState<string[]>([]);
  const [interfaceDetectionLoading, setInterfaceDetectionLoading] = useState(true);

  // Fetch available network interfaces on component mount
  useEffect(() => {
    const fetchInterfaces = async () => {
      try {
        const response = await fetch("/api/network/interfaces");
        const data = await response.json();
        
        if (data.status === "success" && Array.isArray(data.data)) {
          setInterfaces(data.data);
          if (data.data.length > 0) {
            setInterface(data.data[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch network interfaces:", err);
      } finally {
        setInterfaceDetectionLoading(false);
      }
    };

    fetchInterfaces();
  }, []);

  const handleStartMonitoring = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("/api/tools/snort-ids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          interface: interface_,
          duration: duration
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Error running Snort IDS");
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

  const renderAlertSeverity = (priority: string) => {
    const priorityNum = parseInt(priority);
    
    if (priorityNum >= 1 && priorityNum <= 3) {
      return (
        <span className="text-green-500 font-medium">Low</span>
      );
    } else if (priorityNum >= 4 && priorityNum <= 7) {
      return (
        <span className="text-yellow-500 font-medium">Medium</span>
      );
    } else if (priorityNum >= 8) {
      return (
        <span className="text-red-500 font-medium">High</span>
      );
    }
    
    return (
      <span className="text-gray-500">Unknown</span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className={`
        p-4 rounded-lg border 
        ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Snort Intrusion Detection System
        </h2>
        <p className={`mb-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Monitor network traffic for suspicious activity and potential intrusions using Snort IDS.
        </p>

        <form onSubmit={handleStartMonitoring} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label 
                htmlFor="interface" 
                className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Network Interface
              </label>
              
              {interfaceDetectionLoading ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="small" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Detecting interfaces...
                  </span>
                </div>
              ) : (
                <div>
                  <select
                    id="interface"
                    value={interface_}
                    onChange={(e) => setInterface(e.target.value)}
                    className="input-field"
                  >
                    {interfaces.length > 0 ? 
                      interfaces.map(iface => (
                        <option key={iface} value={iface}>{iface}</option>
                      ))
                      : <option value="">No interfaces detected</option>
                    }
                  </select>
                  {interfaces.length === 0 && (
                    <input
                      type="text"
                      value={interface_}
                      onChange={(e) => setInterface(e.target.value)}
                      placeholder="Enter interface manually (e.g. eth0)"
                      className="mt-2 input-field"
                    />
                  )}
                </div>
              )}
              <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                The network interface to monitor. Common interfaces: eth0, wlan0.
              </p>
            </div>

            <div>
              <label 
                htmlFor="duration" 
                className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Monitoring Duration (seconds)
              </label>
              <input
                id="duration"
                type="number"
                min="10"
                max="300"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                className="input-field"
              />
              <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Duration in seconds (10-300). Longer durations may capture more events but take more time.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !interface_}
              className="btn-primary"
            >
              {isLoading ? <LoadingSpinner size="small" /> : "Start Monitoring"}
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
          <div className={`
            rounded-lg border
            ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
            overflow-hidden
          `}>
            <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Monitoring Summary
              </h3>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Duration: {results.duration ? Math.round(results.duration) : 'N/A'} seconds
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard
                  title="Packets Received"
                  value={results.stats.packets_received.toLocaleString()}
                  isDark={isDark}
                />
                <StatsCard
                  title="Packets Analyzed"
                  value={results.stats.packets_analyzed.toLocaleString()}
                  isDark={isDark}
                />
                <StatsCard
                  title="Packets Dropped"
                  value={results.stats.packets_dropped.toLocaleString()}
                  isDark={isDark}
                />
                <StatsCard
                  title="Alerts Detected"
                  value={results.alerts.length.toLocaleString()}
                  isDark={isDark}
                  highlight={results.alerts.length > 0}
                />
              </div>
              
              {results.stats.version && (
                <div className={`text-xs text-right ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Snort version: {results.stats.version}
                </div>
              )}
            </div>
          </div>

          {results.alerts.length > 0 ? (
            <div className={`
              rounded-lg border
              ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
              overflow-hidden
            `}>
              <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Detected Alerts ({results.alerts.length})
                </h3>
              </div>
              
              <div className="p-0">
                <div className="overflow-x-auto">
                  <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">Alert</th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">Source</th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">Destination</th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">Severity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">Time</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {results.alerts.map((alert, index) => (
                        <tr key={index} className={isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}>
                          <td className="px-4 py-4">
                            <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {alert.message}
                            </div>
                            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {alert.classification}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {alert.src_ip}
                              {alert.src_port && `:${alert.src_port}`}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {alert.dst_ip}
                              {alert.dst_port && `:${alert.dst_port}`}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {renderAlertSeverity(alert.priority)}
                          </td>
                          <td className="px-4 py-4">
                            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {alert.timestamp}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className={`
              p-4 rounded-lg text-center
              ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}
            `}>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                No alerts detected during the monitoring period.
              </p>
            </div>
          )}

          {results.errors.length > 0 && (
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

interface StatsCardProps {
  title: string;
  value: string;
  isDark: boolean;
  highlight?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, isDark, highlight = false }) => {
  return (
    <div className={`
      p-4 rounded-lg
      ${isDark 
        ? highlight ? 'bg-blue-900/20 border border-blue-800/50' : 'bg-gray-700/50' 
        : highlight ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'
      }
    `}>
      <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {title}
      </div>
      <div className={`text-2xl font-semibold ${
        isDark 
          ? highlight ? 'text-blue-300' : 'text-white' 
          : highlight ? 'text-blue-700' : 'text-gray-900'
      }`}>
        {value}
      </div>
    </div>
  );
};

export default SnortIDS;
