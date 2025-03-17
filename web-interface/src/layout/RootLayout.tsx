import React from 'react';
import Navigation from './Navigation';

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Navigation />
      <main className="flex-1 overflow-auto p-4">
        {children}
      </main>
    </div>
  );
};

export default RootLayout;
