// src/components/Header.jsx

import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Avatar,
  Chip,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  Refresh,
  Download,
  AccountCircle,
  Settings,
  Notifications,
  Computer,
  DarkMode,
  LightMode,
} from "@mui/icons-material";
import settingsService from "../services/settings";

const Header = ({ serverHealth }) => {
  const theme = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
      // Обновляем страницу для рефреша данных
      window.location.reload();
    }, 1000);
  };

  const handleExport = () => {
    // Логика экспорта данных
    console.log("Exporting data...");
    const dataStr = JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        settings: settingsService.getSettings(),
        serverHealth: serverHealth,
      },
      null,
      2,
    );

    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `system-monitor-export-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleTheme = () => {
    const currentSettings = settingsService.getInterfaceSettings();
    const newTheme = currentSettings.theme === "light" ? "dark" : "light";

    settingsService.saveInterfaceSettings({
      ...currentSettings,
      theme: newTheme,
    });

    // Отправляем событие для обновления темы
    window.dispatchEvent(new Event("storage"));
  };

  const getHealthStatus = () => {
    if (serverHealth === "UP") {
      return { color: "success", label: "Online" };
    } else if (serverHealth === "DOWN") {
      return { color: "error", label: "Offline" };
    } else {
      return { color: "warning", label: "Checking..." };
    }
  };

  const healthStatus = getHealthStatus();
  const isDark = theme.palette.mode === "dark";

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
        {/* Left side - Logo and title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              p: 1,
              backgroundColor: theme.palette.primary.main,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Computer sx={{ color: "white", fontSize: "1.5rem" }} />
          </Box>

          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                fontSize: "1.25rem",
              }}
            >
              System Monitor
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.875rem",
              }}
            >
              Real-time resource monitoring
            </Typography>
          </Box>
        </Box>

        {/* Right side - Actions and user */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Server Status */}
          <Chip
            label={`Server: ${healthStatus.label}`}
            color={healthStatus.color}
            size="small"
            variant="outlined"
            sx={{
              fontSize: "0.75rem",
              height: 28,
            }}
          />

          {/* Last update info */}
          <Chip
            label={`Updated: ${lastUpdate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
            size="small"
            variant="outlined"
            sx={{
              borderColor: theme.palette.divider,
              color: theme.palette.text.secondary,
              fontSize: "0.75rem",
              height: 28,
            }}
          />

          {/* Theme Toggle */}
          <Tooltip title={`Switch to ${isDark ? "light" : "dark"} mode`}>
            <IconButton
              onClick={toggleTheme}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                padding: "8px",
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              {isDark ? (
                <LightMode
                  sx={{
                    fontSize: "1.25rem",
                    color: theme.palette.text.secondary,
                  }}
                />
              ) : (
                <DarkMode
                  sx={{
                    fontSize: "1.25rem",
                    color: theme.palette.text.secondary,
                  }}
                />
              )}
            </IconButton>
          </Tooltip>

          {/* Refresh button */}
          <Tooltip title="Refresh data">
            <IconButton
              onClick={handleRefresh}
              disabled={isRefreshing}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                padding: "8px",
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <Refresh
                sx={{
                  fontSize: "1.25rem",
                  color: theme.palette.text.secondary,
                  animation: isRefreshing ? "spin 1s linear infinite" : "none",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              />
            </IconButton>
          </Tooltip>

          {/* Export button */}
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExport}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: "white",
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              py: 1,
              fontSize: "0.875rem",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            Export
          </Button>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                padding: "8px",
              }}
            >
              <Notifications
                sx={{
                  fontSize: "1.25rem",
                  color: theme.palette.text.secondary,
                }}
              />
            </IconButton>
          </Tooltip>

          {/* User menu */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              backgroundColor: theme.palette.action.hover,
              borderRadius: 2,
              padding: "6px 12px",
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Avatar
              sx={{
                width: 28,
                height: 28,
                backgroundColor: theme.palette.primary.main,
                fontSize: "0.875rem",
              }}
            >
              A
            </Avatar>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: theme.palette.text.primary,
                fontSize: "0.875rem",
              }}
            >
              Admin
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
