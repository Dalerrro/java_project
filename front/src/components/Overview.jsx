// src/components/Overview.jsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Skeleton,
  Alert,
  Chip,
  IconButton
} from '@mui/material';
import {
  Computer,
  Storage,
  Wifi,
  Thermostat,
  TrendingUp,
  TrendingDown,
  Refresh,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Memory as MemoryIcon,
  Speed,
  Bolt
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import api from '../services/api';

const Overview = () => {
  const [systemData, setSystemData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Загрузка данных системы
  const fetchSystemData = async () => {
    try {
      const data = await api.getSystemCurrent();
      setSystemData(data);
      
      // Добавляем точку в исторические данные
      const point = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cpu: data.currentMetrics.cpuUsage,
        memory: data.currentMetrics.memoryUsagePercent,
        timestamp: Date.now()
      };
      
      setHistoricalData(prev => {
        const newData = [...prev, point];
        // Оставляем только последние 50 точек
        return newData.slice(-50);
      });
      
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching system data:', err);
      setError('Unable to fetch system data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
    const interval = setInterval(fetchSystemData, 5000); // Обновляем каждые 5 секунд
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchSystemData();
  };

  // Компонент карточки метрики
  const MetricCard = ({ title, value, unit, icon: Icon, color, status, trend, progress }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'healthy': return '#10b981';
        case 'warning': return '#f59e0b';
        case 'critical': return '#ef4444';
        default: return '#6b7280';
      }
    };

    const getBackgroundColor = (status) => {
      switch (status) {
        case 'healthy': return '#f0fdf4';
        case 'warning': return '#fffbeb';
        case 'critical': return '#fef2f2';
        default: return '#f9fafb';
      }
    };

    const getBorderColor = (status) => {
      switch (status) {
        case 'healthy': return '#bbf7d0';
        case 'warning': return '#fed7aa';
        case 'critical': return '#fecaca';
        default: return '#e5e7eb';
      }
    };

    return (
      <Card
        elevation={0}
        sx={{
          backgroundColor: getBackgroundColor(status),
          border: `1px solid ${getBorderColor(status)}`,
          borderRadius: 3,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  p: 1.5,
                  backgroundColor: 'white',
                  borderRadius: 2,
                  border: `1px solid ${getBorderColor(status)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon sx={{ color: getStatusColor(status), fontSize: '1.5rem' }} />
              </Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: '0.95rem'
                }}
              >
                {title}
              </Typography>
            </Box>

            {/* Status indicator */}
            {status === 'healthy' && <CheckCircle sx={{ color: '#10b981', fontSize: '1.25rem' }} />}
            {status === 'warning' && <Warning sx={{ color: '#f59e0b', fontSize: '1.25rem' }} />}
            {status === 'critical' && <ErrorIcon sx={{ color: '#ef4444', fontSize: '1.25rem' }} />}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#111827',
                fontSize: '2rem'
              }}
            >
              {typeof value === 'number' ? value.toFixed(1) : value}
            </Typography>
            {unit && (
              <Typography
                variant="body2"
                sx={{
                  color: '#6b7280',
                  fontSize: '1rem',
                  fontWeight: 500
                }}
              >
                {unit}
              </Typography>
            )}
          </Box>

          {progress !== undefined && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getStatusColor(status),
                    borderRadius: 4
                  }
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: '#6b7280',
                  fontSize: '0.75rem',
                  mt: 1,
                  display: 'block',
                  textAlign: 'right'
                }}
              >
                {progress.toFixed(1)}% used
              </Typography>
            </Box>
          )}

          {trend !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {trend >= 0 ? (
                <TrendingUp sx={{ color: '#10b981', fontSize: '1rem' }} />
              ) : (
                <TrendingDown sx={{ color: '#ef4444', fontSize: '1rem' }} />
              )}
              <Typography
                variant="caption"
                sx={{
                  color: trend >= 0 ? '#10b981' : '#ef4444',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                {Math.abs(trend).toFixed(1)}% from last hour
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  // Custom Tooltip для графиков
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
              {entry.name}: {entry.value.toFixed(1)}%
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  if (loading && !systemData) {
    return (
      <Box sx={{ p: 2 }}>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error && !systemData) {
    return (
      <Alert
        severity="error"
        action={
          <IconButton size="small" color="inherit" onClick={handleRefresh}>
            <Refresh />
          </IconButton>
        }
        sx={{ m: 2 }}
      >
        {error}
      </Alert>
    );
  }

  const getMetricStatus = (value, thresholds) => {
    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.warning) return 'warning';
    return 'healthy';
  };

  // Определяем статусы для каждой метрики
  const cpuUsage = systemData?.currentMetrics?.cpuUsage || 0;
  const cpuStatus = getMetricStatus(cpuUsage, { warning: 80, critical: 95 });
  
  const memoryUsage = systemData?.currentMetrics?.memoryUsagePercent || 0;
  const memoryStatus = getMetricStatus(memoryUsage, { warning: 85, critical: 95 });
  
  const temperature = systemData?.sensorData?.cpuTemperature || 0;
  const tempStatus = getMetricStatus(temperature, { warning: 70, critical: 85 });

  const cpuFrequency = systemData?.cpuDetails?.currentFrequency || 0;
  const processes = systemData?.staticInfo?.processes || 0;
  const cpuVoltage = systemData?.sensorData?.cpuVoltage || 0;

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
            System Overview
          </Typography>
          <Typography variant="body1" sx={{ color: '#6b7280' }}>
            Real-time monitoring dashboard with OSHI
          </Typography>
        </Box>
        <Chip
          label={`Last updated: ${lastUpdate.toLocaleTimeString()}`}
          variant="outlined"
          sx={{ borderColor: '#d1d5db', color: '#6b7280' }}
        />
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="CPU Usage"
            value={cpuUsage}
            unit="%"
            icon={Computer}
            status={cpuStatus}
            progress={cpuUsage}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Memory Usage"
            value={memoryUsage}
            unit="%"
            icon={MemoryIcon}
            status={memoryStatus}
            progress={memoryUsage}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="CPU Temperature"
            value={temperature}
            unit="°C"
            icon={Thermostat}
            status={tempStatus}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="CPU Frequency"
            value={cpuFrequency}
            unit="GHz"
            icon={Speed}
            status="healthy"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="CPU Voltage"
            value={cpuVoltage}
            unit="V"
            icon={Bolt}
            status="healthy"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Processes"
            value={processes}
            icon={Computer}
            status="healthy"
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Main Area Chart */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                  Resource Usage Trends
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Live monitoring
                </Typography>
              </Box>

              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9ca3af" 
                    fontSize={12}
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    fontSize={12}
                    tick={{ fill: '#6b7280' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="CPU"
                  />
                  <Area
                    type="monotone"
                    dataKey="memory"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Memory"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* System Info Sidebar */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 3 }}>
                System Information
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* CPU Progress */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                      CPU Usage
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                      {cpuUsage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={cpuUsage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#f3f4f6',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: cpuStatus === 'critical' ? '#ef4444' : cpuStatus === 'warning' ? '#f59e0b' : '#3b82f6',
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>

                {/* Memory Progress */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                      Memory Usage
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                      {memoryUsage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={memoryUsage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#f3f4f6',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: memoryStatus === 'critical' ? '#ef4444' : memoryStatus === 'warning' ? '#f59e0b' : '#10b981',
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>

                {/* System Details */}
                <Box sx={{ pt: 2, borderTop: '1px solid #e5e7eb' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>
                    System Details
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        OS
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827' }}>
                        {systemData?.staticInfo?.osName || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Uptime
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827' }}>
                        {systemData?.staticInfo?.uptime || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        CPU Model
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap',
                        maxWidth: '200px'
                      }}>
                        {systemData?.cpuDetails?.name || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        CPU Cores
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827' }}>
                        {systemData?.staticInfo?.physicalCores || 0} / {systemData?.staticInfo?.logicalCores || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Total Memory
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827' }}>
                        {systemData?.currentMetrics?.memoryTotal 
                          ? `${(systemData.currentMetrics.memoryTotal / 1024 / 1024 / 1024).toFixed(1)} GB`
                          : 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Turbo Boost
                      </Typography>
                      <Chip 
                        label={systemData?.cpuDetails?.boostActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={systemData?.cpuDetails?.boostActive ? 'success' : 'default'}
                        sx={{ height: 20, fontSize: '0.75rem' }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 3 }}>
            System Status
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                p: 2,
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 2
              }}
            >
              <CheckCircle sx={{ color: '#10b981', fontSize: '1.25rem', mt: 0.25 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827' }}>
                  System monitoring active
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  OSHI library connected successfully
                </Typography>
              </Box>
            </Box>

            {cpuStatus === 'warning' && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  p: 2,
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fed7aa',
                  borderRadius: 2
                }}
              >
                <Warning sx={{ color: '#f59e0b', fontSize: '1.25rem', mt: 0.25 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827' }}>
                    High CPU usage detected ({cpuUsage.toFixed(1)}%)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    Consider checking running processes
                  </Typography>
                </Box>
              </Box>
            )}

            {tempStatus === 'warning' && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  p: 2,
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fed7aa',
                  borderRadius: 2
                }}
              >
                <Warning sx={{ color: '#f59e0b', fontSize: '1.25rem', mt: 0.25 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827' }}>
                    High CPU temperature ({temperature.toFixed(1)}°C)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    Check system cooling
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Overview;