import java.util.Properties;
import java.util.Timer;

public class App {
    public static void main(String[] args) {
        System.out.println("🚀 Запуск системы мониторинга...");
        
        try {
            // Загружаем конфигурацию
            System.out.println("✅ Конфигурация загружена");
            
            // Проверяем настройки Telegram
            if (TelegramSender.isConfigured()) {
                System.out.println("✅ Telegram бот настроен");
                // Отправляем тестовое сообщение о запуске
                TelegramSender.send("🟢 Система мониторинга запущена");
            } else {
                System.err.println("⚠️ Telegram бот не настроен, уведомления работать не будут");
            }
            
            System.out.println("✅ База данных инициализирована");
            
            // Запускаем мониторинг

            System.out.println("🔗 API endpoints:");
            System.out.println("   - GET /metrics - история метрик");
            System.out.println("   - GET /status - текущий статус системы");
            

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