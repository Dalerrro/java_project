// src/services/api.js

const API_BASE_URL = 'http://localhost:8080';

class SystemMonitorAPI {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async fetchWithTimeout(url, options = {}, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(id);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // Получить полную информацию о системе
  async getSystemCurrent() {
    return this.fetchWithTimeout(`${this.baseUrl}/api/system/current`);
  }

  // Получить информацию о CPU
  async getCPUInfo() {
    return this.fetchWithTimeout(`${this.baseUrl}/api/system/cpu`);
  }

  // Получить информацию о памяти
  async getMemoryInfo() {
    return this.fetchWithTimeout(`${this.baseUrl}/api/system/memory`);
  }

  // Получить данные сенсоров
  async getSensorInfo() {
    return this.fetchWithTimeout(`${this.baseUrl}/api/system/sensors`);
  }

  // Проверка здоровья сервера
  async getHealth() {
    return this.fetchWithTimeout(`${this.baseUrl}/health`);
  }

  // Получить базовую информацию о сервисе
  async getServiceInfo() {
    return this.fetchWithTimeout(`${this.baseUrl}/`);
  }
}

export default new SystemMonitorAPI();