import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingSpinner from '../LoadingSpinner';

interface PortScanResult {
  target: string;
  open_ports: number[];
  closed_ports: number[];
  scan_time: string;
  error?: string;
}

const PortScanner: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [target, setTarget] = useState('');
  const [portRange, setPortRange] = useState('1-1000');
  const [scanSpeed, setScanSpeed] = useState<'normal' | 'fast' | 'thorough'>('normal');
  const [result, setResult] = useState<PortScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/tools/port-scanner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          target,
          port_range: portRange,
          scan_speed: scanSpeed
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Error scanning ports");
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

  const isValidPortRange = (range: string): boolean => {
    const regex = /^(\d+)(?:-(\d+))?(?:,(\d+)(?:-(\d+))?)*$/;
    return regex.test(range);
  };

  return (
    <div className="p-6 space-y-6">
      <div className={`
        p-4 rounded-lg border 
        ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Port Scanner
        </h2>
        <p className={`mb-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Scan for open ports on a target IP address or domain. This tool helps identify open services and potential security vulnerabilities.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="target" 
              className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Target IP/Domain
            </label>
            <input
              id="target"
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g., 192.168.1.1 or example.com"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label 
                htmlFor="portRange" 
                className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Port Range
              </label>
              <input
                id="portRange"
                type="text"
                value={portRange}
                onChange={(e) => setPortRange(e.target.value)}
                placeholder="e.g., 1-1000 or 80,443,3306"
                className={`input-field ${!isValidPortRange(portRange) ? 'border-red-500' : ''}`}
              />
              <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Specify range (e.g., 1-1000) or comma-separated list (e.g., 80,443,8080)
              </p>
              {!isValidPortRange(portRange) && (
                <p className="mt-1 text-xs text-red-500">
                  Invalid port range format
                </p>
              )}
            </div>

            <div>
              <label 
                htmlFor="scanSpeed" 
                className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Scan Speed
              </label>
              <select
                id="scanSpeed"
                value={scanSpeed}
                onChange={(e) => setScanSpeed(e.target.value as 'normal' | 'fast' | 'thorough')}
                className="input-field"
              >
                <option value="fast">Fast (less accurate)</option>
                <option value="normal">Normal</option>
                <option value="thorough">Thorough (slower)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !target.trim() || !isValidPortRange(portRange)}
              className="btn-primary"
            >
              {isLoading ? <LoadingSpinner size="small" /> : "Scan Ports"}
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
              Scan Results for {result.target}
            </h3>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Scan completed in {result.scan_time}
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Open Ports ({result.open_ports.length})
              </h4>
              {result.open_ports.length > 0 ? (
                <div className={`
                  grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2
                `}>
                  {result.open_ports.map(port => (
                    <div 
                      key={`open-${port}`}
                      className={`
                        p-2 rounded text-center text-sm
                        ${isDark ? 'bg-green-900/50 text-green-200' : 'bg-green-100 text-green-800'}
                      `}
                    >
                      {port}
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No open ports found
                </p>
              )}
            </div>

            <div>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Common Services on Open Ports
              </h4>
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-4 py-2 text-left text-xs font-medium ${isDark ? 'text-gray-300 uppercase tracking-wider' : 'text-gray-500 uppercase tracking-wider'}`}>
                        Port
                      </th>
                      <th className={`px-4 py-2 text-left text-xs font-medium ${isDark ? 'text-gray-300 uppercase tracking-wider' : 'text-gray-500 uppercase tracking-wider'}`}>
                        Service
                      </th>
                      <th className={`px-4 py-2 text-left text-xs font-medium ${isDark ? 'text-gray-300 uppercase tracking-wider' : 'text-gray-500 uppercase tracking-wider'}`}>
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {result.open_ports.slice(0, 10).map((port) => {
                      const service = getCommonService(port);
                      return (
                        <tr key={`service-${port}`}>
                          <td className={`px-4 py-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                            {port}
                          </td>
                          <td className={`px-4 py-2 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                            {service.name}
                          </td>
                          <td className={`px-4 py-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {service.description}
                          </td>
                        </tr>
                      );
                    })}
                    {result.open_ports.length > 10 && (
                      <tr>
                        <td 
                          colSpan={3} 
                          className={`px-4 py-2 text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                          {result.open_ports.length - 10} more ports not shown
                        </td>
                      </tr>
                    )}
                    {result.open_ports.length === 0 && (
                      <tr>
                        <td 
                          colSpan={3} 
                          className={`px-4 py-2 text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                          No open ports found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Security Recommendations
              </h4>
              <ul className={`list-disc pl-5 space-y-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {result.open_ports.length > 0 ? (
                  <>
                    <li>Consider closing unnecessary ports to reduce attack surface</li>
                    <li>Ensure all services are up-to-date and patched</li>
                    <li>Configure firewall rules to restrict access to critical services</li>
                    <li>Use strong authentication for all exposed services</li>
                    <li>Monitor logs for suspicious activities on these ports</li>
                  </>
                ) : (
                  <li>No exposed services found. Continue monitoring for changes.</li>
                )}
              </ul>
            </div>
            
            <div className="pt-4 border-t border-gray-700">
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Note: This is a simplified port scan. For more detailed scans or vulnerability assessments,
                professional security tools are recommended. Always scan only systems you have permission to test.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get common service information for ports
function getCommonService(port: number): { name: string; description: string } {
  const commonPorts: Record<number, { name: string; description: string }> = {
    20: { name: 'FTP-data', description: 'File Transfer Protocol (data)' },
    21: { name: 'FTP', description: 'File Transfer Protocol (control)' },
    22: { name: 'SSH', description: 'Secure Shell' },
    23: { name: 'Telnet', description: 'Telnet protocol - unencrypted text communications' },
    25: { name: 'SMTP', description: 'Simple Mail Transfer Protocol' },
    53: { name: 'DNS', description: 'Domain Name System' },
    80: { name: 'HTTP', description: 'Hypertext Transfer Protocol' },
    110: { name: 'POP3', description: 'Post Office Protocol v3' },
    115: { name: 'SFTP', description: 'Secure File Transfer Protocol' },
    135: { name: 'RPC', description: 'Remote Procedure Call' },
    139: { name: 'NetBIOS', description: 'NetBIOS Session Service' },
    143: { name: 'IMAP', description: 'Internet Message Access Protocol' },
    443: { name: 'HTTPS', description: 'HTTP over TLS/SSL' },
    445: { name: 'SMB', description: 'Server Message Block' },
    1433: { name: 'MSSQL', description: 'Microsoft SQL Server' },
    1521: { name: 'Oracle', description: 'Oracle Database' },
    3306: { name: 'MySQL', description: 'MySQL Database' },
    3389: { name: 'RDP', description: 'Remote Desktop Protocol' },
    5432: { name: 'PostgreSQL', description: 'PostgreSQL Database' },
    5900: { name: 'VNC', description: 'Virtual Network Computing' },
    8080: { name: 'HTTP Alt', description: 'Alternative HTTP port' },
    8443: { name: 'HTTPS Alt', description: 'Alternative HTTPS port' },
  };

  return commonPorts[port] || { name: 'Unknown', description: 'Unknown service' };
}

export default PortScanner;