import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { HistoryProvider } from './contexts/HistoryContext';
import RootLayout from './components/RootLayout';
import Tools from './pages/Tools';
import Investigation from './pages/Investigation';
import SecurityDashboard from './pages/SecurityDashboard';
import './App.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <HistoryProvider>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              <Route index element={<Tools />} />
              <Route path="investigation" element={<Investigation />} />
              <Route path="security" element={<SecurityDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HistoryProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
