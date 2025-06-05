import config.ConfigLoader;
import db.DatabaseManager;
import monitor.MonitoringTask;
import monitor.TelegramSender;
import web.HttpApiServer;

import java.util.Properties;
import java.util.Timer;

public class App {
    public static void main(String[] args) {
        System.out.println("🚀 Запуск системы мониторинга...");
        
        try {
            // Загружаем конфигурацию
            Properties properties = ConfigLoader.load("config.cfg");
            System.out.println("✅ Конфигурация загружена");
            
            // Проверяем настройки Telegram
            if (TelegramSender.isConfigured()) {
                System.out.println("✅ Telegram бот настроен");
                // Отправляем тестовое сообщение о запуске
                TelegramSender.send("🟢 Система мониторинга запущена");
            } else {
                System.err.println("⚠️ Telegram бот не настроен, уведомления работать не будут");
            }
            
            // Создаем таблицу в БД если нужно
            DatabaseManager.createTableIfNeeded();
            System.out.println("✅ База данных инициализирована");
            
            // Запускаем мониторинг
            int period = Integer.parseInt(properties.getProperty("period", "1000"));
            Timer monitoringTimer = new Timer("MonitoringTimer", true);
            monitoringTimer.schedule(new MonitoringTask(), 0, period);
            System.out.println("✅ Мониторинг запущен с интервалом " + period + "ms");
            
            // Запускаем веб-сервер
            int serverPort = Integer.parseInt(properties.getProperty("server.port", "8080"));
            HttpApiServer.start(serverPort);
            System.out.println("✅ HTTP API сервер запущен на порту " + serverPort);
            
            System.out.println("🎯 Система полностью готова к работе!");
            System.out.println("📊 Web интерфейс: http://localhost:" + serverPort);
            System.out.println("🔗 API endpoints:");
            System.out.println("   - GET /metrics - история метрик");
            System.out.println("   - GET /status - текущий статус системы");
            
            // Добавляем обработчик завершения работы
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                System.out.println("\n🛑 Завершение работы системы мониторинга...");
                monitoringTimer.cancel();
                
                if (TelegramSender.isConfigured()) {
                    TelegramSender.send("🔴 Система мониторинга остановлена");
                }
                
                System.out.println("✅ Система корректно завершена");
            }));
            
        } catch (NumberFormatException e) {
            System.err.println("❌ Ошибка в конфигурации: некорректное числовое значение");
            System.err.println("Проверьте параметры period и server.port в config.cfg");
            System.exit(1);
        } catch (Exception e) {
            System.err.println("❌ Критическая ошибка при запуске: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
}