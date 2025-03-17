import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

// Tool category definitions
type CategoryKey = 'Network' | 'Web' | 'Investigation' | 'System' | 'Cryptography' | 'Utilities';

const TOOL_CATEGORIES: Record<CategoryKey, { icon: JSX.Element; color: string }> = {
  "Network": {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    color: "cyber-purple"
  },
  "Web": {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    color: "blue"
  },
  "Investigation": {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    color: "orange" 
  },
  "System": {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    color: "green"
  },
  "Cryptography": {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    color: "red"
  },
  "Utilities": {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "yellow"
  }
};

// Tool definitions
interface Tool {
  id: string;
  name: string;
  description: string;
  category: CategoryKey;
  path: string;
  highlight?: boolean;
}

const TOOLS: Tool[] = [
  {
    id: 'ip-lookup',
    name: 'IP Lookup',
    description: 'Looks up an IP/domain address and returns information about it.',
    category: 'Network',
    path: '/tools?tool=ip-lookup',
    highlight: true
  },
  {
    id: 'port-scanner',
    name: 'Port Scanner',
    description: 'Scans for open ports in a given IP/domain address.',
    category: 'Network',
    path: '/tools?tool=port-scanner',
    highlight: true
  },
  {
    id: 'wifi-finder',
    name: 'Wi-Fi Finder',
    description: 'Scans for nearby Wi-Fi networks.',
    category: 'Network',
    path: '/tools?tool=wifi-finder',
  },
  {
    id: 'wifi-vault',
    name: 'Wi-Fi Vault',
    description: 'Scans for locally saved Wi-Fi passwords.',
    category: 'Network',
    path: '/tools?tool=wifi-vault',
  },
  {
    id: 'web-search',
    name: 'Web Search',
    description: 'Searches the internet for the given query.',
    category: 'Web',
    path: '/tools?tool=web-search',
  },
  {
    id: 'web-scrape',
    name: 'Web Scraper',
    description: 'Scrapes links from a given URL.',
    category: 'Web',
    path: '/tools?tool=web-scrape',
    highlight: true
  },
  {
    id: 'dirbuster',
    name: 'Dir Buster',
    description: 'Bruteforce directories on a website.',
    category: 'Web',
    path: '/tools?tool=dirbuster',
  },
  {
    id: 'whois-lookup',
    name: 'WhoIs Lookup',
    description: 'Looks up a domain and returns information about it.',
    category: 'Investigation',
    path: '/tools?tool=whois-lookup',
  },
  {
    id: 'leak-search',
    name: 'Leak Search',
    description: 'Searches if given email/domain has been compromised and leaked.',
    category: 'Investigation',
    path: '/tools?tool=leak-search',
  },
  {
    id: 'email-search',
    name: 'Email Search',
    description: 'Efficiently finds registered accounts from a given email.',
    category: 'Investigation',
    path: '/tools?tool=email-search',
  },
  {
    id: 'username-search',
    name: 'Username Search',
    description: 'Tries to find a given username from many different websites.',
    category: 'Investigation',
    path: '/tools?tool=username-search',
  },
  {
    id: 'phone-lookup',
    name: 'Phone Lookup',
    description: 'Looks up a phone number and returns information about it.',
    category: 'Investigation',
    path: '/tools?tool=phone-lookup',
  },
  {
    id: 'ig-scrape',
    name: 'Instagram Scraper',
    description: 'Scrapes information from Instagram accounts.',
    category: 'Investigation',
    path: '/tools?tool=ig-scrape',
  },
  {
    id: 'local-users',
    name: 'Local Users',
    description: 'Enumerates local user accounts on the current machine.',
    category: 'System',
    path: '/tools?tool=local-users',
  },
  {
    id: 'sms-bomber',
    name: 'SMS Bomber',
    description: 'Spams messages to a given mobile number. (US only)',
    category: 'Utilities',
    path: '/tools?tool=sms-bomber',
  },
  {
    id: 'fake-info',
    name: 'Fake Info Generator',
    description: 'Generates fake personal information.',
    category: 'Utilities',
    path: '/tools?tool=fake-info',
  },
  {
    id: 'caesar-cipher',
    name: 'Caesar Cipher',
    description: 'Cipher/decipher/bruteforce using the Caesar code.',
    category: 'Cryptography',
    path: '/tools?tool=caesar-cipher',
  },
  {
    id: 'basexx',
    name: 'BaseXX',
    description: 'Encodes/decodes using Base64/32/16.',
    category: 'Cryptography',
    path: '/tools?tool=basexx',
  }
];

interface SecurityMetrics {
  banned_ips: number;
  blocked_attacks: number;
  vpn_status: string;
  network_status: string;
}

const WelcomePage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [searchQuery, setSearchQuery] = useState("");
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    banned_ips: 0,
    blocked_attacks: 0,
    vpn_status: "Unknown",
    network_status: "Unknown"
  });
  const [loading, setLoading] = useState(true);

  // Get security metrics on component mount
  useEffect(() => {
    const getSecurityMetrics = async () => {
      try {
        // Fetch the metrics from the API
        // This is a placeholder, implement actual API calls
        setSecurityMetrics({
          banned_ips: 28,
          blocked_attacks: 142,
          vpn_status: "Connected",
          network_status: "Secure"
        });
      } catch (error) {
        console.error("Error fetching security metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    getSecurityMetrics();
  }, []);

  // Filter tools to find the highlighted ones for the featured section
  const highlightedTools = TOOLS.filter(tool => tool.highlight).slice(0, 3);

  return (
    <div className={`flex-1 overflow-auto ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className={`text-4xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            Welcome to H4X Tools
          </h1>
          <p className={`text-xl ${isDark ? "text-gray-300" : "text-gray-600"} max-w-2xl mx-auto`}>
            Network security analysis and investigation toolkit for cybersecurity professionals
          </p>
        </div>

        {/* Security Status Dashboard */}
        <div className={`mb-12 rounded-xl p-6 shadow-lg ${isDark ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              Security Dashboard
            </h2>
            <Link 
              to="/security" 
              className="text-purple-500 hover:text-purple-600 transition-colors font-medium"
            >
              View Details →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Banned IPs</div>
                  <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {loading ? "..." : securityMetrics.banned_ips}
                  </div>
                </div>
                <div className="p-2 rounded-full bg-red-100">
                  <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Blocked Attacks</div>
                  <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {loading ? "..." : securityMetrics.blocked_attacks}
                  </div>
                </div>
                <div className="p-2 rounded-full bg-green-100">
                  <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>VPN Status</div>
                  <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {loading ? "..." : securityMetrics.vpn_status}
                  </div>
                </div>
                <div className="p-2 rounded-full bg-purple-100">
                  <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Network Status</div>
                  <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {loading ? "..." : securityMetrics.network_status}
                  </div>
                </div>
                <div className="p-2 rounded-full bg-blue-100">
                  <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Tools */}
        <div className="mb-12">
          <h2 className={`text-2xl font-semibold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
            Featured Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlightedTools.map((tool) => (
              <Link
                key={tool.id}
                to={tool.path}
                className={`
                  p-6 rounded-xl shadow-lg transition-all transform hover:scale-102
                  ${isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-50"}
                  border ${isDark ? "border-gray-700" : "border-gray-200"}
                `}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`p-3 rounded-lg bg-${TOOL_CATEGORIES[tool.category].color}-600 text-white`}>
                      {TOOL_CATEGORIES[tool.category].icon}
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {tool.name}
                      </h3>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full 
                        ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"}`}>
                        {tool.category}
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm mb-4 flex-grow ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {tool.description}
                  </p>
                  <div className="flex justify-end mt-auto">
                    <span className={`text-sm font-medium ${isDark ? "text-purple-400" : "text-purple-600"}`}>
                      Launch Tool →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Tool Categories */}
        <div>
          <h2 className={`text-2xl font-semibold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
            Tools by Category
          </h2>

          {Object.entries(TOOL_CATEGORIES).map(([category, categoryInfo]) => {
            const categoryTools = TOOLS.filter(tool => tool.category === category);
            if (categoryTools.length === 0) return null;

            return (
              <div key={category} className="mb-8">
                <div className="flex items-center mb-4">
                  <div className={`p-2 rounded-lg bg-${categoryInfo.color}-100 text-${categoryInfo.color}-500 mr-2`}>
                    {categoryInfo.icon}
                  </div>
                  <h3 className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {category}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTools.map(tool => (
                    <Link
                      key={tool.id}
                      to={tool.path}
                      className={`
                        p-4 rounded-lg transition-all hover:shadow-md
                        ${isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-50"}
                        border ${isDark ? "border-gray-700" : "border-gray-200"}
                      `}
                    >
                      <h4 className={`font-medium mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {tool.name}
                      </h4>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {tool.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-xl shadow-lg ${isDark ? "bg-gray-800" : "bg-white"}`}>
            <h3 className={`text-xl font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Start Investigation
            </h3>
            <p className={`mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Create a new investigation case to track and document your findings.
            </p>
            <Link
              to="/investigation"
              className={`inline-block px-4 py-2 rounded-lg font-medium
                bg-purple-600 hover:bg-purple-700 text-white transition-colors`}
            >
              New Investigation
            </Link>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${isDark ? "bg-gray-800" : "bg-white"}`}>
            <h3 className={`text-xl font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Security Dashboard
            </h3>
            <p className={`mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Monitor network security status and view detected threats.
            </p>
            <Link
              to="/security"
              className={`inline-block px-4 py-2 rounded-lg font-medium
                bg-purple-600 hover:bg-purple-700 text-white transition-colors`}
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
