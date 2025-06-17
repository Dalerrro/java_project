// src/services/telegram.js

class TelegramService {
    constructor() {
      this.config = {
        botToken: localStorage.getItem('telegram_bot_token') || '7763857597:AAFB3eIcwlbBmCnBIT1WbkrjsdvupalqC1w',
        chatId: localStorage.getItem('telegram_chat_id') || '390304506',
        enabled: localStorage.getItem('telegram_enabled') === 'true'
      };
    }
  
    updateConfig(config) {
      this.config = { ...this.config, ...config };
      localStorage.setItem('telegram_bot_token', this.config.botToken);
      localStorage.setItem('telegram_chat_id', this.config.chatId);
      localStorage.setItem('telegram_enabled', this.config.enabled.toString());
    }
  
    async sendMessage(message) {
      if (!this.config.enabled) {
        console.log('Telegram notifications disabled');
        return { success: false, error: 'Telegram notifications disabled' };
      }
  
      if (!this.config.botToken || !this.config.chatId) {
        console.error('Telegram bot not configured');
        return { success: false, error: 'Bot token or chat ID missing' };
      }
  
      const url = `https://api.telegram.org/bot${this.config.botToken}/sendMessage`;
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: this.config.chatId,
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
      const emoji = severity === 'critical' ? '🚨' : '⚠️';
      const severityText = severity === 'critical' ? 'CRITICAL' : 'WARNING';
      
      const message = `${emoji} <b>${severityText} ALERT</b>\n\n` +
        `<b>Metric:</b> ${metric}\n` +
        `<b>Current Value:</b> ${value}\n` +
        `<b>Threshold:</b> ${threshold}\n` +
        `<b>Time:</b> ${new Date().toLocaleString()}\n\n` +
        `Please check your system!`;
  
      return this.sendMessage(message);
    }
  
    async sendTestMessage() {
      const message = `✅ <b>Test Message</b>\n\n` +
        `This is a test message from your System Monitor.\n` +
        `If you receive this, Telegram integration is working correctly!\n\n` +
        `<b>Time:</b> ${new Date().toLocaleString()}`;
  
      return this.sendMessage(message);
    }
  
    async sendSystemStatus(systemData) {
      const cpuUsage = systemData.currentMetrics?.cpuUsage || 0;
      const memoryUsage = systemData.currentMetrics?.memoryUsagePercent || 0;
      const temperature = systemData.sensorData?.cpuTemperature || 0;
      const uptime = systemData.staticInfo?.uptime || 'N/A';
  
      const statusEmoji = cpuUsage > 80 || memoryUsage > 85 || temperature > 75 ? '⚠️' : '✅';
      
      const message = `${statusEmoji} <b>System Status Report</b>\n\n` +
        `<b>📊 CPU Usage:</b> ${cpuUsage.toFixed(1)}%\n` +
        `<b>💾 Memory Usage:</b> ${memoryUsage.toFixed(1)}%\n` +
        `<b>🌡️ Temperature:</b> ${temperature.toFixed(1)}°C\n` +
        `<b>⏰ Uptime:</b> ${uptime}\n\n` +
        `<b>Time:</b> ${new Date().toLocaleString()}`;
  
      return this.sendMessage(message);
    }
  }
  
  export default new TelegramService();