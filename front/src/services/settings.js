class SettingsService {
  constructor() {
    this.STORAGE_KEYS = {
      MONITORING: 'settings_monitoring',
      TELEGRAM: 'settings_telegram',
      INTERFACE: 'settings_interface',
      THRESHOLDS: 'settings_thresholds'
    };
    
    this.defaultSettings = {
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
        quietModeEnd: '08:00',
        alertCooldown: 60,
        significantChangeThreshold: 10 // Добавлен для резких скачков метрик
      },
      interface: {
        theme: 'light',
        autoRefresh: true,
        showAnimations: true,
        compactView: false,
        showTooltips: true
      },
      thresholds: {
        cpu: { enabled: true, warning: 80, critical: 95 },
        memory: { enabled: true, warning: 85, critical: 95 },
        temperature: { enabled: true, warning: 70, critical: 85 },
        frequency: { enabled: false, warning: 4.5, critical: 5.0 }
      }
    };
  }

  getSettings() {
    const monitoring = this.getMonitoringSettings();
    const telegram = this.getTelegramSettings();
    const interfaceSettings = this.getInterfaceSettings();
    const thresholds = this.getThresholds();

    return {
      monitoring,
      telegram,
      interface: interfaceSettings,
      thresholds
    };
  }

  getMonitoringSettings() {
    const stored = localStorage.getItem(this.STORAGE_KEYS.MONITORING);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse monitoring settings:', e);
      }
    }
    return this.defaultSettings.monitoring;
  }

  saveMonitoringSettings(settings) {
    localStorage.setItem(this.STORAGE_KEYS.MONITORING, JSON.stringify(settings));
  }

  getTelegramSettings() {
    const stored = localStorage.getItem(this.STORAGE_KEYS.TELEGRAM);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse telegram settings:', e);
      }
    }
    return this.defaultSettings.telegram;
  }

  saveTelegramSettings(settings) {
    localStorage.setItem(this.STORAGE_KEYS.TELEGRAM, JSON.stringify(settings));
  }

  getInterfaceSettings() {
    const stored = localStorage.getItem(this.STORAGE_KEYS.INTERFACE);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse interface settings:', e);
      }
    }
    return this.defaultSettings.interface;
  }

  saveInterfaceSettings(settings) {
    localStorage.setItem(this.STORAGE_KEYS.INTERFACE, JSON.stringify(settings));
  }

  getThresholds() {
    const stored = localStorage.getItem(this.STORAGE_KEYS.THRESHOLDS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse thresholds:', e);
      }
    }
    return this.defaultSettings.thresholds;
  }

  saveThresholds(thresholds) {
    localStorage.setItem(this.STORAGE_KEYS.THRESHOLDS, JSON.stringify(thresholds));
  }

  isWithinWorkingHours() {
    const settings = this.getTelegramSettings();
    if (!settings.workingHours) return true;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = settings.workingHoursStart.split(':').map(Number);
    const [endHour, endMin] = settings.workingHoursEnd.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    return currentTime >= startTime && currentTime <= endTime;
  }

  isQuietMode() {
    const settings = this.getTelegramSettings();
    if (!settings.quietMode) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = settings.quietModeStart.split(':').map(Number);
    const [endHour, endMin] = settings.quietModeEnd.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    }
    
    return currentTime >= startTime && currentTime <= endTime;
  }

  canSendNotification() {
    const settings = this.getTelegramSettings();
    if (!settings.enabled) return false;
    if (!this.isWithinWorkingHours()) return false;
    if (this.isQuietMode()) return false;
    return true;
  }

  resetToDefaults() {
    localStorage.removeItem(this.STORAGE_KEYS.MONITORING);
    localStorage.removeItem(this.STORAGE_KEYS.TELEGRAM);
    localStorage.removeItem(this.STORAGE_KEYS.INTERFACE);
    localStorage.removeItem(this.STORAGE_KEYS.THRESHOLDS);
    return this.defaultSettings;
  }

  exportSettings() {
    const settings = this.getSettings();
    const dataStr = JSON.stringify(settings, null, 2);
    const exportFileDefaultName = `system-monitor-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    return { data: dataStr, filename: exportFileDefaultName };
    // React-компонент должен сам создать Blob и инициировать скачивание
  }

  importSettings(fileContent) {
    try {
      const settings = JSON.parse(fileContent);
      
      if (settings.monitoring) {
        this.saveMonitoringSettings(settings.monitoring);
      }
      if (settings.telegram) {
        this.saveTelegramSettings(settings.telegram);
      }
      if (settings.interface) {
        this.saveInterfaceSettings(settings.interface);
      }
      if (settings.thresholds) {
        this.saveThresholds(settings.thresholds);
      }
      
      return { success: true };
    } catch (e) {
      console.error('Failed to import settings:', e);
      return { success: false, error: e.message };
    }
  }
}

export default new SettingsService();