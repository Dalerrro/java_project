// src/components/Sidebar.jsx

import React, { useEffect, useState } from 'react';
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
  LinearProgress
} from '@mui/material';
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
  Memory
} from '@mui/icons-material';
import api from '../services/api';

const Sidebar = ({ activeTab, setActiveTab }) => {
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
        console.error('Error fetching status:', err);
        setSystemStatus({ status: 'error' });
        setLoading(false);
      }
    };

    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 30000); // Обновляем каждые 30 секунд
    return () => clearInterval(interval);
  }, []);

  const navigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart,
      description: 'System dashboard'
    },
    {
      id: 'metrics',
      label: 'Metrics',
      icon: Timeline,
      description: 'Detailed charts'
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: NotificationsActive,
      description: 'Notifications'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Configuration'
    }
  ];

  const getSystemStatusInfo = () => {
    if (!systemStatus || loading) {
      return {
        status: 'loading',
        color: '#6b7280',
        icon: Computer,
        text: 'Loading...',
        uptime: 'N/A',
        processes: 'N/A',
        cpuUsage: 0,
        memoryUsage: 0,
        temperature: 0
      };
    }

    if (systemStatus.status === 'error') {
      return {
        status: 'error',
        color: '#ef4444',
        icon: ErrorIcon,
        text: 'Connection error',
        uptime: 'N/A',
        processes: 'N/A',
        cpuUsage: 0,
        memoryUsage: 0,
        temperature: 0
      };
    }

    const cpuUsage = systemStatus.currentMetrics?.cpuUsage || 0;
    const memoryUsage = systemStatus.currentMetrics?.memoryUsagePercent || 0;
    const temperature = systemStatus.sensorData?.cpuTemperature || 0;
    const processes = systemStatus.staticInfo?.processes || 0;
    const uptime = systemStatus.staticInfo?.uptime || 'N/A';

    // Определяем общий статус на основе метрик
    const cpuHigh = cpuUsage > 80;
    const memoryHigh = memoryUsage > 85;
    const tempHigh = temperature > 75;

    if (cpuHigh || memoryHigh || tempHigh) {
      return {
        status: 'warning',
        color: '#f59e0b',
        icon: Warning,
        text: 'Attention needed',
        uptime,
        processes,
        cpuUsage,
        memoryUsage,
        temperature
      };
    }

    return {
      status: 'healthy',
      color: '#10b981',
      icon: CheckCircle,
      text: 'All systems operational',
      uptime,
      processes,
      cpuUsage,
      memoryUsage,
      temperature
    };
  };

  const statusInfo = getSystemStatusInfo();

  return (
    <Box
      sx={{
        width: 280,
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Navigation */}
      <Box sx={{ p: 3, flex: 1 }}>
        <List sx={{ gap: 1, display: 'flex', flexDirection: 'column' }}>
          {navigationItems.map((item) => (
            <ListItemButton
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                py: 1.5,
                px: 2,
                backgroundColor: activeTab === item.id ? '#eff6ff' : 'transparent',
                border: activeTab === item.id ? '1px solid #bfdbfe' : '1px solid transparent',
                color: activeTab === item.id ? '#1d4ed8' : '#6b7280',
                '&:hover': {
                  backgroundColor: activeTab === item.id ? '#eff6ff' : '#f9fafb',
                }
              }}
            >
              <ListItemIcon 
                sx={{ 
                  minWidth: 40,
                  color: activeTab === item.id ? '#3b82f6' : '#9ca3af'
                }}
              >
                <item.icon />
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                secondary={item.description}
                primaryTypographyProps={{
                  fontWeight: activeTab === item.id ? 600 : 500,
                  fontSize: '0.95rem'
                }}
                secondaryTypographyProps={{
                  fontSize: '0.75rem',
                  color: '#9ca3af'
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Divider />

      {/* System Status Card */}
      <Box sx={{ p: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            backgroundColor: statusInfo.status === 'healthy' ? '#f0fdf4' : 
                            statusInfo.status === 'warning' ? '#fffbeb' : 
                            statusInfo.status === 'error' ? '#fef2f2' : '#f9fafb',
            border: `1px solid ${
              statusInfo.status === 'healthy' ? '#bbf7d0' :
              statusInfo.status === 'warning' ? '#fed7aa' : 
              statusInfo.status === 'error' ? '#fecaca' : '#e5e7eb'
            }`,
            borderRadius: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <statusInfo.icon 
              sx={{ 
                fontSize: '1.25rem',
                color: statusInfo.color
              }} 
            />
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600,
                color: statusInfo.color,
                fontSize: '0.875rem'
              }}
            >
              System Status
            </Typography>
          </Box>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: statusInfo.status === 'healthy' ? '#166534' :
                     statusInfo.status === 'warning' ? '#92400e' : 
                     statusInfo.status === 'error' ? '#991b1b' : '#374151',
              fontSize: '0.8rem',
              mb: 1.5,
              fontWeight: 500
            }}
          >
            {statusInfo.text}
          </Typography>
          
          {statusInfo.status !== 'error' && !loading && (
            <>
              {/* Quick Metrics */}
              <Box sx={{ mb: 2 }}>
                {/* CPU Usage */}
                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Computer sx={{ fontSize: '0.875rem', color: '#6b7280' }} />
                      <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                        CPU
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#374151', fontSize: '0.75rem', fontWeight: 600 }}>
                      {statusInfo.cpuUsage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={statusInfo.cpuUsage} 
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: '#e5e7eb',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: statusInfo.cpuUsage > 80 ? '#ef4444' : 
                                       statusInfo.cpuUsage > 60 ? '#f59e0b' : '#10b981',
                        borderRadius: 2
                      }
                    }}
                  />
                </Box>

                {/* Memory Usage */}
                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Memory sx={{ fontSize: '0.875rem', color: '#6b7280' }} />
                      <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                        Memory
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#374151', fontSize: '0.75rem', fontWeight: 600 }}>
                      {statusInfo.memoryUsage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={statusInfo.memoryUsage} 
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: '#e5e7eb',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: statusInfo.memoryUsage > 85 ? '#ef4444' : 
                                       statusInfo.memoryUsage > 70 ? '#f59e0b' : '#10b981',
                        borderRadius: 2
                      }
                    }}
                  />
                </Box>

                {/* Temperature */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Thermostat sx={{ fontSize: '0.875rem', color: '#6b7280' }} />
                      <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                        Temp
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#374151', fontSize: '0.75rem', fontWeight: 600 }}>
                      {statusInfo.temperature.toFixed(1)}°C
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(100, (statusInfo.temperature / 100) * 100)} 
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: '#e5e7eb',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: statusInfo.temperature > 75 ? '#ef4444' : 
                                       statusInfo.temperature > 60 ? '#f59e0b' : '#10b981',
                        borderRadius: 2
                      }
                    }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 1.5 }} />

              {/* Additional Info */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                    Uptime
                  </Typography>
                  <Chip
                    label={statusInfo.uptime}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      backgroundColor: 'rgba(107, 114, 128, 0.1)',
                      color: '#374151',
                      border: 'none'
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                    Processes
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#374151', fontSize: '0.75rem', fontWeight: 500 }}>
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