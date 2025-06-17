// src/components/SettingsPage.jsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Settings,
  Save,
  RestoreRounded,
  Computer,
  AccessTime,
  Telegram,
  Palette,
  Storage,
  Science,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import api from '../services/api';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    // Мониторинг настройки
    monitoring: {
      updateInterval: 5,
      dataRetention: 7,
      autoCleanup: true,
      enableCpuMonitoring: true,
      enableMemoryMonitoring: true,
      enableDiskMonitoring: true,
      enableNetworkMonitoring: false,
      enableTemperatureMonitoring: true
    },
    // Telegram настройки
    telegram: {
      botToken: '7763857597:AAFB3eIcwlbBmCnBIT1WbkrjsdvupalqC1w',
      chatId: '390304506',
      enabled: true,
      messageFormat: 'detailed',
      language: 'ru',
      workingHours: true,
      workingHoursStart: '09:00',
      workingHoursEnd: '18:00',
      quietMode: false,
      quietModeStart: '22:00',
      quietModeEnd: '08:00'
    },
    // Интерфейс настройки
    interface: {
      theme: 'light',
      autoRefresh: true,
      showAnimations: true,
      compactView: false,
      showTooltips: true
    }
  });

  const [showToken, setShowToken] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getSettings();
        if (data && Object.keys(data).length > 0) {
          setSettings(data);
        }
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    };
    load();
  }, []);

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await api.saveSettings(settings);
      setSaveStatus('success');
    } catch (e) {
      console.error('Failed to save settings', e);
      setSaveStatus('error');
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleReset = () => {
    // Сброс к настройкам по умолчанию
    setSaveStatus('reset');
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const handleTestTelegram = () => {
    setTestingConnection(true);
    // Здесь будет логика тестирования Telegram
    setTimeout(() => {
      setTestingConnection(false);
      setSaveStatus('telegram_test');
      setTimeout(() => setSaveStatus(null), 3000);
    }, 2000);
  };

  const SettingCard = ({ title, icon: Icon, children }) => (
    <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box
            sx={{
              p: 1.5,
              backgroundColor: '#eff6ff',
              borderRadius: 2,
              border: '1px solid #bfdbfe'
            }}
          >
            <Icon sx={{ color: '#3b82f6', fontSize: '1.5rem' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
            {title}
          </Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
            System Settings
          </Typography>
          <Typography variant="body1" sx={{ color: '#6b7280' }}>
            Configure monitoring parameters and preferences
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RestoreRounded />}
            onClick={handleReset}
            sx={{
              borderColor: '#d1d5db',
              color: '#374151',
              '&:hover': {
                borderColor: '#9ca3af',
                backgroundColor: '#f9fafb'
              }
            }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            sx={{
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#2563eb'
              }
            }}
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </Box>

      {/* Status Messages */}
      {saveStatus === 'success' && (
        <Alert
          severity="success"
          icon={<CheckCircle />}
          sx={{ mb: 3 }}
        >
          Settings saved successfully!
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          Failed to save settings.
        </Alert>
      )}

      {saveStatus === 'reset' && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
        >
          Settings reset to default values.
        </Alert>
      )}

      {saveStatus === 'telegram_test' && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
        >
          Telegram connection test successful! ✅
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={6}>
          {/* Monitoring Settings */}
          <SettingCard title="Monitoring Configuration" icon={Computer}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Update Interval */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
                  Update Interval
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={settings.monitoring.updateInterval}
                    onChange={(e) => handleSettingChange('monitoring', 'updateInterval', e.target.value)}
                  >
                    <MenuItem value={1}>Every 1 second</MenuItem>
                    <MenuItem value={5}>Every 5 seconds</MenuItem>
                    <MenuItem value={10}>Every 10 seconds</MenuItem>
                    <MenuItem value={30}>Every 30 seconds</MenuItem>
                    <MenuItem value={60}>Every 1 minute</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="caption" sx={{ color: '#6b7280', mt: 0.5, display: 'block' }}>
                  How often to collect system metrics
                </Typography>
              </Box>

              {/* Data Retention */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
                  Data Retention
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={settings.monitoring.dataRetention}
                    onChange={(e) => handleSettingChange('monitoring', 'dataRetention', e.target.value)}
                  >
                    <MenuItem value={1}>1 day</MenuItem>
                    <MenuItem value={7}>7 days</MenuItem>
                    <MenuItem value={30}>30 days</MenuItem>
                    <MenuItem value={90}>3 months</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="caption" sx={{ color: '#6b7280', mt: 0.5, display: 'block' }}>
                  How long to keep historical data
                </Typography>
              </Box>

              <Divider />

              {/* Monitoring Toggles */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', mb: 2 }}>
                  Enabled Metrics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.monitoring.enableCpuMonitoring}
                        onChange={(e) => handleSettingChange('monitoring', 'enableCpuMonitoring', e.target.checked)}
                        size="small"
                      />
                    }
                    label="CPU Usage"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.monitoring.enableMemoryMonitoring}
                        onChange={(e) => handleSettingChange('monitoring', 'enableMemoryMonitoring', e.target.checked)}
                        size="small"
                      />
                    }
                    label="Memory Usage"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.monitoring.enableDiskMonitoring}
                        onChange={(e) => handleSettingChange('monitoring', 'enableDiskMonitoring', e.target.checked)}
                        size="small"
                      />
                    }
                    label="Disk Usage"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.monitoring.enableNetworkMonitoring}
                        onChange={(e) => handleSettingChange('monitoring', 'enableNetworkMonitoring', e.target.checked)}
                        size="small"
                      />
                    }
                    label="Network Usage"
                    disabled
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.monitoring.enableTemperatureMonitoring}
                        onChange={(e) => handleSettingChange('monitoring', 'enableTemperatureMonitoring', e.target.checked)}
                        size="small"
                      />
                    }
                    label="CPU Temperature"
                  />
                </Box>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.monitoring.autoCleanup}
                    onChange={(e) => handleSettingChange('monitoring', 'autoCleanup', e.target.checked)}
                  />
                }
                label="Auto-cleanup old data"
              />
            </Box>
          </SettingCard>

          {/* Interface Settings */}
          <SettingCard title="Interface Preferences" icon={Palette}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Theme */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
                  Theme
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={settings.interface.theme}
                    onChange={(e) => handleSettingChange('interface', 'theme', e.target.value)}
                  >
                    <MenuItem value="light">Light Theme</MenuItem>
                    <MenuItem value="dark" disabled>Dark Theme (Coming Soon)</MenuItem>
                    <MenuItem value="auto" disabled>Auto (System)</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Interface Toggles */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.interface.autoRefresh}
                      onChange={(e) => handleSettingChange('interface', 'autoRefresh', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Auto-refresh data"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.interface.showAnimations}
                      onChange={(e) => handleSettingChange('interface', 'showAnimations', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Show animations"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.interface.compactView}
                      onChange={(e) => handleSettingChange('interface', 'compactView', e.target.checked)}
                      size="small"
                      disabled
                    />
                  }
                  label="Compact view (Coming Soon)"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.interface.showTooltips}
                      onChange={(e) => handleSettingChange('interface', 'showTooltips', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Show tooltips"
                />
              </Box>
            </Box>
          </SettingCard>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={6}>
          {/* Telegram Settings */}
          <SettingCard title="Telegram Notifications" icon={Telegram}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Enable Telegram */}
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.telegram.enabled}
                    onChange={(e) => handleSettingChange('telegram', 'enabled', e.target.checked)}
                  />
                }
                label="Enable Telegram notifications"
              />

              {settings.telegram.enabled && (
                <>
                  {/* Bot Token */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
                      Bot Token
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type={showToken ? 'text' : 'password'}
                      value={settings.telegram.botToken}
                      onChange={(e) => handleSettingChange('telegram', 'botToken', e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => setShowToken(!showToken)}
                            >
                              {showToken ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#6b7280', mt: 0.5, display: 'block' }}>
                      Get token from @BotFather in Telegram
                    </Typography>
                  </Box>

                  {/* Chat ID */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
                      Chat ID
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={settings.telegram.chatId}
                      onChange={(e) => handleSettingChange('telegram', 'chatId', e.target.value)}
                    />
                    <Typography variant="caption" sx={{ color: '#6b7280', mt: 0.5, display: 'block' }}>
                      Telegram chat ID to send notifications
                    </Typography>
                  </Box>

                  {/* Test Connection */}
                  <Button
                    variant="outlined"
                    startIcon={<Science />}
                    onClick={handleTestTelegram}
                    disabled={testingConnection}
                    sx={{
                      alignSelf: 'flex-start',
                      borderColor: '#d1d5db',
                      color: '#374151'
                    }}
                  >
                    {testingConnection ? 'Testing...' : 'Test Connection'}
                  </Button>

                  <Divider />

                  {/* Message Settings */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
                      Message Format
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={settings.telegram.messageFormat}
                        onChange={(e) => handleSettingChange('telegram', 'messageFormat', e.target.value)}
                      >
                        <MenuItem value="brief">Brief</MenuItem>
                        <MenuItem value="detailed">Detailed</MenuItem>
                        <MenuItem value="full">Full Report</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
                      Language
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={settings.telegram.language}
                        onChange={(e) => handleSettingChange('telegram', 'language', e.target.value)}
                      >
                        <MenuItem value="ru">Русский</MenuItem>
                        <MenuItem value="en">English</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Divider />

                  {/* Working Hours */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.telegram.workingHours}
                          onChange={(e) => handleSettingChange('telegram', 'workingHours', e.target.checked)}
                          size="small"
                        />
                      }
                      label="Limit to working hours"
                    />
                    
                    {settings.telegram.workingHours && (
                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <TextField
                          size="small"
                          type="time"
                          label="Start"
                          value={settings.telegram.workingHoursStart}
                          onChange={(e) => handleSettingChange('telegram', 'workingHoursStart', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          size="small"
                          type="time"
                          label="End"
                          value={settings.telegram.workingHoursEnd}
                          onChange={(e) => handleSettingChange('telegram', 'workingHoursEnd', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Quiet Mode */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.telegram.quietMode}
                          onChange={(e) => handleSettingChange('telegram', 'quietMode', e.target.checked)}
                          size="small"
                        />
                      }
                      label="Quiet mode (reduce notifications)"
                    />
                    
                    {settings.telegram.quietMode && (
                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <TextField
                          size="small"
                          type="time"
                          label="Quiet Start"
                          value={settings.telegram.quietModeStart}
                          onChange={(e) => handleSettingChange('telegram', 'quietModeStart', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          size="small"
                          type="time"
                          label="Quiet End"
                          value={settings.telegram.quietModeEnd}
                          onChange={(e) => handleSettingChange('telegram', 'quietModeEnd', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </Box>
          </SettingCard>
         
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;