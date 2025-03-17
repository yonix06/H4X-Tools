import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside 
      className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out 
                 ${isDark ? 'bg-gray-800 text-gray-100' : 'bg-gray-700 text-white'} 
                 h-full flex flex-col`}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        {!collapsed && <h1 className="text-xl font-bold">H4X Tools</h1>}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-1 rounded-md hover:bg-gray-700 text-gray-300"
        >
          {collapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          <NavItem 
            path="/" 
            label="Dashboard" 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            } 
            isActive={isActive("/")} 
            collapsed={collapsed} 
          />
          
          {/* Security Section */}
          <div className={`mt-6 mb-2 ${collapsed ? 'hidden' : 'block'}`}>
            <div className="px-2 mb-2">
              <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Security</span>
            </div>
          </div>
          
          <NavItem 
            path="/security" 
            label="Security Dashboard" 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            } 
            isActive={isActive("/security")} 
            collapsed={collapsed} 
          />
          
          <NavItem 
            path="/security/banned-ips" 
            label="Banned IPs" 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            } 
            isActive={isActive("/security/banned-ips")} 
            collapsed={collapsed} 
          />
          
          <NavItem 
            path="/security/vpn" 
            label="VPN Status" 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            } 
            isActive={isActive("/security/vpn")} 
            collapsed={collapsed} 
          />
          
          <NavItem 
            path="/security/alerts" 
            label="Alerts" 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            } 
            isActive={isActive("/security/alerts")} 
            collapsed={collapsed} 
            badge={3}
            badgeColor="red"
          />
          
          {/* Tools Section */}
          <div className={`mt-6 mb-2 ${collapsed ? 'hidden' : 'block'}`}>
            <div className="px-2 mb-2">
              <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Tools</span>
            </div>
          </div>
          
          <NavItem 
            path="/tools" 
            label="All Tools" 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            } 
            isActive={isActive("/tools")} 
            collapsed={collapsed} 
          />
          
          <NavItem 
            path="/tools?category=network" 
            label="Network Tools" 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            } 
            isActive={location.pathname === "/tools" && location.search.includes("category=network")} 
            collapsed={collapsed} 
          />
          
          <NavItem 
            path="/tools?category=investigation" 
            label="Investigation Tools" 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            } 
            isActive={location.pathname === "/tools" && location.search.includes("category=investigation")} 
            collapsed={collapsed} 
          />
          
          {/* Investigation Section */}
          <div className={`mt-6 mb-2 ${collapsed ? 'hidden' : 'block'}`}>
            <div className="px-2 mb-2">
              <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Cases</span>
            </div>
          </div>
          
          <NavItem 
            path="/investigation" 
            label="Investigations" 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            } 
            isActive={isActive("/investigation")} 
            collapsed={collapsed} 
          />
          
          <NavItem 
            path="/investigation/new" 
            label="New Investigation" 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            } 
            isActive={isActive("/investigation/new")} 
            collapsed={collapsed} 
          />
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <div className={`flex ${collapsed ? 'justify-center' : 'justify-between'} items-center gap-2`}>
          <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
            <span>H</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-medium">H4X-Tools</span>
              <span className="text-xs text-gray-400">v1.0</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

interface NavItemProps {
  path: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  collapsed: boolean;
  badge?: number;
  badgeColor?: string;
}

const NavItem: React.FC<NavItemProps> = ({ 
  path, 
  label, 
  icon, 
  isActive, 
  collapsed,
  badge,
  badgeColor = "purple" 
}) => {
  return (
    <li>
      <Link
        to={path}
        className={`flex items-center p-2 rounded-lg ${
          isActive 
            ? 'bg-purple-600 text-white' 
            : 'hover:bg-gray-700'
        } transition-colors`}
      >
        <div className="flex items-center justify-center w-6 h-6">{icon}</div>
        {!collapsed && <span className="ml-3 flex-1">{label}</span>}
        {!collapsed && badge && (
          <span className={`bg-${badgeColor}-500 text-white text-xs font-medium px-2 py-0.5 rounded-full`}>
            {badge}
          </span>
        )}
        {collapsed && badge && (
          <span className={`absolute top-0 right-0 -mr-1 -mt-1 bg-${badgeColor}-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full`}>
            {badge}
          </span>
        )}
      </Link>
    </li>
  );
};

export default Navigation;
