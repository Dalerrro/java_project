// src/App.js

import React, { useState, useEffect } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Overview from "./components/Overview";
import MetricsPage from "./components/MetricsPage";
import AlertsPage from "./components/AlertsPage";
import SettingsPage from "./components/SettingsPage";
import api from "./services/api";
import useSystemMonitor from "./hooks/useSystemMonitor";
import settingsService from "./services/settings";

const createAppTheme = (mode) =>
  createTheme({
    palette: {
      mode: mode,
      primary: {
        main: mode === "dark" ? "#60a5fa" : "#3b82f6",
        light: mode === "dark" ? "#93c5fd" : "#60a5fa",
        dark: mode === "dark" ? "#2563eb" : "#1d4ed8",
      },
      secondary: {
        main: mode === "dark" ? "#34d399" : "#10b981",
        light: mode === "dark" ? "#6ee7b7" : "#34d399",
        dark: mode === "dark" ? "#059669" : "#047857",
      },
      background: {
        default: mode === "dark" ? "#0f172a" : "#f9fafb",
        paper: mode === "dark" ? "#1e293b" : "#ffffff",
      },
      text: {
        primary: mode === "dark" ? "#f1f5f9" : "#111827",
        secondary: mode === "dark" ? "#94a3b8" : "#6b7280",
      },
      divider: mode === "dark" ? "#334155" : "#e5e7eb",
      error: {
        main: mode === "dark" ? "#f87171" : "#ef4444",
      },
      warning: {
        main: mode === "dark" ? "#fbbf24" : "#f59e0b",
      },
      success: {
        main: mode === "dark" ? "#34d399" : "#10b981",
      },
      info: {
        main: mode === "dark" ? "#60a5fa" : "#3b82f6",
      },
    },
    typography: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: mode === "dark" ? "1px solid #334155" : "1px solid #e5e7eb",
            boxShadow:
              mode === "dark"
                ? "0 1px 3px 0 rgba(0, 0, 0, 0.3)"
                : "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            backgroundImage: "none",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === "dark" ? "#1e293b" : "white",
            color: mode === "dark" ? "#f1f5f9" : "#111827",
            borderBottom:
              mode === "dark" ? "1px solid #334155" : "1px solid #e5e7eb",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 8,
            fontWeight: 500,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            backgroundColor: mode === "dark" ? "#334155" : "#f3f4f6",
          },
        },
      },
    },
  });

function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [serverHealth, setServerHealth] = useState(null);
  const [settings, setSettings] = useState(settingsService.getSettings());
  const [currentTheme, setCurrentTheme] = useState(
    settings.interface.theme || "light",
  );

  // Используем хук для автоматического мониторинга и отправки алертов
  useSystemMonitor();

  // Слушаем изменения настроек
  useEffect(() => {
    const handleStorageChange = () => {
      const newSettings = settingsService.getSettings();
      setSettings(newSettings);
      if (newSettings.interface.theme !== currentTheme) {
        setCurrentTheme(newSettings.interface.theme);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [currentTheme]);

  // Обновляем data-theme атрибут для CSS
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
    document.body.setAttribute("data-theme", currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    // Проверяем здоровье сервера при загрузке
    const checkHealth = async () => {
      try {
        const health = await api.getHealth();
        setServerHealth(health.status);
      } catch (err) {
        console.error("Server health check failed:", err);
        setServerHealth("DOWN");
      }
    };

    checkHealth();
    // Проверяем каждую минуту
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  const theme = createAppTheme(currentTheme);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview />;
      case "metrics":
        return <MetricsPage />;
      case "alerts":
        return <AlertsPage />;
      case "settings":
        return <SettingsPage onThemeChange={setCurrentTheme} />;
      default:
        return <Overview />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: theme.palette.background.default,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header serverHealth={serverHealth} />
        <div style={{ display: "flex", flex: 1 }}>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main
            style={{
              flex: 1,
              padding: "24px",
              overflow: "auto",
              backgroundColor: theme.palette.background.default,
            }}
          >
            {renderContent()}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
