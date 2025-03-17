import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { HistoryProvider } from './contexts/HistoryContext';
import RootLayout from './layout/RootLayout';
import Tools from './pages/Tools';
import Investigation from './pages/Investigation';
import SecurityDashboard from './pages/SecurityDashboard';
import WelcomePage from './pages/App';
import NotFound from './pages/NotFound';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <HistoryProvider>
        <BrowserRouter>
          <RootLayout>
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/investigation" element={<Investigation />} />
              <Route path="/security" element={<SecurityDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RootLayout>
        </BrowserRouter>
      </HistoryProvider>
    </ThemeProvider>
  </React.StrictMode>
);
