import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './pages/App';
import { ThemeProvider } from './contexts/ThemeContext';
import { HistoryProvider } from './contexts/HistoryContext';
import reportWebVitals from './reportWebVitals';
import TestComponent from './components/TestComponent';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <HistoryProvider>
        <App />
        <TestComponent />
      </HistoryProvider>
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();
