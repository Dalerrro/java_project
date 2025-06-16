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
  Memory as MemoryIcon
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

const Overview = () => {
  const [liveStats, setLiveStats] = useState(null);
  const [metricsData, setMetricsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Загрузка live статистики
  const fetchLiveStats = () => {
    fetch('http://localhost:8080/status')
      .then(res => res.json())
      .then(data => {
        console.log('Status API Response:', data); // Отладка
        setLiveStats(data);
        setError(null);
      })
      .catch(err => {
        console.error('Error fetching live stats:', err);
        setError('Unable to fetch live statistics');
      });
  };

  // Загрузка исторических метрик
  const fetchMetrics = () => {
    fetch('http://localhost:8080/metrics')
      .then(res => res.json())
      .then(data => {
        console.log('Metrics API Response:', data); // Отладка
        const processedData = data
          .reverse()
          .slice(-24) // Последние 24 точки
          .map((item, index) => {
            const time = new Date(Date.now() - (data.length - 1 - index) * 60 * 1000);
            return {
              ...item,
              time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              memory_usage: Math.round((item.memory_used / item.memory_total) * 100)
            };
          });
        setMetricsData(processedData);
        setError(null);
      })
      .catch(err => {
        console.error('Error fetching metrics:', err);
        setError('Unable to fetch metrics data');
      })
      .finally(() => {
        setLoading(false);
        setLastUpdate(new Date());
      });
  };

  useEffect(() => {
    const loadData = () => {
      fetchLiveStats();
      fetchMetrics();
    };

    loadData();
    const interval = setInterval(loadData, 5000); // Обновляем каждые 5 секунд
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchLiveStats();
    fetchMetrics();
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
              {entry.name}: {Math.round(entry.value)}%
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  if (loading && !liveStats) {
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

  if (error && !liveStats) {
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
  // Берем данные из последней записи metrics для CPU, Memory, Disk
  const latestMetrics = metricsData.length > 0 ? metricsData[metricsData.length - 1] : null;
  
  const cpuUsage = latestMetrics?.cpu || 0;
  const cpuStatus = getMetricStatus(cpuUsage, { warning: 80, critical: 95 });
  
  const memoryUsage = latestMetrics ? Math.round((latestMetrics.memory_used / latestMetrics.memory_total) * 100) : 0;
  const memoryStatus = getMetricStatus(memoryUsage, { warning: 85, critical: 95 });
  
  const diskUsage = latestMetrics?.disk_usage || 0;
  const diskStatus = getMetricStatus(diskUsage, { warning: 80, critical: 90 });

  // Данные из /status для остальных метрик
  const networkUsage = 0; // Пока нет в API
  const temperature = liveStats?.cpu_temp || 0;
  const processes = liveStats?.processes || 0;

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
            System Overview
          </Typography>
          <Typography variant="body1" sx={{ color: '#6b7280' }}>
            Real-time monitoring dashboard
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
            trend={2.3}
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
            trend={-1.2}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Disk Usage"
            value={diskUsage}
            unit="%"
            icon={Storage}
            status={diskStatus}
            progress={diskUsage}
            trend={0.8}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Network"
            value={networkUsage}
            unit="MB/s"
            icon={Wifi}
            status="healthy"
            trend={5.2}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Temperature"
            value={temperature}
            unit="°C"
            icon={Thermostat}
            status={temperature > 75 ? 'warning' : 'healthy'}
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
                  Last 24 hours
                </Typography>
              </Box>

              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={metricsData}>
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
                    dataKey="memory_usage"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Memory"
                  />
                  <Area
                    type="monotone"
                    dataKey="disk_usage"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.6}
                    name="Disk"
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

                {/* Disk Progress */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                      Disk Usage
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                      {diskUsage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={diskUsage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#f3f4f6',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: diskStatus === 'critical' ? '#ef4444' : diskStatus === 'warning' ? '#f59e0b' : '#f59e0b',
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
                        Uptime
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827' }}>
                        {liveStats?.uptime || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Processes
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827' }}>
                        {liveStats?.processes || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        CPU Cores
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827' }}>
                        {liveStats?.logical_cores || 'N/A'} logical
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        CPU Frequency
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827' }}>
                        {liveStats?.cpu_freq ? `${liveStats.cpu_freq.toFixed(2)} GHz` : 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Temperature
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827' }}>
                        {liveStats?.cpu_temp ? `${liveStats.cpu_temp.toFixed(1)}°C` : 'N/A'}
                      </Typography>
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
            Recent Activity
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
                  System monitoring started successfully
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  {new Date().toLocaleString()}
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
                    Active monitoring
                  </Typography>
                </Box>
              </Box>
            )}

            {memoryStatus === 'warning' && (
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
                    High memory usage detected ({memoryUsage.toFixed(1)}%)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    Active monitoring
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