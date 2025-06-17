import settingsService from './settings';

class TelegramService {
  constructor() {
    this.lastAlertTime = {}; 
    this.lastAlertValue = {};
  }

  getConfig() {
    return settingsService.getTelegramSettings();
  }

  async sendMessage(message) {
    const config = this.getConfig();
    

    if (!settingsService.canSendNotification()) {
      console.log('Notifications are disabled or outside allowed time');
      return { success: false, error: 'Notifications disabled or outside allowed time' };
    }

    if (!config.botToken || !config.chatId) {
      console.error('Telegram bot not configured');
      return { success: false, error: 'Bot token or chat ID missing' };
    }

    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });

      const data = await response.json();
      
      if (data.ok) {
        console.log('Telegram message sent successfully');
        return { success: true, data };
      } else {
        console.error('Telegram API error:', data);
        return { success: false, error: data.description || 'Failed to send message' };
      }
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      return { success: false, error: error.message };
    }
  }

  async sendAlert(metric, value, threshold, severity = 'warning') {
    const config = this.getConfig();
    
    const alertKey = `${metric}_${severity}`;
    const now = Date.now();
    const lastTime = this.lastAlertTime[alertKey] || 0;
    const lastValue = this.lastAlertValue[alertKey] || 0;
    const cooldownMs = (config.alertCooldown || 300) * 1000;
    const significantChangeThreshold = config.significantChangeThreshold || 10; 

    if (
      severity === 'critical' || 
      Math.abs(value - lastValue) >= significantChangeThreshold || 
      now - lastTime >= cooldownMs 
    ) {
      const emoji = severity === 'critical' ? '🚨' : '⚠️';
      const severityText = severity === 'critical' ? 'КРИТИЧНО' : 'ВНИМАНИЕ';
      
      let message;
      
      if (config.language === 'ru') {
        message = `${emoji} <b>${severityText}</b>\n\n` +
          `<b>Объект:</b> ${metric}\n` +
          `<b>Текущее значение:</b> ${value}\n` +
          `<b>Порог:</b> ${threshold}\n` +
          `<b>Время:</b> ${new Date().toLocaleString('ru-RU')}\n\n`;
      } else {
        message = `${emoji} <b>${severityText} ALERT</b>\n\n` +
          `<b>Metric:</b> ${metric}\n` +
          `<b>Current Value:</b> ${value}\n` +
          `<b>Threshold:</b> ${threshold}\n` +
          `<b>Time:</b> ${new Date().toLocaleString()}\n\n`;
      }

      const result = await this.sendMessage(message);
      
      if (result.success) {
        this.lastAlertTime[alertKey] = now;
        this.lastAlertValue[alertKey] = value; 
      }
      
      return result;
    } else {
      console.log(`Alert cooldown active or no significant change for ${alertKey}`);
      return { success: false, error: 'Cooldown active or no significant change' };
    }
  }

  async sendTestMessage() {
    const config = this.getConfig();
    
    let message;
    
    if (config.language === 'ru') {
      message = `✅ <b>Тестовое сообщение</b>\n\n` +
        `Интеграция с Telegram работает корректно!\n\n` +
        `<b>Время:</b> ${new Date().toLocaleString('ru-RU')}`;
    } else {
      message = `✅ <b>Test Message</b>\n\n` +
        `This is a test message from your System Monitor.\n` +
        `If you receive this, Telegram integration is working correctly!\n\n` +
        `<b>Time:</b> ${new Date().toLocaleString()}`;
    }

    return this.sendMessage(message);
  }

  async sendSystemStatus(systemData) {
    const config = this.getConfig();
    const cpuUsage = systemData.currentMetrics?.cpuUsage || 0;
    const memoryUsage = systemData.currentMetrics?.memoryUsagePercent || 0;
    const temperature = systemData.sensorData?.cpuTemperature || 0;
    const uptime = systemData.staticInfo?.uptime || 'N/A';
    const cpuName = systemData.cpuDetails?.name || 'Unknown';
    const processes = systemData.staticInfo?.processes || 0;

    const statusEmoji = cpuUsage > 80 || memoryUsage > 85 || temperature > 75 ? '⚠️' : '✅';
    
    let message;
    
    if (config.messageFormat === 'brief') {
      if (config.language === 'ru') {
        message = `${statusEmoji} CPU: ${cpuUsage.toFixed(1)}% | RAM: ${memoryUsage.toFixed(1)}% | Temp: ${temperature.toFixed(1)}°C`;
      } else {
        message = `${statusEmoji} CPU: ${cpuUsage.toFixed(1)}% | RAM: ${memoryUsage.toFixed(1)}% | Temp: ${temperature.toFixed(1)}°C`;
      }
    } else if (config.messageFormat === 'detailed' || config.messageFormat === 'full') {
      if (config.language === 'ru') {
        message = `${statusEmoji} <b>Статус системы</b>\n\n` +
          `<b>💻 Процессор:</b>\n` +
          `• Модель: ${cpuName}\n` +
          `• Загрузка: ${cpuUsage.toFixed(1)}%\n` +
          `• Частота: ${systemData.cpuDetails?.currentFrequency?.toFixed(2) || 0} GHz\n` +
          `• Температура: ${temperature.toFixed(1)}°C\n\n` +
          `<b>💾 Память:</b>\n` +
          `• Использование: ${memoryUsage.toFixed(1)}%\n` +
          `• Занято: ${(systemData.currentMetrics?.memoryUsed / 1024 / 1024 / 1024).toFixed(1)} GB\n` +
          `• Всего: ${(systemData.currentMetrics?.memoryTotal / 1024 / 1024 / 1024).toFixed(1)} GB\n\n` +
          `<b>📊 Система:</b>\n` +
          `• Время работы: ${uptime}\n` +
          `• Процессов: ${processes}\n\n` +
          `<b>⏰ Время:</b> ${new Date().toLocaleString('ru-RU')}`;
      } else {
        message = `${statusEmoji} <b>System Status Report</b>\n\n` +
          `<b>💻 CPU:</b>\n` +
          `• Model: ${cpuName}\n` +
          `• Usage: ${cpuUsage.toFixed(1)}%\n` +
          `• Frequency: ${systemData.cpuDetails?.currentFrequency?.toFixed(2) || 0} GHz\n` +
          `• Temperature: ${temperature.toFixed(1)}°C\n\n` +
          `<b>💾 Memory:</b>\n` +
          `• Usage: ${memoryUsage.toFixed(1)}%\n` +
          `• Used: ${(systemData.currentMetrics?.memoryUsed / 1024 / 1024 / 1024).toFixed(1)} GB\n` +
          `• Total: ${(systemData.currentMetrics?.memoryTotal / 1024 / 1024 / 1024).toFixed(1)} GB\n\n` +
          `<b>📊 System:</b>\n` +
          `• Uptime: ${uptime}\n` +
          `• Processes: ${processes}\n\n` +
          `<b>⏰ Time:</b> ${new Date().toLocaleString()}`;
      }
    }

    return this.sendMessage(message);
  }

  async sendDailyReport(stats) {
    const config = this.getConfig();
    
    let message;
    
    if (config.language === 'ru') {
      message = `📊 <b>Дневной отчет</b>\n\n` +
        `<b>CPU:</b>\n` +
        `• Средняя загрузка: ${stats.avgCpu.toFixed(1)}%\n` +
        `• Максимальная: ${stats.maxCpu.toFixed(1)}%\n\n` +
        `<b>Память:</b>\n` +
        `• Средняя загрузка: ${stats.avgMemory.toFixed(1)}%\n` +
        `• Максимальная: ${stats.maxMemory.toFixed(1)}%\n\n` +
        `<b>Температура:</b>\n` +
        `• Средняя: ${stats.avgTemp.toFixed(1)}°C\n` +
        `• Максимальная: ${stats.maxTemp.toFixed(1)}°C\n\n` +
        `<b>Алерты:</b> ${stats.alertCount}\n\n` +
        `<b>Период:</b> ${new Date().toLocaleDateString('ru-RU')}`;
    } else {
      message = `📊 <b>Daily Report</b>\n\n` +
        `<b>CPU:</b>\n` +
        `• Average Load: ${stats.avgCpu.toFixed(1)}%\n` +
        `• Maximum: ${stats.maxCpu.toFixed(1)}%\n\n` +
        `<b>Memory:</b>\n` +
        `• Average Load: ${stats.avgMemory.toFixed(1)}%\n` +
        `• Maximum: ${stats.maxMemory.toFixed(1)}%\n\n` +
        `<b>Temperature:</b>\n` +
        `• Average: ${stats.avgTemp.toFixed(1)}°C\n` +
        `• Maximum: ${stats.maxTemp.toFixed(1)}°C\n\n` +
        `<b>Alerts:</b> ${stats.alertCount}\n\n` +
        `<b>Period:</b> ${new Date().toLocaleDateString()}`;
    }

    return this.sendMessage(message);
  }
}

export default new TelegramService();