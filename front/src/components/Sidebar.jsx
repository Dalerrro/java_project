
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
  Divider
} from '@mui/material';
import {
  BarChart,
  Timeline,
  NotificationsActive,
  Settings,
  CheckCircle,
  Warning,
  Error,
  Computer
} from '@mui/icons-material';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    // Получаем статус системы для отображения в сайдбаре
    const fetchSystemStatus = () => {
      fetch('http://localhost:8080/status')
        .then(res => res.json())
        .then(data => {
          setSystemStatus(data);
        })
        .catch(err => {
          console.error('Error fetching status:', err);
          setSystemStatus({ status: 'error' });
        });
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
    if (!systemStatus) {
      return {
        status: 'loading',
        color: '#6b7280',
        icon: Computer,
        text: 'Loading...',
        uptime: 'N/A'
      };
    }

    // Определяем общий статус на основе метрик
    const cpuHigh = systemStatus.cpu_usage > 80;
    const memoryHigh = systemStatus.memory_used / systemStatus.memory_total > 0.85;
    const diskHigh = systemStatus.disk_usage > 90;
    const tempHigh = systemStatus.cpu_temp > 75;

    if (cpuHigh || memoryHigh || diskHigh || tempHigh) {
      return {
        status: 'warning',
        color: '#f59e0b',
        icon: Warning,
        text: 'Attention needed',
        uptime: systemStatus.uptime || 'N/A'
      };
    }

    return {
      status: 'healthy',
      color: '#10b981',
      icon: CheckCircle,
      text: 'All systems operational',
      uptime: systemStatus.uptime || 'N/A'
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
                            statusInfo.status === 'warning' ? '#fffbeb' : '#f9fafb',
            border: `1px solid ${
              statusInfo.status === 'healthy' ? '#bbf7d0' :
              statusInfo.status === 'warning' ? '#fed7aa' : '#e5e7eb'
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
                     statusInfo.status === 'warning' ? '#92400e' : '#374151',
              fontSize: '0.8rem',
              mb: 1.5,
              fontWeight: 500
            }}
          >
            {statusInfo.text}
          </Typography>
          
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
            
            {systemStatus && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                  Processes
                </Typography>
                <Typography variant="caption" sx={{ color: '#374151', fontSize: '0.75rem', fontWeight: 500 }}>
                  {systemStatus.processes || 'N/A'}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Sidebar;