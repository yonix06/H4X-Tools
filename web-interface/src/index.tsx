import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './pages/App';
import { ThemeProvider } from './contexts/ThemeContext';
import './styles/index.css';
import './styles/App.css';

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
