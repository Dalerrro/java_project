// src/hooks/useSystemMonitor.js

import { useEffect, useRef } from 'react';
import api from '../services/api';
import telegramService from '../services/telegram';

const useSystemMonitor = (thresholds = {
  cpu: { warning: 80, critical: 95 },
  memory: { warning: 85, critical: 95 },
  temperature: { warning: 70, critical: 85 }
}) => {
  const alertsSentRef = useRef({});
  const checkIntervalRef = useRef(null);

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const data = await api.getSystemCurrent();
        
        const metrics = {
          cpu: data.currentMetrics.cpuUsage,
          memory: data.currentMetrics.memoryUsagePercent,
          temperature: data.sensorData.cpuTemperature
        };

        // Проверяем каждую метрику
        Object.entries(metrics).forEach(([metric, value]) => {
          const threshold = thresholds[metric];
          if (!threshold) return;

          const isCritical = value >= threshold.critical;
          const isWarning = value >= threshold.warning && !isCritical;
          
          const alertKey = `${metric}_${isCritical ? 'critical' : 'warning'}`;
          const shouldSendAlert = (isCritical || isWarning) && !alertsSentRef.current[alertKey];
          
          if (shouldSendAlert && telegramService.config.enabled) {
            // Отправляем алерт
            const metricLabel = metric.charAt(0).toUpperCase() + metric.slice(1);
            const unit = metric === 'temperature' ? '°C' : '%';
            
            telegramService.sendAlert(
              metricLabel,
              `${value.toFixed(1)}${unit}`,
              `${isCritical ? threshold.critical : threshold.warning}${unit}`,
              isCritical ? 'critical' : 'warning'
            );
            
            // Помечаем алерт как отправленный
            alertsSentRef.current[alertKey] = true;
            
            // Сбрасываем флаг через 5 минут
            setTimeout(() => {
              alertsSentRef.current[alertKey] = false;
            }, 5 * 60 * 1000);
          }
          
          // Если значение вернулось в норму, сбрасываем флаги
          if (!isCritical && !isWarning) {
            alertsSentRef.current[`${metric}_critical`] = false;
            alertsSentRef.current[`${metric}_warning`] = false;
          }
        });
      } catch (error) {
        console.error('Failed to check system status:', error);
      }
    };

    // Проверяем сразу при запуске
    checkSystemStatus();
    
    // Затем проверяем каждые 30 секунд
    checkIntervalRef.current = setInterval(checkSystemStatus, 30000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [thresholds]);
};

export default useSystemMonitor;