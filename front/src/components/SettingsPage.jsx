import React, { useState, useEffect } from "react";
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
  InputAdornment,
} from "@mui/material";
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
  Warning,
} from "@mui/icons-material";
import settingsService from "../services/settings";
import telegramService from "../services/telegram";

const SettingsPage = () => {
  const [settings, setSettings] = useState(settingsService.getSettings());
  const [showToken, setShowToken] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);

  // Функция для мгновенного применения настроек
  const applySettingsInstantly = (newSettings) => {
    // Сохраняем в localStorage для мгновенного применения
    settingsService.saveMonitoringSettings(newSettings.monitoring);
    settingsService.saveTelegramSettings(newSettings.telegram);
    settingsService.saveInterfaceSettings(newSettings.interface);
    settingsService.saveThresholds(newSettings.thresholds);

    // Отправляем событие для уведомления других компонентов
    window.dispatchEvent(new Event("storage"));
  };

  const handleSettingChange = (category, key, value) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value,
      },
    };

    setSettings(newSettings);

    // Применяем изменения мгновенно для определенных настроек
    if (category === "monitoring" || category === "interface") {
      applySettingsInstantly(newSettings);
    }
  };

  const handleSave = () => {
    setSaveStatus("saving");
    try {
      applySettingsInstantly(settings);
      setSaveStatus("success");
    } catch (err) {
      console.error("Failed to save settings:", err);
      setSaveStatus("error");
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleReset = () => {
    const defaultSettings = settingsService.resetToDefaults();
    setSettings(defaultSettings);
    applySettingsInstantly(defaultSettings);
    setSaveStatus("reset");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleTestTelegram = () => {
    setTestingConnection(true);
    // Временно сохраняем текущие настройки Telegram для теста
    settingsService.saveTelegramSettings(settings.telegram);

    telegramService.sendTestMessage().then((result) => {
      setTestingConnection(false);
      setSaveStatus(result.success ? "telegram_test" : "error");
      setTimeout(() => setSaveStatus(null), 3000);
    });
  };

  // Следим за изменениями в других вкладках
  useEffect(() => {
    const handleStorageChange = () => {
      const newSettings = settingsService.getSettings();
      setSettings(newSettings);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const SettingCard = ({ title, icon: Icon, children }) => (
    <Card
      elevation={0}
      sx={{ border: "1px solid #e5e7eb", borderRadius: 3, mb: 3 }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Box
            sx={{
              p: 1.5,
              backgroundColor: "#eff6ff",
              borderRadius: 2,
              border: "1px solid #bfdbfe",
            }}
          >
            <Icon sx={{ color: "#3b82f6", fontSize: "1.5rem" }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#111827" }}>
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
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "#111827", mb: 1 }}
          >
            System Settings
          </Typography>
          <Typography variant="body1" sx={{ color: "#6b7280" }}>
            Configure monitoring parameters and preferences
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RestoreRounded />}
            onClick={handleReset}
            sx={{
              borderColor: "#d1d5db",
              color: "#374151",
              "&:hover": {
                borderColor: "#9ca3af",
                backgroundColor: "#f9fafb",
              },
            }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            sx={{
              backgroundColor: "#3b82f6",
              "&:hover": {
                backgroundColor: "#2563eb",
              },
            }}
          >
            {saveStatus === "saving" ? "Saving..." : "Save All Settings"}
          </Button>
        </Box>
      </Box>

      {/* Status Messages */}
      {saveStatus === "success" && (
        <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
          All settings saved successfully! Changes are applied immediately.
        </Alert>
      )}

      {saveStatus === "reset" && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Settings reset to default values and applied immediately.
        </Alert>
      )}

      {saveStatus === "telegram_test" && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Telegram connection test successful! ✅
        </Alert>
      )}

      {saveStatus === "error" && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to save settings or test connection. Please try again.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={6}>
          {/* Monitoring Settings */}
          <SettingCard title="Monitoring Configuration" icon={Computer}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Update Interval */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "#374151", mb: 1 }}
                >
                  Update Interval
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={settings.monitoring.updateInterval}
                    onChange={(e) =>
                      handleSettingChange(
                        "monitoring",
                        "updateInterval",
                        e.target.value,
                      )
                    }
                  >
                    <MenuItem value={1}>Every 1 second</MenuItem>
                    <MenuItem value={2}>Every 2 seconds</MenuItem>
                    <MenuItem value={5}>Every 5 seconds</MenuItem>
                    <MenuItem value={10}>Every 10 seconds</MenuItem>
                    <MenuItem value={30}>Every 30 seconds</MenuItem>
                    <MenuItem value={60}>Every 1 minute</MenuItem>
                  </Select>
                </FormControl>
                <Typography
                  variant="caption"
                  sx={{ color: "#6b7280", mt: 0.5, display: "block" }}
                >
                  How often to collect system metrics (applied immediately)
                </Typography>
              </Box>

              {/* Data Retention */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "#374151", mb: 1 }}
                >
                  Data Retention
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={settings.monitoring.dataRetention}
                    onChange={(e) =>
                      handleSettingChange(
                        "monitoring",
                        "dataRetention",
                        e.target.value,
                      )
                    }
                  >
                    <MenuItem value={1}>1 day</MenuItem>
                    <MenuItem value={7}>7 days</MenuItem>
                    <MenuItem value={30}>30 days</MenuItem>
                    <MenuItem value={90}>3 months</MenuItem>
                  </Select>
                </FormControl>
                <Typography
                  variant="caption"
                  sx={{ color: "#6b7280", mt: 0.5, display: "block" }}
                >
                  How long to keep historical data
                </Typography>
              </Box>

              <Divider />

              {/* Monitoring Toggles */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "#374151", mb: 2 }}
                >
                  Enabled Metrics (Applied Instantly)
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.monitoring.enableCpuMonitoring}
                        onChange={(e) =>
                          handleSettingChange(
                            "monitoring",
                            "enableCpuMonitoring",
                            e.target.checked,
                          )
                        }
                        size="small"
                      />
                    }
                    label="CPU Usage & Frequency"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.monitoring.enableMemoryMonitoring}
                        onChange={(e) =>
                          handleSettingChange(
                            "monitoring",
                            "enableMemoryMonitoring",
                            e.target.checked,
                          )
                        }
                        size="small"
                      />
                    }
                    label="Memory Usage"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.monitoring.enableDiskMonitoring}
                        onChange={(e) =>
                          handleSettingChange(
                            "monitoring",
                            "enableDiskMonitoring",
                            e.target.checked,
                          )
                        }
                        size="small"
                      />
                    }
                    label="Disk Usage"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={
                          settings.monitoring.enableTemperatureMonitoring
                        }
                        onChange={(e) =>
                          handleSettingChange(
                            "monitoring",
                            "enableTemperatureMonitoring",
                            e.target.checked,
                          )
                        }
                        size="small"
                      />
                    }
                    label="CPU Temperature & Voltage"
                  />
                </Box>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.monitoring.autoCleanup}
                    onChange={(e) =>
                      handleSettingChange(
                        "monitoring",
                        "autoCleanup",
                        e.target.checked,
                      )
                    }
                  />
                }
                label="Auto-cleanup old data"
              />
            </Box>
          </SettingCard>

          {/* Interface Settings */}
          <SettingCard title="Interface Preferences" icon={Palette}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Theme */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "#374151", mb: 1 }}
                >
                  Theme (Applied Instantly)
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={settings.interface.theme}
                    onChange={(e) =>
                      handleSettingChange("interface", "theme", e.target.value)
                    }
                  >
                    <MenuItem value="light">Light Theme</MenuItem>
                    <MenuItem value="dark">Dark Theme</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Interface Toggles */}
            
              </Box>
          </SettingCard>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={6}>
          {/* Monitoring Thresholds */}
          <SettingCard title="Monitoring Thresholds" icon={Settings}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* CPU Thresholds */}
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.monitoring.enableCpuMonitoring}
                      onChange={(e) =>
                        handleSettingChange(
                          "monitoring",
                          "enableCpuMonitoring",
                          e.target.checked,
                        )
                      }
                      size="small"
                    />
                  }
                  label="Enable CPU Monitoring"
                />
                {settings.monitoring.enableCpuMonitoring && (
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Warning (%)"
                          type="number"
                          value={settings.thresholds.cpu.warning}
                          onChange={(e) =>
                            handleSettingChange("thresholds", "cpu", {
                              ...settings.thresholds.cpu,
                              warning: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Critical (%)"
                          type="number"
                          value={settings.thresholds.cpu.critical}
                          onChange={(e) =>
                            handleSettingChange("thresholds", "cpu", {
                              ...settings.thresholds.cpu,
                              critical: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>

              {/* Memory Thresholds */}
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.monitoring.enableMemoryMonitoring}
                      onChange={(e) =>
                        handleSettingChange(
                          "monitoring",
                          "enableMemoryMonitoring",
                          e.target.checked,
                        )
                      }
                      size="small"
                    />
                  }
                  label="Enable Memory Monitoring"
                />
                {settings.monitoring.enableMemoryMonitoring && (
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Warning (%)"
                          type="number"
                          value={settings.thresholds.memory.warning}
                          onChange={(e) =>
                            handleSettingChange("thresholds", "memory", {
                              ...settings.thresholds.memory,
                              warning: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Critical (%)"
                          type="number"
                          value={settings.thresholds.memory.critical}
                          onChange={(e) =>
                            handleSettingChange("thresholds", "memory", {
                              ...settings.thresholds.memory,
                              critical: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>

              {/* Temperature Thresholds */}
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.monitoring.enableTemperatureMonitoring}
                      onChange={(e) =>
                        handleSettingChange(
                          "monitoring",
                          "enableTemperatureMonitoring",
                          e.target.checked,
                        )
                      }
                      size="small"
                    />
                  }
                  label="Enable Temperature Monitoring"
                />
                {settings.monitoring.enableTemperatureMonitoring && (
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Warning (°C)"
                          type="number"
                          value={settings.thresholds.temperature.warning}
                          onChange={(e) =>
                            handleSettingChange("thresholds", "temperature", {
                              ...settings.thresholds.temperature,
                              warning: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Critical (°C)"
                          type="number"
                          value={settings.thresholds.temperature.critical}
                          onChange={(e) =>
                            handleSettingChange("thresholds", "temperature", {
                              ...settings.thresholds.temperature,
                              critical: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>
            </Box>
          </SettingCard>

          {/* Telegram Settings */}
          <SettingCard title="Telegram Notifications" icon={Telegram}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Telegram settings require manual save for security reasons
              </Alert>

              {/* Enable Telegram */}
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.telegram.enabled}
                    onChange={(e) =>
                      handleSettingChange(
                        "telegram",
                        "enabled",
                        e.target.checked,
                      )
                    }
                  />
                }
                label="Enable Telegram notifications"
              />

              {settings.telegram.enabled && (
                <>
                  {/* Bot Token */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "#374151", mb: 1 }}
                    >
                      Bot Token
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type={showToken ? "text" : "password"}
                      value={settings.telegram.botToken}
                      onChange={(e) =>
                        handleSettingChange(
                          "telegram",
                          "botToken",
                          e.target.value,
                        )
                      }
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
                        ),
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: "#6b7280", mt: 0.5, display: "block" }}
                    >
                      Get from @BotFather in Telegram
                    </Typography>
                  </Box>

                  {/* Chat ID */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "#374151", mb: 1 }}
                    >
                      Chat ID
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={settings.telegram.chatId}
                      onChange={(e) =>
                        handleSettingChange(
                          "telegram",
                          "chatId",
                          e.target.value,
                        )
                      }
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: "#6b7280", mt: 0.5, display: "block" }}
                    >
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
                      alignSelf: "flex-start",
                      borderColor: "#d1d5db",
                      color: "#374151",
                    }}
                  >
                    {testingConnection ? "Testing..." : "Test Connection"}
                  </Button>

                  <Divider />

                  {/* Message Settings */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "#374151", mb: 1 }}
                    >
                      Message Format
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={settings.telegram.messageFormat}
                        onChange={(e) =>
                          handleSettingChange(
                            "telegram",
                            "messageFormat",
                            e.target.value,
                          )
                        }
                      >
                        <MenuItem value="brief">Brief</MenuItem>
                        <MenuItem value="detailed">Detailed</MenuItem>
                        <MenuItem value="full">Full Report</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "#374151", mb: 1 }}
                    >
                      Language
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={settings.telegram.language}
                        onChange={(e) =>
                          handleSettingChange(
                            "telegram",
                            "language",
                            e.target.value,
                          )
                        }
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
                          onChange={(e) =>
                            handleSettingChange(
                              "telegram",
                              "workingHours",
                              e.target.checked,
                            )
                          }
                          size="small"
                        />
                      }
                      label="Limit to working hours"
                    />

                    {settings.telegram.workingHours && (
                      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                        <TextField
                          size="small"
                          type="time"
                          label="Start"
                          value={settings.telegram.workingHoursStart}
                          onChange={(e) =>
                            handleSettingChange(
                              "telegram",
                              "workingHoursStart",
                              e.target.value,
                            )
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          size="small"
                          type="time"
                          label="End"
                          value={settings.telegram.workingHoursEnd}
                          onChange={(e) =>
                            handleSettingChange(
                              "telegram",
                              "workingHoursEnd",
                              e.target.value,
                            )
                          }
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
                          onChange={(e) =>
                            handleSettingChange(
                              "telegram",
                              "quietMode",
                              e.target.checked,
                            )
                          }
                          size="small"
                        />
                      }
                      label="Quiet mode (reduce notifications)"
                    />

                    {settings.telegram.quietMode && (
                      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                        <TextField
                          size="small"
                          type="time"
                          label="Quiet Start"
                          value={settings.telegram.quietModeStart}
                          onChange={(e) =>
                            handleSettingChange(
                              "telegram",
                              "quietModeStart",
                              e.target.value,
                            )
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          size="small"
                          type="time"
                          label="Quiet End"
                          value={settings.telegram.quietModeEnd}
                          onChange={(e) =>
                            handleSettingChange(
                              "telegram",
                              "quietModeEnd",
                              e.target.value,
                            )
                          }
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
