// src/components/AlertsPage.jsx

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Chip,
  IconButton,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { 
  NotificationsActive,
  Telegram,
  Warning,
  CheckCircle,
  Error,
  Computer,
  Memory,
  Thermostat,
  Speed,
  Edit,
  Save,
  Cancel,
  Science,
  History
} from '@mui/icons-material';
import api from '../services/api';
import telegramService from '../services/telegram';

const AlertsPage = () => {
  const [thresholds, setThresholds] = useState({
    cpu: { enabled: true, warning: 80, critical: 95 },
    memory: { enabled: true, warning: 85, critical: 95 },
    temperature: { enabled: true, warning: 70, critical: 85 },
    frequency: { enabled: false, warning: 4.5, critical: 5.0 }
  });

  const [telegramConfig, setTelegramConfig] = useState({
    botToken: telegramService.config.botToken,
    chatId: telegramService.config.chatId,
    enabled: telegramService.config.enabled
  });

  const [currentMetrics, setCurrentMetrics] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [testingBot, setTestingBot] = useState(false);
  const [alertHistory, setAlertHistory] = useState([]);

  useEffect(() => {
    // Получаем текущие метрики для отображения
    const fetchMetrics = async () => {
      try {
        const data = await api.getSystemCurrent();
        setCurrentMetrics({
          cpu: data.currentMetrics.cpuUsage,
          memory: data.currentMetrics.memoryUsagePercent,
          temperature: data.sensorData.cpuTemperature,
          frequency: data.cpuDetails.currentFrequency
        });
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  // Проверяем пороги и отправляем алерты
  useEffect(() => {
    if (!currentMetrics || !telegramConfig.enabled) return;

    Object.entries(thresholds).forEach(([metric, config]) => {
      if (!config.enabled) return;

      const value = currentMetrics[metric];
      const isWarning = value >= config.warning && value < config.critical;
      const isCritical = value >= config.critical;

      if (isWarning || isCritical) {
        const existingAlert = alertHistory.find(
          alert => alert.metric === metric && alert.active
        );

        if (!existingAlert) {
          const newAlert = {
            id: Date.now(),
            metric,
            value,
            threshold: isCritical ? config.critical : config.warning,
            severity: isCritical ? 'critical' : 'warning',
            timestamp: new Date(),
            active: true
          };

          setAlertHistory(prev => [newAlert, ...prev].slice(0, 50));
          
          // Отправляем уведомление в Telegram
          const metricLabel = getMetricLabel(metric);
          const unit = getMetricUnit(metric);
          telegramService.sendAlert(
            `${metricLabel}`,
            `${value.toFixed(1)}${unit}`,
            `${newAlert.threshold}${unit}`,
            newAlert.severity
          );
        }
      }
    });
  }, [currentMetrics, thresholds, alertHistory, telegramConfig.enabled]);

  const handleThresholdChange = (metric, type, value) => {
    setThresholds(prev => ({
      ...prev,
      [metric]: {
        ...prev[metric],
        [type]: parseFloat(value) || 0
      }
    }));
  };

  const handleTestTelegram = async () => {
    setTestingBot(true);
    const result = await telegramService.sendTestMessage();
    
    setTimeout(() => {
      setTestingBot(false);
      if (result.success) {
        alert('Test message sent successfully! Check your Telegram.');
      } else {
        alert(`Failed to send test message: ${result.error}`);
      }
    }, 1000);
  };

  const handleSaveConfig = () => {
    telegramService.updateConfig(telegramConfig);
    setEditMode(false);
  };

  const getMetricIcon = (metric) => {
    switch (metric) {
      case 'cpu': return <Computer />;
      case 'memory': return <Memory />;
      case 'temperature': return <Thermostat />;
      case 'frequency': return <Speed />;
      default: return <Warning />;
    }
  };

  const getMetricUnit = (metric) => {
    switch (metric) {
      case 'cpu': return '%';
      case 'memory': return '%';
      case 'temperature': return '°C';
      case 'frequency': return 'GHz';
      default: return '';
    }
  };

  const getMetricLabel = (metric) => {
    switch (metric) {
      case 'cpu': return 'CPU Usage';
      case 'memory': return 'Memory Usage';
      case 'temperature': return 'CPU Temperature';
      case 'frequency': return 'CPU Frequency';
      default: return metric;
    }
  };

  const ThresholdCard = ({ metric, config }) => {
    const current = currentMetrics?.[metric] || 0;
    const isWarning = current >= config.warning && current < config.critical;
    const isCritical = current >= config.critical;
    const unit = getMetricUnit(metric);

    return (
      <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  p: 1,
                  backgroundColor: isCritical ? '#fef2f2' : isWarning ? '#fffbeb' : '#f0fdf4',
                  borderRadius: 2,
                  border: `1px solid ${isCritical ? '#fecaca' : isWarning ? '#fed7aa' : '#bbf7d0'}`
                }}
              >
                {React.cloneElement(getMetricIcon(metric), { 
                  sx: { 
                    color: isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981',
                    fontSize: '1.25rem' 
                  } 
                })}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                {getMetricLabel(metric)}
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={config.enabled}
                  onChange={(e) => setThresholds(prev => ({
                    ...prev,
                    [metric]: { ...prev[metric], enabled: e.target.checked }
                  }))}
                  size="small"
                />
              }
              label=""
            />
          </Box>

          {/* Current Value */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Current Value
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                {current.toFixed(1)}{unit}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (current / config.critical) * 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#e5e7eb',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981',
                  borderRadius: 4
                }
              }}
            />
          </Box>

          {/* Thresholds */}
          {config.enabled && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Warning"
                  type="number"
                  size="small"
                  fullWidth
                  value={config.warning}
                  onChange={(e) => handleThresholdChange(metric, 'warning', e.target.value)}
                  disabled={!editMode}
                  InputProps={{
                    endAdornment: <Typography variant="caption" sx={{ color: '#6b7280' }}>{unit}</Typography>
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Critical"
                  type="number"
                  size="small"
                  fullWidth
                  value={config.critical}
                  onChange={(e) => handleThresholdChange(metric, 'critical', e.target.value)}
                  disabled={!editMode}
                  InputProps={{
                    endAdornment: <Typography variant="caption" sx={{ color: '#6b7280' }}>{unit}</Typography>
                  }}
                />
              </Grid>
            </Grid>
          )}

          {/* Status */}
          {config.enabled && (
            <Box sx={{ mt: 2 }}>
              {isCritical && (
                <Chip
                  icon={<Error />}
                  label="Critical threshold exceeded"
                  size="small"
                  color="error"
                  sx={{ width: '100%' }}
                />
              )}
              {isWarning && !isCritical && (
                <Chip
                  icon={<Warning />}
                  label="Warning threshold exceeded"
                  size="small"
                  color="warning"
                  sx={{ width: '100%' }}
                />
              )}
              {!isWarning && !isCritical && (
                <Chip
                  icon={<CheckCircle />}
                  label="Within normal range"
                  size="small"
                  color="success"
                  sx={{ width: '100%' }}
                />
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
            Alerts & Notifications
          </Typography>
          <Typography variant="body1" sx={{ color: '#6b7280' }}>
            Configure thresholds and Telegram notifications
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {editMode ? (
            <>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => setEditMode(false)}
                sx={{ borderColor: '#d1d5db', color: '#374151' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveConfig}
                sx={{ backgroundColor: '#3b82f6' }}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setEditMode(true)}
              sx={{ backgroundColor: '#3b82f6' }}
            >
              Edit Thresholds
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Thresholds */}
        <Grid item xs={12} lg={8}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>
            Alert Thresholds
          </Typography>
          <Grid container spacing={3}>
            {Object.entries(thresholds).map(([metric, config]) => (
              <Grid item xs={12} sm={6} key={metric}>
                <ThresholdCard metric={metric} config={config} />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Right Column - Telegram & History */}
        <Grid item xs={12} lg={4}>
          {/* Telegram Configuration */}
          <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Telegram sx={{ color: '#0088cc' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                  Telegram Bot
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={telegramConfig.enabled}
                    onChange={(e) => setTelegramConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                  />
                }
                label="Enable Telegram notifications"
                sx={{ mb: 2 }}
              />

              {telegramConfig.enabled && (
                <>
                  <TextField
                    fullWidth
                    size="small"
                    label="Bot Token"
                    value={telegramConfig.botToken}
                    onChange={(e) => setTelegramConfig(prev => ({ ...prev, botToken: e.target.value }))}
                    disabled={!editMode}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Chat ID"
                    value={telegramConfig.chatId}
                    onChange={(e) => setTelegramConfig(prev => ({ ...prev, chatId: e.target.value }))}
                    disabled={!editMode}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Science />}
                    onClick={handleTestTelegram}
                    disabled={testingBot}
                  >
                    {testingBot ? 'Sending Test...' : 'Send Test Message'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <History sx={{ color: '#6b7280' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                  Recent Alerts
                </Typography>
              </Box>

              {alertHistory.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  No alerts triggered yet
                </Alert>
              ) : (
                <List sx={{ p: 0 }}>
                  {alertHistory.slice(0, 5).map((alert) => (
                    <ListItem
                      key={alert.id}
                      sx={{
                        px: 0,
                        py: 1.5,
                        borderBottom: '1px solid #e5e7eb',
                        '&:last-child': { borderBottom: 'none' }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {React.cloneElement(getMetricIcon(alert.metric), {
                          sx: {
                            color: alert.severity === 'critical' ? '#ef4444' : '#f59e0b',
                            fontSize: '1.25rem'
                          }
                        })}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {getMetricLabel(alert.metric)} - {alert.value.toFixed(1)}{getMetricUnit(alert.metric)}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            {alert.timestamp.toLocaleTimeString()}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={alert.severity}
                          size="small"
                          color={alert.severity === 'critical' ? 'error' : 'warning'}
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AlertsPage;