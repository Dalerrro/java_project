// src/components/MetricsPage.jsx

import React, { useState, useEffect } from 'react';
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
  Skeleton
} from '@mui/material';
import { 
  Timeline,
  Computer,
  Memory,
  Thermostat,
  Speed,
  Bolt,
  TrendingUp
} from '@mui/icons-material';
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
  Cell
} from 'recharts';
import api from '../services/api';

const MetricsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [cpuData, setCpuData] = useState(null);
  const [memoryData, setMemoryData] = useState(null);
  const [sensorData, setSensorData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [cpu, memory, sensors] = await Promise.all([
        api.getCPUInfo(),
        api.getMemoryInfo(),
        api.getSensorInfo()
      ]);

      setCpuData(cpu);
      setMemoryData(memory);
      setSensorData(sensors);

      // Добавляем точку в исторические данные
      const point = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cpuUsage: cpu.usage,
        cpuFreq: cpu.currentFrequency,
        memoryUsage: memory.usagePercent,
        memoryUsed: memory.usedMemory,
        memoryTotal: memory.totalMemory,
        cpuTemp: sensors.cpuTemperature,
        cpuVoltage: sensors.cpuVoltage,
        timestamp: Date.now()
      };

      setHistoricalData(prev => {
        const newData = [...prev, point];
        // Оставляем только последние 100 точек
        return newData.slice(-100);
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError('Failed to load metrics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); // Обновляем каждые 2 секунды
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'white',
            p: 2,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e5e7eb'
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 1, display: 'block' }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                color: entry.color,
                fontSize: '0.85rem',
                fontWeight: 500
              }}
            >
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value} {entry.unit || ''}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  const StatCard = ({ title, value, unit, icon: Icon, color, subtitle }) => (
    <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              backgroundColor: `${color}15`,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Icon sx={{ color: color, fontSize: '1.5rem' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
              {value} <Typography component="span" variant="body2" sx={{ color: '#6b7280' }}>{unit}</Typography>
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading && historicalData.length === 0) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
            Detailed Metrics
          </Typography>
          <Typography variant="body1" sx={{ color: '#6b7280' }}>
            Real-time system performance analytics
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error && !cpuData) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
            Detailed Metrics
          </Typography>
        </Box>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Подготовка данных для pie chart памяти
  const memoryPieData = memoryData ? [
    { name: 'Used', value: (memoryData.usedMemory / 1024 / 1024 / 1024).toFixed(1), fill: '#3b82f6' },
    { name: 'Available', value: (memoryData.availableMemory / 1024 / 1024 / 1024).toFixed(1), fill: '#e5e7eb' }
  ] : [];

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
          Detailed Metrics
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280' }}>
          Real-time system graphics performance 
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="CPU Usage"
            value={cpuData?.usage?.toFixed(1) || '0'}
            unit="%"
            icon={Computer}
            color="#3b82f6"
            subtitle={`${cpuData?.physicalCores || 0} cores / ${cpuData?.logicalCores || 0} threads`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="CPU Frequency"
            value={cpuData?.currentFrequency?.toFixed(2) || '0'}
            unit="GHz"
            icon={Speed}
            color="#10b981"
            subtitle={cpuData?.boostActive ? 'Turbo Boost Active' : 'Base Frequency'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Memory Usage"
            value={memoryData?.usagePercent?.toFixed(1) || '0'}
            unit="%"
            icon={Memory}
            color="#f59e0b"
            subtitle={`${(memoryData?.usedMemory / 1024 / 1024 / 1024)?.toFixed(1) || 0} / ${(memoryData?.totalMemory / 1024 / 1024 / 1024)?.toFixed(1) || 0} GB`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="CPU Temperature"
            value={sensorData?.cpuTemperature?.toFixed(1) || '0'}
            unit="°C"
            icon={Thermostat}
            color="#ef4444"
            subtitle={sensorData?.cpuTemperature > 70 ? 'High temperature' : 'Normal range'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="CPU Voltage"
            value={sensorData?.cpuVoltage?.toFixed(2) || '0'}
            unit="V"
            icon={Bolt}
            color="#8b5cf6"
            subtitle="Core voltage"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="CPU Model"
            value={cpuData?.vendor || 'Unknown'}
            unit=""
            icon={Computer}
            color="#6366f1"
            subtitle={cpuData?.name || 'N/A'}
          />
        </Grid>
      </Grid>

      {/* Tabs for different metrics */}
      <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="CPU Performance" />
            <Tab label="Memory Usage" />
            <Tab label="Thermal & Power" />
            <Tab label="Combined View" />
          </Tabs>

          {/* CPU Performance Tab */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#111827' }}>
                CPU Usage & Frequency Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
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
          {activeTab === 1 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#111827' }}>
                    Memory Usage Trend
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#6b7280"
                        fontSize={12}
                      />
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
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#111827' }}>
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
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#111827' }}>
                Temperature & Voltage Monitoring
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
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
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#111827' }}>
                All Metrics Combined
              </Typography>
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cpuUsage"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="CPU %"
                  />
                  <Line
                    type="monotone"
                    dataKey="memoryUsage"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    name="Memory %"
                  />
                  <Line
                    type="monotone"
                    dataKey="cpuTemp"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    name="Temp °C"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Real-time Stats Summary */}
      <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <TrendingUp sx={{ color: '#3b82f6' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
              Performance Summary
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f9fafb', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  Average CPU Usage
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                  {historicalData.length > 0 
                    ? (historicalData.reduce((acc, d) => acc + d.cpuUsage, 0) / historicalData.length).toFixed(1)
                    : '0'}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f9fafb', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  Max Temperature
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                  {historicalData.length > 0 
                    ? Math.max(...historicalData.map(d => d.cpuTemp)).toFixed(1)
                    : '0'}°C
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f9fafb', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  Avg Frequency
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                  {historicalData.length > 0 
                    ? (historicalData.reduce((acc, d) => acc + d.cpuFreq, 0) / historicalData.length).toFixed(2)
                    : '0'} GHz
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f9fafb', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  Memory Pressure
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                  {memoryData?.usagePercent > 90 ? 'High' : memoryData?.usagePercent > 70 ? 'Medium' : 'Low'}
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