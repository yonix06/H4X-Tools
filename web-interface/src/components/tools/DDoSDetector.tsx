import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingSpinner from '../LoadingSpinner';

interface DDoSAttackInfo {
  attack_type: string;
  source_ips: SourceIP[];
  target_ip: string;
  target_port: number;
  protocol: string;
  packet_rate: number;
  bandwidth: string;
  start_time: string;
  duration: number;
  is_ongoing: boolean;
  attack_signature?: string;
  mitigation_status: 'none' | 'in_progress' | 'mitigated';
}

interface SourceIP {
  ip: string;
  country?: string;
  packet_count: number;
  is_spoofed: boolean;
}

interface NetworkInterface {
  name: string;
  ip: string;
  is_monitored: boolean;
}

interface DDoSDetectorState {
  is_running: boolean;
  monitored_interfaces: NetworkInterface[];
  detection_threshold: number;
  detected_attacks: DDoSAttackInfo[];
  alerts: string[];
  stats: {
    total_packets: number;
    total_bandwidth: string;
    monitoring_since: string;
  };
}

const DDoSDetector: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detectorData, setDetectorData] = useState<DDoSDetectorState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedInterface, setSelectedInterface] = useState<string>('');
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
  const [threshold, setThreshold] = useState<number>(1000);
  const [refreshInterval, setRefreshInterval] = useState<number>(5);

  // Fetch available network interfaces
  useEffect(() => {
    const fetchInterfaces = async () => {
      try {
        const response = await fetch("/api/tools/network-interfaces");
        const data = await response.json();
        
        if (data.status === "success") {
          setInterfaces(data.data);
          if (data.data.length > 0) {
            setSelectedInterface(data.data[0].name);
          }
        } else {
          setError("Failed to fetch network interfaces");
        }
      } catch (err) {
        setError("Error fetching network interfaces");
      }
    };
    
    fetchInterfaces();
  }, []);

  // Start the DDoS detector
  const startDetector = async () => {
    if (!selectedInterface) {
      setError("Please select a network interface");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/tools/ddos-detector/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interface: selectedInterface,
          threshold: threshold,
          refresh_interval: refreshInterval
        }),
      });
      
      const data = await response.json();
      
      if (data.status === "success") {
        setIsStarted(true);
        fetchStatus();
      } else {
        setError(data.message || "Failed to start DDoS detector");
      }
    } catch (err) {
      setError("Error starting DDoS detector");
    } finally {
      setIsLoading(false);
    }
  };

  // Stop the DDoS detector
  const stopDetector = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/tools/ddos-detector/stop", {
        method: "POST",
      });
      
      const data = await response.json();
      
      if (data.status === "success") {
        setIsStarted(false);
      } else {
        setError(data.message || "Failed to stop DDoS detector");
      }
    } catch (err) {
      setError("Error stopping DDoS detector");
    } finally {
      setIsLoading(false);
    }
  };

  // Get detector status
  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/tools/ddos-detector/status");
      const data = await response.json();
      
      if (data.status === "success") {
        setDetectorData(data.data);
        setIsStarted(data.data.is_running);
      } else {
        setError(data.message || "Failed to fetch detector status");
      }
    } catch (err) {
      setError("Error fetching detector status");
    }
  };

  // Refresh status periodically if detector is running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isStarted) {
      interval = setInterval(() => {
        fetchStatus();
      }, refreshInterval * 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStarted, refreshInterval]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getMitigationStatusBadge = (status: 'none' | 'in_progress' | 'mitigated') => {
    switch (status) {
      case 'none':
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'}`}>
            Not Mitigated
          </span>
        );
      case 'in_progress':
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`}>
            Mitigation In Progress
          </span>
        );
      case 'mitigated':
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'}`}>
            Mitigated
          </span>
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
          DDoS Attack Detector
        </h2>
        <p className={`mb-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Monitors network traffic to detect and analyze potential DDoS attacks in real-time.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label 
                htmlFor="interface" 
                className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Network Interface
              </label>
              <select
                id="interface"
                value={selectedInterface}
                onChange={(e) => setSelectedInterface(e.target.value)}
                disabled={isStarted || isLoading}
                className="input-field"
              >
                <option value="">Select Interface</option>
                {interfaces.map((iface) => (
                  <option key={iface.name} value={iface.name}>
                    {iface.name} ({iface.ip})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label 
                htmlFor="threshold" 
                className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Packet Threshold (packets/sec)
              </label>
              <input
                id="threshold"
                type="number"
                min="100"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value) || 1000)}
                disabled={isStarted || isLoading}
                className="input-field"
              />
            </div>

            <div>
              <label 
                htmlFor="refreshInterval" 
                className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Refresh Interval (seconds)
              </label>
              <input
                id="refreshInterval"
                type="number"
                min="1"
                max="60"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value) || 5)}
                disabled={isStarted || isLoading}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex justify-end">
            {!isStarted ? (
              <button
                onClick={startDetector}
                disabled={isLoading || !selectedInterface}
                className="btn-primary"
              >
                {isLoading ? <LoadingSpinner size="small" /> : "Start Monitoring"}
              </button>
            ) : (
              <button
                onClick={stopDetector}
                disabled={isLoading}
                className="btn-secondary bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? <LoadingSpinner size="small" /> : "Stop Monitoring"}
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/50' : 'bg-red-100'}`}>
          <p className={`text-sm ${isDark ? 'text-red-200' : 'text-red-800'}`}>{error}</p>
        </div>
      )}

      {isStarted && detectorData && (
        <div className="space-y-6">
          {/* Status Card */}
          <div className={`
            rounded-lg border
            ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
            overflow-hidden
          `}>
            <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Monitoring Status
              </h3>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`
                  p-4 rounded-lg
                  ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}
                `}>
                  <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Status
                  </div>
                  <div className={`flex items-center space-x-2`}>
                    <div className={`h-3 w-3 rounded-full ${detectorData.is_running ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {detectorData.is_running ? 'Monitoring Active' : 'Not Running'}
                    </div>
                  </div>
                </div>
                
                <div className={`
                  p-4 rounded-lg
                  ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}
                `}>
                  <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Total Traffic
                  </div>
                  <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {detectorData.stats.total_packets.toLocaleString()} packets
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {detectorData.stats.total_bandwidth}
                    </div>
                  </div>
                </div>
                
                <div className={`
                  p-4 rounded-lg
                  ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}
                `}>
                  <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Monitoring Since
                  </div>
                  <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(detectorData.stats.monitoring_since)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attacks */}
          {detectorData.detected_attacks.length > 0 ? (
            <div className={`
              rounded-lg border
              ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
              overflow-hidden
            `}>
              <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700 bg-red-900/30' : 'border-gray-200 bg-red-50'}`}>
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-red-800'}`}>
                  Detected Attacks ({detectorData.detected_attacks.length})
                </h3>
              </div>
              
              <div className="divide-y divide-gray-700">
                {detectorData.detected_attacks.map((attack, index) => (
                  <div key={index} className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {attack.attack_type} Attack
                        </h4>
                        <div className="flex items-center mt-1 space-x-2">
                          {attack.is_ongoing ? (
                            <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'} animate-pulse`}>
                              Ongoing
                            </span>
                          ) : (
                            <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                              Stopped
                            </span>
                          )}
                          {getMitigationStatusBadge(attack.mitigation_status)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Started: {formatDate(attack.start_time)}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Duration: {attack.duration} seconds
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`
                        p-3 rounded-lg
                        ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}
                      `}>
                        <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Target
                        </div>
                        <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {attack.target_ip}:{attack.target_port}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Protocol: {attack.protocol.toUpperCase()}
                        </div>
                      </div>
                      
                      <div className={`
                        p-3 rounded-lg
                        ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}
                      `}>
                        <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Traffic Rate
                        </div>
                        <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {attack.packet_rate.toLocaleString()} packets/sec
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Bandwidth: {attack.bandwidth}
                        </div>
                      </div>
                      
                      <div className={`
                        p-3 rounded-lg
                        ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}
                      `}>
                        <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Source IPs
                        </div>
                        <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {attack.source_ips.length} unique sources
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {attack.source_ips.filter(ip => ip.is_spoofed).length} potentially spoofed
                        </div>
                      </div>
                    </div>
                    
                    {attack.source_ips.length > 0 && (
                      <div>
                        <h5 className={`text-sm font-medium mt-2 mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Top Sources
                        </h5>
                        <div className="overflow-x-auto">
                          <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium tracking-wider">IP Address</th>
                                <th className="px-3 py-2 text-left text-xs font-medium tracking-wider">Country</th>
                                <th className="px-3 py-2 text-left text-xs font-medium tracking-wider">Packets</th>
                                <th className="px-3 py-2 text-left text-xs font-medium tracking-wider">Spoofed</th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                              {attack.source_ips.slice(0, 5).map((source, idx) => (
                                <tr key={idx} className={isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}>
                                  <td className="px-3 py-2">
                                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                      {source.ip}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                      {source.country || 'Unknown'}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                      {source.packet_count.toLocaleString()}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                      {source.is_spoofed ? (
                                        <span className="text-red-500">Likely</span>
                                      ) : (
                                        <span className="text-green-500">No</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {attack.source_ips.length > 5 && (
                            <div className={`text-xs text-center py-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              Showing top 5 of {attack.source_ips.length} source IPs
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {attack.attack_signature && (
                      <div className="mt-2">
                        <h5 className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Attack Signature:
                        </h5>
                        <div className={`
                          p-3 rounded-lg text-sm font-mono
                          ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}
                        `}>
                          {attack.attack_signature}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={`
              p-4 rounded-lg text-center
              ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}
            `}>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                No DDoS attacks detected so far. Monitoring active...
              </p>
            </div>
          )}

          {/* Alerts */}
          {detectorData.alerts && detectorData.alerts.length > 0 && (
            <div className={`
              rounded-lg border
              ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
              overflow-hidden
            `}>
              <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700 bg-yellow-900/30' : 'border-gray-200 bg-yellow-50'}`}>
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-yellow-800'}`}>
                  Alerts & Notifications
                </h3>
              </div>
              
              <div className="p-0">
                <ul className="divide-y divide-gray-700">
                  {detectorData.alerts.map((alert, index) => (
                    <li key={index} className={`px-4 py-3 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {alert}
                      </div>
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

export default DDoSDetector;