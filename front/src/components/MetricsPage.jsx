// src/components/MetricsPage.jsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tab,
  Tabs,
  LinearProgress,
  Chip,
  Alert,
  Skeleton,
} from "@mui/material";
import {
  Timeline,
  Computer,
  Memory,
  Thermostat,
  Speed,
  Bolt,
  TrendingUp,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "../services/api";
import settingsService from "../services/settings";

const MetricsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [systemData, setSystemData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState(settingsService.getSettings());

  const fetchData = async () => {
    try {
      // Используем тот же API что и в Overview - getSystemCurrent
      const data = await api.getSystemCurrent();
      setSystemData(data);

      // Добавляем точку в исторические данные
      const point = {
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        cpuUsage: data.currentMetrics?.cpuUsage || 0,
        cpuFreq: data.cpuDetails?.currentFrequency || 0,
        memoryUsage: data.currentMetrics?.memoryUsagePercent || 0,
        memoryUsed: data.currentMetrics?.memoryUsed || 0,
        memoryTotal: data.currentMetrics?.memoryTotal || 0,
        cpuTemp: data.sensorData?.cpuTemperature || 0,
        cpuVoltage: data.sensorData?.cpuVoltage || 0,
        timestamp: Date.now(),
      };

      setHistoricalData((prev) => {
        const newData = [...prev, point];
        // Оставляем только последние 100 точек
        return newData.slice(-100);
      });

      setError(null);
    } catch (err) {
      console.error("Error fetching metrics:", err);
      setError("Failed to load metrics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Загружаем настройки при инициализации
    const currentSettings = settingsService.getSettings();
    setSettings(currentSettings);

    fetchData();

    // Используем интервал из настроек
    const updateInterval =
      (currentSettings.monitoring.updateInterval || 5) * 1000;
    const interval = setInterval(fetchData, updateInterval);

    return () => clearInterval(interval);
  }, []);

  // Слушаем изменения настроек
  useEffect(() => {
    const handleStorageChange = () => {
      const newSettings = settingsService.getSettings();
      setSettings(newSettings);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: "white",
            p: 2,
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            border: "1px solid #e5e7eb",
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "#374151", mb: 1, display: "block" }}
          >
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                color: entry.color,
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              {entry.name}:{" "}
              {typeof entry.value === "number"
                ? entry.value.toFixed(2)
                : entry.value}{" "}
              {entry.unit || ""}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  const StatCard = ({
    title,
    value,
    unit,
    icon: Icon,
    color,
    subtitle,
    enabled = true,
  }) => {
    if (!enabled) {
      return (
        <Card
          elevation={0}
          sx={{
            border: "1px solid #e5e7eb",
            borderRadius: 3,
            height: "100%",
            opacity: 0.5,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  backgroundColor: "#f3f4f6",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Icon sx={{ color: "#9ca3af", fontSize: "1.5rem" }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#9ca3af", fontSize: "0.875rem" }}
                >
                  {title} (Disabled)
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#9ca3af" }}
                >
                  N/A
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card
        elevation={0}
        sx={{ border: "1px solid #e5e7eb", borderRadius: 3, height: "100%" }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Box
              sx={{
                p: 1.5,
                backgroundColor: `${color}15`,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Icon sx={{ color: color, fontSize: "1.5rem" }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: "#6b7280", fontSize: "0.875rem" }}
              >
                {title}
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#111827" }}
              >
                {value}{" "}
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ color: "#6b7280" }}
                >
                  {unit}
                </Typography>
              </Typography>
              {subtitle && (
                <Typography variant="caption" sx={{ color: "#6b7280" }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading && historicalData.length === 0) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "#111827", mb: 1 }}
          >
            Detailed Metrics
          </Typography>
          <Typography variant="body1" sx={{ color: "#6b7280" }}>
            Real-time system performance analytics
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton
                variant="rectangular"
                height={150}
                sx={{ borderRadius: 3 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error && !systemData) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "#111827", mb: 1 }}
          >
            Detailed Metrics
          </Typography>
        </Box>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Извлекаем данные из systemData (как в Overview)
  const cpuUsage = systemData?.currentMetrics?.cpuUsage || 0;
  const cpuFrequency = systemData?.cpuDetails?.currentFrequency || 0;
  const memoryUsage = systemData?.currentMetrics?.memoryUsagePercent || 0;
  const memoryUsed = systemData?.currentMetrics?.memoryUsed || 0;
  const memoryTotal = systemData?.currentMetrics?.memoryTotal || 0;
  const temperature = systemData?.sensorData?.cpuTemperature || 0;
  const voltage = systemData?.sensorData?.cpuVoltage || 0;
  const cpuName = systemData?.cpuDetails?.name || "Unknown";
  const cpuVendor = systemData?.cpuDetails?.vendor || "Unknown";
  const physicalCores = systemData?.staticInfo?.physicalCores || 0;
  const logicalCores = systemData?.staticInfo?.logicalCores || 0;
  const boostActive = systemData?.cpuDetails?.boostActive || false;

  // Подготовка данных для pie chart памяти
  const memoryPieData = memoryTotal
    ? [
        {
          name: "Used",
          value: (memoryUsed / 1024 / 1024 / 1024).toFixed(1),
          fill: "#3b82f6",
        },
        {
          name: "Available",
          value: ((memoryTotal - memoryUsed) / 1024 / 1024 / 1024).toFixed(1),
          fill: "#e5e7eb",
        },
      ]
    : [];

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "#111827", mb: 1 }}
        >
          Detailed Metrics
        </Typography>
        <Typography variant="body1" sx={{ color: "#6b7280" }}>
          Real-time system performance analytics
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="CPU Usage"
            value={cpuUsage?.toFixed(1) || "0"}
            unit="%"
            icon={Computer}
            color="#3b82f6"
            subtitle={`${physicalCores} cores / ${logicalCores} threads`}
            enabled={settings.monitoring.enableCpuMonitoring}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="CPU Frequency"
            value={cpuFrequency?.toFixed(2) || "0"}
            unit="GHz"
            icon={Speed}
            color="#10b981"
            subtitle={boostActive ? "Turbo Boost Active" : "Base Frequency"}
            enabled={settings.monitoring.enableCpuMonitoring}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Memory Usage"
            value={memoryUsage?.toFixed(1) || "0"}
            unit="%"
            icon={Memory}
            color="#f59e0b"
            subtitle={`${(memoryUsed / 1024 / 1024 / 1024)?.toFixed(1) || 0} / ${(memoryTotal / 1024 / 1024 / 1024)?.toFixed(1) || 0} GB`}
            enabled={settings.monitoring.enableMemoryMonitoring}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="CPU Temperature"
            value={temperature?.toFixed(1) || "0"}
            unit="°C"
            icon={Thermostat}
            color="#ef4444"
            subtitle={temperature > 70 ? "High temperature" : "Normal range"}
            enabled={settings.monitoring.enableTemperatureMonitoring}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="CPU Voltage"
            value={voltage?.toFixed(2) || "0"}
            unit="V"
            icon={Bolt}
            color="#8b5cf6"
            subtitle="Core voltage"
            enabled={settings.monitoring.enableTemperatureMonitoring}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="CPU Model"
            value={cpuVendor || "Unknown"}
            unit=""
            icon={Computer}
            color="#6366f1"
            subtitle={cpuName || "N/A"}
            enabled={settings.monitoring.enableCpuMonitoring}
          />
        </Grid>
      </Grid>

      {/* Tabs for different metrics */}
      <Card
        elevation={0}
        sx={{ border: "1px solid #e5e7eb", borderRadius: 3, mb: 3 }}
      >
        <CardContent>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="CPU Performance" />
            <Tab label="Memory Usage" />
            <Tab label="Thermal & Power" />
            <Tab label="Combined View" />
          </Tabs>

          {/* CPU Performance Tab */}
          {activeTab === 0 && settings.monitoring.enableCpuMonitoring && (
            <Box>
              <Typography
                variant="h6"
                sx={{ mb: 3, fontWeight: 600, color: "#111827" }}
              >
                CPU Usage & Frequency Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                  <YAxis
                    yAxisId="left"
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => `${value} GHz`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="cpuUsage"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="CPU Usage (%)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cpuFreq"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    name="Frequency (GHz)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}

          {/* Memory Usage Tab */}
          {activeTab === 1 && settings.monitoring.enableMemoryMonitoring && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 3, fontWeight: 600, color: "#111827" }}
                  >
                    Memory Usage Trend
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                      <YAxis
                        stroke="#6b7280"
                        fontSize={12}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="memoryUsage"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        fillOpacity={0.6}
                        name="Memory Usage %"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 3, fontWeight: 600, color: "#111827" }}
                  >
                    Memory Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={memoryPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value} GB`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {memoryPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Thermal & Power Tab */}
          {activeTab === 2 &&
            settings.monitoring.enableTemperatureMonitoring && (
              <Box>
                <Typography
                  variant="h6"
                  sx={{ mb: 3, fontWeight: 600, color: "#111827" }}
                >
                  Temperature & Voltage Monitoring
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                    <YAxis
                      yAxisId="left"
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value) => `${value}°C`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value) => `${value}V`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="cpuTemp"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                      name="Temperature (°C)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="cpuVoltage"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={false}
                      name="Voltage (V)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}

          {/* Combined View Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography
                variant="h6"
                sx={{ mb: 3, fontWeight: 600, color: "#111827" }}
              >
                All Metrics Combined
              </Typography>
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {settings.monitoring.enableCpuMonitoring && (
                    <Line
                      type="monotone"
                      dataKey="cpuUsage"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      name="CPU %"
                    />
                  )}
                  {settings.monitoring.enableMemoryMonitoring && (
                    <Line
                      type="monotone"
                      dataKey="memoryUsage"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                      name="Memory %"
                    />
                  )}
                  {settings.monitoring.enableTemperatureMonitoring && (
                    <Line
                      type="monotone"
                      dataKey="cpuTemp"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                      name="Temp °C"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}

          {/* Disabled message */}
          {((activeTab === 0 && !settings.monitoring.enableCpuMonitoring) ||
            (activeTab === 1 && !settings.monitoring.enableMemoryMonitoring) ||
            (activeTab === 2 &&
              !settings.monitoring.enableTemperatureMonitoring)) && (
            <Alert severity="info" sx={{ mt: 2 }}>
              This monitoring feature is disabled in settings. Enable it in the
              Settings page to view charts.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Real-time Stats Summary */}
      <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <TrendingUp sx={{ color: "#3b82f6" }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#111827" }}>
              Performance Summary
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  backgroundColor: "#f9fafb",
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" sx={{ color: "#6b7280" }}>
                  Average CPU Usage
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#111827" }}
                >
                  {historicalData.length > 0
                    ? (
                        historicalData.reduce((acc, d) => acc + d.cpuUsage, 0) /
                        historicalData.length
                      ).toFixed(1)
                    : "0"}
                  %
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  backgroundColor: "#f9fafb",
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" sx={{ color: "#6b7280" }}>
                  Max Temperature
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#111827" }}
                >
                  {historicalData.length > 0
                    ? Math.max(...historicalData.map((d) => d.cpuTemp)).toFixed(
                        1,
                      )
                    : "0"}
                  °C
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  backgroundColor: "#f9fafb",
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" sx={{ color: "#6b7280" }}>
                  Avg Frequency
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#111827" }}
                >
                  {historicalData.length > 0
                    ? (
                        historicalData.reduce((acc, d) => acc + d.cpuFreq, 0) /
                        historicalData.length
                      ).toFixed(2)
                    : "0"}{" "}
                  GHz
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  backgroundColor: "#f9fafb",
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" sx={{ color: "#6b7280" }}>
                  Memory Pressure
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#111827" }}
                >
                  {memoryUsage > 90
                    ? "High"
                    : memoryUsage > 70
                      ? "Medium"
                      : "Low"}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MetricsPage;
