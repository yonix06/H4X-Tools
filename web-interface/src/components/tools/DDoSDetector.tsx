import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingSpinner from '../LoadingSpinner';

interface DDosAlert {
  type: string;
  source_ip?: string;
  target_ip?: string;
  target_port?: string;
  packet_count?: number;
  connection_count?: number;
  syn_count?: number;
  timestamp: string;
  description: string;
}

interface PotentialAttacker {
  ip: string;
  total_packets: number;
  alert_count: number;
  attack_types: string[];
  confidence: 'High' | 'Medium' | 'Low';
}

interface TimeframeData {
  start_time: string;
  end_time: string;
  packet_count: number;
  unique_sources: number;
  top_sources: Record<string, number>;
  protocols: Record<string, number>;
  alerts: DDosAlert[];
}

interface TrafficStats {
  total_packets: number;
  total_alerts: number;
  unique_sources: string[];
  protocol_distribution: Record<string, number>;
  peak_traffic: {
    packets: number;
    window: string | null;
  };
  average_packets_per_window: number;
}

interface DDosResult {
  status: string;
  alerts: DDosAlert[];
  traffic_stats: TrafficStats;
  potential_attackers: PotentialAttacker[];
  timeframes: TimeframeData[];
  start_time: string;
  end_time: string | null;
  errors: string[];
  duration?: number;
}

const DDoSDetector: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [interface_, setInterface] = useState<string>('');
  const [threshold, setThreshold] = useState<number>(1000);
  const [window, setWindow] = useState<number>(60);
  const [duration, setDuration] = useState<number>(300);
  const [logFile, setLogFile] = useState<string>('');
  const [useLogFile, setUseLogFile] = useState<boolean>(false);
  const [results, setResults] = useState<DDosResult | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (useLogFile && !logFile) {
      setError("Please enter a log file path");
      return;
    }
    
    if (!useLogFile && !interface_) {
      setError("Please select a network interface");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("/api/tools/ddos-detector", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          useLogFile 
            ? { log_file: logFile }
            : { 
                interface: interface_,
                threshold: threshold,
                window: window,
                duration: duration
              }
        ),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Error running DDoS detector");
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

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High':
        return isDark ? 'text-red-400' : 'text-red-600';
      case 'Medium':
        return isDark ? 'text-yellow-400' : 'text-yellow-600';
      case 'Low':
        return isDark ? 'text-blue-400' : 'text-blue-600';
      default:
        return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className={`
        p-4 rounded-lg border 
        ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          DDoS Detector
        </h2>
        <p className={`mb-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Monitor network traffic for potential DDoS attacks and identify attackers.
        </p>

        <div className="mb-4">
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={!useLogFile}
                onChange={() => setUseLogFile(false)}
                className={`form-radio ${isDark ? 'bg-gray-700 border-gray-600' : ''}`}
              />
              <span className={`ml-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Live Monitoring
              </span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={useLogFile}
                onChange={() => setUseLogFile(true)}
                className={`form-radio ${isDark ? 'bg-gray-700 border-gray-600' : ''}`}
              />
              <span className={`ml-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Analyze Log File
              </span>
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {useLogFile ? (
            <div>
              <label 
                htmlFor="logFile" 
                className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Log File Path
              </label>
              <input
                id="logFile"
                type="text"
                value={logFile}
                onChange={(e) => setLogFile(e.target.value)}
                placeholder="/path/to/traffic.log"
                className="input-field"
              />
              <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Absolute path to a tcpdump log file to analyze
              </p>
            </div>
          ) : (
            <>
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
                    The network interface to monitor
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
                    min="60"
                    max="3600"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 300)}
                    className="input-field"
                  />
                  <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    How long to monitor (60-3600 seconds)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label 
                    htmlFor="threshold" 
                    className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Alert Threshold (packets)
                  </label>
                  <input
                    id="threshold"
                    type="number"
                    min="100"
                    max="10000"
                    step="100"
                    value={threshold}
                    onChange={(e) => setThreshold(parseInt(e.target.value) || 1000)}
                    className="input-field"
                  />
                  <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Packet count threshold to trigger alerts
                  </p>
                </div>

                <div>
                  <label 
                    htmlFor="window" 
                    className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Time Window (seconds)
                  </label>
                  <input
                    id="window"
                    type="number"
                    min="10"
                    max="300"
                    value={window}
                    onChange={(e) => setWindow(parseInt(e.target.value) || 60)}
                    className="input-field"
                  />
                  <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Time window for traffic analysis
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? (
                <LoadingSpinner size="small" />
              ) : useLogFile ? (
                "Analyze Log File"
              ) : (
                "Start Monitoring"
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
                Analysis Summary
              </h3>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {new Date(results.start_time).toLocaleString()} 
                {results.end_time && ` - ${new Date(results.end_time).toLocaleString()}`}
                {results.duration && ` (${Math.round(results.duration)} seconds)`}
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Packets"
                  value={results.traffic_stats.total_packets.toLocaleString()}
                  isDark={isDark}
                />
                <StatsCard
                  title="Total Alerts"
                  value={results.alerts.length.toLocaleString()}
                  isDark={isDark}
                  highlight={results.alerts.length > 0}
                />
                <StatsCard
                  title="Unique Sources"
                  value={results.traffic_stats.unique_sources.length.toLocaleString()}
                  isDark={isDark}
                />
                <StatsCard
                  title="Potential Attackers"
                  value={results.potential_attackers.length.toLocaleString()}
                  isDark={isDark}
                  highlight={results.potential_attackers.length > 0}
                />
              </div>
            </div>
          </div>

          {/* Protocol Distribution */}
          {Object.keys(results.traffic_stats.protocol_distribution).length > 0 && (
            <div className={`
              rounded-lg border
              ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
              overflow-hidden
            `}>
              <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Protocol Distribution
                </h3>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(results.traffic_stats.protocol_distribution).map(([protocol, count]) => (
                    <div key={protocol} className={`
                      p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}
                    `}>
                      <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {protocol}
                      </div>
                      <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {count.toLocaleString()} packets
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Potential Attackers */}
          {results.potential_attackers.length > 0 ? (
            <div className={`
              rounded-lg border
              ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
              overflow-hidden
            `}>
              <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Potential Attackers ({results.potential_attackers.length})
                </h3>
              </div>
              
              <div className="p-0">
                <div className="overflow-x-auto">
                  <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">IP Address</th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">Total Packets</th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">Alerts</th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">Attack Types</th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {results.potential_attackers.map((attacker, index) => (
                        <tr key={index} className={isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}>
                          <td className="px-4 py-4">
                            <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {attacker.ip}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {attacker.total_packets.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {attacker.alert_count}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              {attacker.attack_types.length > 0 ? attacker.attack_types.map((type, i) => (
                                <span key={i} className={`
                                  inline-flex text-xs px-2 py-0.5 rounded-full mr-1
                                  ${isDark 
                                    ? 'bg-red-900/30 text-red-300' 
                                    : 'bg-red-100 text-red-800'
                                  }
                                `}>
                                  {type.replace(/_/g, ' ')}
                                </span>
                              )) : (
                                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  High volume only
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`font-medium ${getConfidenceColor(attacker.confidence)}`}>
                              {attacker.confidence}
                            </span>
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
                No potential attackers identified during the analysis.
              </p>
            </div>
          )}

          {/* Alert Timeline */}
          {results.alerts.length > 0 && (
            <div className={`
              rounded-lg border
              ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
              overflow-hidden
            `}>
              <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Alert Timeline ({results.alerts.length})
                </h3>
              </div>
              
              <div className="p-0">
                <div className="overflow-x-auto">
                  <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">Source</th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">Target</th>
                        <th className="px-4 py-3 text-left text-xs font-medium tracking-wider">Details</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {results.alerts.map((alert, index) => (
                        <tr key={index} className={isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}>
                          <td className="px-4 py-4">
                            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`
                              inline-flex text-xs px-2 py-0.5 rounded-full
                              ${isDark 
                                ? 'bg-red-900/30 text-red-300' 
                                : 'bg-red-100 text-red-800'
                              }
                            `}>
                              {alert.type.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {alert.source_ip || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {alert.target_ip ? (
                                <>
                                  {alert.target_ip}
                                  {alert.target_port && `:${alert.target_port}`}
                                </>
                              ) : '-'}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {alert.description}
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

          {/* Errors & Warnings */}
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

export default DDoSDetector;