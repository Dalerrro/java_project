// src/components/Sidebar.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  Chip,
  Divider,
  LinearProgress,
  useTheme,
} from "@mui/material";
import {
  BarChart,
  Timeline,
  NotificationsActive,
  Settings,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Computer,
  Thermostat,
  Memory,
} from "@mui/icons-material";
import api from "../services/api";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const theme = useTheme();
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Получаем статус системы для отображения в сайдбаре
    const fetchSystemStatus = async () => {
      try {
        const data = await api.getSystemCurrent();
        setSystemStatus(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching status:", err);
        setSystemStatus({ status: "error" });
        setLoading(false);
      }
    };

    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 30000); // Обновляем каждые 30 секунд
    return () => clearInterval(interval);
  }, []);

  const navigationItems = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart,
      description: "System dashboard",
    },
    {
      id: "metrics",
      label: "Metrics",
      icon: Timeline,
      description: "Detailed charts",
    },
    {
      id: "alerts",
      label: "Alerts",
      icon: NotificationsActive,
      description: "Notifications",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      description: "Configuration",
    },
  ];

  const getSystemStatusInfo = () => {
    if (!systemStatus || loading) {
      return {
        status: "loading",
        color: theme.palette.text.secondary,
        icon: Computer,
        text: "Loading...",
        uptime: "N/A",
        processes: "N/A",
        cpuUsage: 0,
        memoryUsage: 0,
        temperature: 0,
      };
    }

    if (systemStatus.status === "error") {
      return {
        status: "error",
        color: theme.palette.error.main,
        icon: ErrorIcon,
        text: "Connection error",
        uptime: "N/A",
        processes: "N/A",
        cpuUsage: 0,
        memoryUsage: 0,
        temperature: 0,
      };
    }

    const cpuUsage = systemStatus.currentMetrics?.cpuUsage || 0;
    const memoryUsage = systemStatus.currentMetrics?.memoryUsagePercent || 0;
    const temperature = systemStatus.sensorData?.cpuTemperature || 0;
    const processes = systemStatus.staticInfo?.processes || 0;
    const uptime = systemStatus.staticInfo?.uptime || "N/A";

    // Определяем общий статус на основе метрик
    const cpuHigh = cpuUsage > 80;
    const memoryHigh = memoryUsage > 85;
    const tempHigh = temperature > 75;

    if (cpuHigh || memoryHigh || tempHigh) {
      return {
        status: "warning",
        color: theme.palette.warning.main,
        icon: Warning,
        text: "Attention needed",
        uptime,
        processes,
        cpuUsage,
        memoryUsage,
        temperature,
      };
    }

    return {
      status: "healthy",
      color: theme.palette.success.main,
      icon: CheckCircle,
      text: "All systems operational",
      uptime,
      processes,
      cpuUsage,
      memoryUsage,
      temperature,
    };
  };

  const statusInfo = getSystemStatusInfo();

  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case "healthy":
        return theme.palette.mode === "dark" ? "#065f46" : "#f0fdf4";
      case "warning":
        return theme.palette.mode === "dark" ? "#78350f" : "#fffbeb";
      case "error":
        return theme.palette.mode === "dark" ? "#7f1d1d" : "#fef2f2";
      default:
        return theme.palette.action.hover;
    }
  };

  const getStatusBorderColor = (status) => {
    switch (status) {
      case "healthy":
        return theme.palette.mode === "dark" ? "#10b981" : "#bbf7d0";
      case "warning":
        return theme.palette.mode === "dark" ? "#f59e0b" : "#fed7aa";
      case "error":
        return theme.palette.mode === "dark" ? "#ef4444" : "#fecaca";
      default:
        return theme.palette.divider;
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "healthy":
        return theme.palette.mode === "dark" ? "#34d399" : "#166534";
      case "warning":
        return theme.palette.mode === "dark" ? "#fbbf24" : "#92400e";
      case "error":
        return theme.palette.mode === "dark" ? "#f87171" : "#991b1b";
      default:
        return theme.palette.text.primary;
    }
  };

  return (
    <Box
      sx={{
        width: 280,
        backgroundColor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Navigation */}
      <Box sx={{ p: 3, flex: 1 }}>
        <List sx={{ gap: 1, display: "flex", flexDirection: "column" }}>
          {navigationItems.map((item) => (
            <ListItemButton
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                py: 1.5,
                px: 2,
                backgroundColor:
                  activeTab === item.id
                    ? theme.palette.mode === "dark"
                      ? "#1e40af"
                      : "#eff6ff"
                    : "transparent",
                border:
                  activeTab === item.id
                    ? `1px solid ${theme.palette.mode === "dark" ? "#3b82f6" : "#bfdbfe"}`
                    : "1px solid transparent",
                color:
                  activeTab === item.id
                    ? theme.palette.mode === "dark"
                      ? "#60a5fa"
                      : "#1d4ed8"
                    : theme.palette.text.secondary,
                "&:hover": {
                  backgroundColor:
                    activeTab === item.id
                      ? theme.palette.mode === "dark"
                        ? "#1e40af"
                        : "#eff6ff"
                      : theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color:
                    activeTab === item.id
                      ? theme.palette.primary.main
                      : theme.palette.text.disabled,
                }}
              >
                <item.icon />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                secondary={item.description}
                primaryTypographyProps={{
                  fontWeight: activeTab === item.id ? 600 : 500,
                  fontSize: "0.95rem",
                  color:
                    activeTab === item.id
                      ? theme.palette.mode === "dark"
                        ? "#60a5fa"
                        : "#1d4ed8"
                      : theme.palette.text.primary,
                }}
                secondaryTypographyProps={{
                  fontSize: "0.75rem",
                  color: theme.palette.text.disabled,
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Divider sx={{ borderColor: theme.palette.divider }} />

      {/* System Status Card */}
      <Box sx={{ p: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            backgroundColor: getStatusBackgroundColor(statusInfo.status),
            border: `1px solid ${getStatusBorderColor(statusInfo.status)}`,
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <statusInfo.icon
              sx={{
                fontSize: "1.25rem",
                color: statusInfo.color,
              }}
            />
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: statusInfo.color,
                fontSize: "0.875rem",
              }}
            >
              System Status
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: getStatusTextColor(statusInfo.status),
              fontSize: "0.8rem",
              mb: 1.5,
              fontWeight: 500,
            }}
          >
            {statusInfo.text}
          </Typography>

          {statusInfo.status !== "error" && !loading && (
            <>
              {/* Quick Metrics */}
              <Box sx={{ mb: 2 }}>
                {/* CPU Usage */}
                <Box sx={{ mb: 1.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 0.5,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Computer
                        sx={{
                          fontSize: "0.875rem",
                          color: theme.palette.text.secondary,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: "0.75rem",
                        }}
                      >
                        CPU
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.primary,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {statusInfo.cpuUsage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={statusInfo.cpuUsage}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor:
                        theme.palette.mode === "dark" ? "#334155" : "#e5e7eb",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor:
                          statusInfo.cpuUsage > 80
                            ? theme.palette.error.main
                            : statusInfo.cpuUsage > 60
                              ? theme.palette.warning.main
                              : theme.palette.success.main,
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>

                {/* Memory Usage */}
                <Box sx={{ mb: 1.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 0.5,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Memory
                        sx={{
                          fontSize: "0.875rem",
                          color: theme.palette.text.secondary,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: "0.75rem",
                        }}
                      >
                        Memory
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.primary,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {statusInfo.memoryUsage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={statusInfo.memoryUsage}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor:
                        theme.palette.mode === "dark" ? "#334155" : "#e5e7eb",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor:
                          statusInfo.memoryUsage > 85
                            ? theme.palette.error.main
                            : statusInfo.memoryUsage > 70
                              ? theme.palette.warning.main
                              : theme.palette.success.main,
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>

                {/* Temperature */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 0.5,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Thermostat
                        sx={{
                          fontSize: "0.875rem",
                          color: theme.palette.text.secondary,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: "0.75rem",
                        }}
                      >
                        Temp
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.primary,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {statusInfo.temperature.toFixed(1)}°C
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, (statusInfo.temperature / 100) * 100)}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor:
                        theme.palette.mode === "dark" ? "#334155" : "#e5e7eb",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor:
                          statusInfo.temperature > 75
                            ? theme.palette.error.main
                            : statusInfo.temperature > 60
                              ? theme.palette.warning.main
                              : theme.palette.success.main,
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 1.5, borderColor: theme.palette.divider }} />

              {/* Additional Info */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: "0.75rem",
                    }}
                  >
                    Uptime
                  </Typography>
                  <Chip
                    label={statusInfo.uptime}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      backgroundColor: theme.palette.action.hover,
                      color: theme.palette.text.primary,
                      border: "none",
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: "0.75rem",
                    }}
                  >
                    Processes
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.primary,
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    {statusInfo.processes}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Sidebar;
