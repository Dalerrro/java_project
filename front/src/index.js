import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import settingsService from './services/settings';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

const darkThemeConfig = {
  palette: {
    mode: 'dark',
    primary: { main: '#1976d2' },
    secondary: { main: '#4caf50' },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
};

const lightThemeConfig = {
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#4caf50' },
    background: {
      default: '#fafafa',
      paper: '#fff',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
};

function Root() {
  const interfaceSettings = settingsService.getInterfaceSettings();
  const initialMode = interfaceSettings.theme === 'dark' ? 'dark' : 'light';
  const [mode, setMode] = useState(initialMode);


  useEffect(() => {
    settingsService.saveInterfaceSettings({
      ...interfaceSettings,
      theme: mode,
    });
  }, [mode]);

  // Создаём тему MUI
  const theme = useMemo(
    () => createTheme(mode === 'dark' ? darkThemeConfig : lightThemeConfig),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App currentTheme={mode} onThemeChange={setMode} />
    </ThemeProvider>
  );
}


ReactDOM.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
  document.getElementById('root')
);
