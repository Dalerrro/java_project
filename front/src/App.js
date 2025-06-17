// src/App.js

import React, { useState, useEffect } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './components/Overview';
import MetricsPage from './components/MetricsPage';
import AlertsPage from './components/AlertsPage';
import SettingsPage from './components/SettingsPage';
import api from './services/api';
import useSystemMonitor from './hooks/useSystemMonitor';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#3b82f6' },
    secondary: { main: '#10b981' },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280',
    }
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [serverHealth, setServerHealth] = useState(null);

  // Используем хук для автоматического мониторинга и отправки алертов
  useSystemMonitor();

  useEffect(() => {
    // Проверяем здоровье сервера при загрузке
    const checkHealth = async () => {
      try {
        const health = await api.getHealth();
        setServerHealth(health.status);
      } catch (err) {
        console.error('Server health check failed:', err);
        setServerHealth('DOWN');
      }
    };

    checkHealth();
    // Проверяем каждую минуту
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'metrics':
        return <MetricsPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Overview />;
    }
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Header serverHealth={serverHealth} />
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main style={{ 
            flex: 1, 
            padding: '24px',
            overflow: 'auto'
          }}>
            {renderContent()}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;