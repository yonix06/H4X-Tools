import React, { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import LoadingSpinner from "../components/LoadingSpinner";

interface SecurityEvent {
  id: number;
  type: string;
  severity: string;
  message: string;
  timestamp: string;
  source: string;
  status: string;
}

const SecurityDashboard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [fail2banStatus, setFail2banStatus] = useState<any>(null);
  const [vpnStatus, setVpnStatus] = useState<any>(null);
  const [bannedIPs, setBannedIPs] = useState<string[]>([]);

  const fetchSecurityData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [eventsRes, fail2banRes, vpnRes, bannedIPsRes] = await Promise.all([
        fetch("/api/security/events"),
        fetch("/api/security/fail2ban"),
        fetch("/api/security/vpn"),
        fetch("/api/security/banned-ips")
      ]);

      const [eventsData, fail2banData, vpnData, bannedIPsData] = await Promise.all([
        eventsRes.json(),
        fail2banRes.json(),
        vpnRes.json(),
        bannedIPsRes.json()
      ]);

      if (eventsData.status === "success") {
        setEvents(eventsData.data);
      }
      if (fail2banData.status === "success") {
        setFail2banStatus(fail2banData.data);
      }
      if (vpnData.status === "success") {
        setVpnStatus(vpnData.data);
      }
      if (bannedIPsData.status === "success") {
        setBannedIPs(bannedIPsData.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch security data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUnbanIP = async (ip: string) => {
    try {
      const response = await fetch("/api/security/unban-ip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ip })
      });

      const data = await response.json();
      if (data.status === "success") {
        setBannedIPs(bannedIPs.filter(bannedIP => bannedIP !== ip));
      } else {
        throw new Error(data.message || "Failed to unban IP");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return isDark ? "bg-red-900/50 text-red-200" : "bg-red-100 text-red-800";
      case "medium":
        return isDark ? "bg-yellow-900/50 text-yellow-200" : "bg-yellow-100 text-yellow-800";
      case "low":
        return isDark ? "bg-green-900/50 text-green-200" : "bg-green-100 text-green-800";
      default:
        return isDark ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return isDark ? "bg-red-900/50 text-red-200" : "bg-red-100 text-red-800";
      case "resolved":
        return isDark ? "bg-green-900/50 text-green-200" : "bg-green-100 text-green-800";
      case "investigating":
        return isDark ? "bg-yellow-900/50 text-yellow-200" : "bg-yellow-100 text-yellow-800";
      default:
        return isDark ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={`flex-1 h-full overflow-hidden ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
          <div className="max-w-7xl mx-auto">
            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Security Dashboard
            </h1>
            <p className={`mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Security overview and alerts
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="large" />
              </div>
            ) : error ? (
              <div className={`p-4 rounded-lg ${isDark ? "bg-red-900/50" : "bg-red-100"}`}>
                <p className={`text-sm ${isDark ? "text-red-200" : "text-red-800"}`}>{error}</p>
              </div>
            ) : (
              <>
                {/* Status Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Fail2ban Status */}
                  <div className={`
                    p-6 rounded-xl shadow-lg border
                    ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}
                  `}>
                    <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                      Fail2ban Status
                    </h3>
                    {fail2banStatus && (
                      <div className="space-y-2">
                        <div className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                          <span>Total Jails: </span>
                          <span className={isDark ? "text-white" : "text-gray-900"}>
                            {fail2banStatus.total_jails}
                          </span>
                        </div>
                        <div className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                          <span>Active Bans: </span>
                          <span className={isDark ? "text-white" : "text-gray-900"}>
                            {fail2banStatus.active_bans}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* VPN Status */}
                  <div className={`
                    p-6 rounded-xl shadow-lg border
                    ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}
                  `}>
                    <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                      VPN Status
                    </h3>
                    {vpnStatus && (
                      <div className="space-y-2">
                        <div className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                          <span>Status: </span>
                          <span className={`
                            px-2 py-1 rounded-full text-xs
                            ${vpnStatus.connected ? 
                              (isDark ? "bg-green-900/50 text-green-200" : "bg-green-100 text-green-800") :
                              (isDark ? "bg-red-900/50 text-red-200" : "bg-red-100 text-red-800")
                            }
                          `}>
                            {vpnStatus.connected ? "Connected" : "Disconnected"}
                          </span>
                        </div>
                        {vpnStatus.connected && (
                          <div className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                            <span>Server: </span>
                            <span className={isDark ? "text-white" : "text-gray-900"}>
                              {vpnStatus.server}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Banned IPs */}
                  <div className={`
                    p-6 rounded-xl shadow-lg border
                    ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}
                  `}>
                    <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                      Banned IPs
                    </h3>
                    <div className="space-y-2">
                      {bannedIPs.length === 0 ? (
                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          No banned IPs
                        </p>
                      ) : (
                        bannedIPs.map(ip => (
                          <div key={ip} className="flex items-center justify-between">
                            <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                              {ip}
                            </span>
                            <button
                              onClick={() => handleUnbanIP(ip)}
                              className="text-xs px-2 py-1 rounded-lg text-red-600 hover:bg-red-100/10"
                            >
                              Unban
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Security Events */}
                <div className={`
                  p-6 rounded-xl shadow-lg border
                  ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}
                `}>
                  <h2 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                    Recent Security Events
                  </h2>
                  <div className="space-y-4">
                    {events.map(event => (
                      <div
                        key={event.id}
                        className={`
                          p-4 rounded-lg border
                          ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}
                        `}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                              {event.message}
                            </h3>
                            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                              {new Date(event.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(event.severity)}`}>
                              {event.severity}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
                              {event.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;