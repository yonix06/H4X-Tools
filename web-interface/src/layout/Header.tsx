import React, { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigate, Link } from "react-router-dom";

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [securityAlerts, setSecurityAlerts] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const isDark = theme === "dark";

  useEffect(() => {
    // Fetch security alerts count - this would be connected to your API
    const fetchAlertsCount = async () => {
      try {
        // This is a placeholder. Replace with actual API call
        setSecurityAlerts(3);
      } catch (error) {
        console.error("Error fetching security alerts:", error);
      }
    };

    fetchAlertsCount();
    // Set up an interval to check for new alerts
    const interval = setInterval(fetchAlertsCount, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className={`
      px-4 h-16 flex items-center justify-between
      ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-800"}
      border-b ${isDark ? "border-gray-700" : "border-gray-200"}
      shadow-sm
    `}>
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">H4X Tools</h1>
        
        <form onSubmit={handleSearch} className="hidden md:flex items-center">
          <div className="relative">
            <input
              type="search"
              placeholder="Search tools and investigations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`
                pl-10 pr-4 py-2 rounded-lg w-64
                ${isDark ? "bg-gray-700 focus:bg-gray-600" : "bg-gray-100 focus:bg-white"}
                focus:outline-none focus:ring-2 focus:ring-purple-500
                transition-colors
              `}
            />
            <svg
              className={`absolute left-3 top-2.5 h-5 w-5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-4">
        {/* Security Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500 bg-opacity-20">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-medium text-green-500">Network Secure</span>
        </div>

        {/* VPN Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500 bg-opacity-20">
          <div className="h-2 w-2 rounded-full bg-purple-500"></div>
          <span className="text-sm font-medium text-purple-500">VPN Active</span>
        </div>

        {/* Security Alerts Button */}
        <Link 
          to="/security/alerts"
          className={`
            hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg
            ${securityAlerts > 0 
              ? "bg-red-500 bg-opacity-20 text-red-500" 
              : `${isDark ? "bg-gray-700" : "bg-gray-200"} ${isDark ? "text-gray-300" : "text-gray-700"}`
            }
            hover:bg-opacity-30 transition-colors
          `}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-sm font-medium">
            {securityAlerts > 0 ? `${securityAlerts} Alerts` : 'No Alerts'}
          </span>
        </Link>

        <button
          onClick={toggleTheme}
          className={`
            p-2 rounded-lg
            ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}
            transition-colors
          `}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`
              p-2 rounded-lg
              ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}
              transition-colors
              relative
            `}
            aria-label="Notifications"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {securityAlerts > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div 
              className={`
                absolute right-0 mt-2 w-80 rounded-lg shadow-lg overflow-hidden z-50
                ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}
              `}
            >
              <div className={`p-3 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    Notifications
                  </h3>
                  <Link 
                    to="/notifications" 
                    className="text-xs text-purple-500 hover:text-purple-600"
                  >
                    View All
                  </Link>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {securityAlerts > 0 ? (
                  <>
                    <div className={`p-3 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                      <div className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-red-100">
                          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-start justify-between">
                            <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                              Multiple login attempts detected
                            </p>
                            <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>2m ago</span>
                          </div>
                          <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            Multiple failed login attempts from IP 192.168.1.34. IP has been banned.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`p-3 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                      <div className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-yellow-100">
                          <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-start justify-between">
                            <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                              VPN connection interrupted
                            </p>
                            <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>15m ago</span>
                          </div>
                          <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            VPN connection was interrupted briefly. Auto-reconnection was successful.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`p-3`}>
                      <div className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-purple-100">
                          <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-start justify-between">
                            <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                              Security scan completed
                            </p>
                            <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>1h ago</span>
                          </div>
                          <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            Network security scan completed. No new vulnerabilities detected.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center">
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      No new notifications
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <Link to="/profile" className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
          <span>H</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;