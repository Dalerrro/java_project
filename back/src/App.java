
import java.io.IOException;

/**
 * Главное приложение системного мониторинга
 * Версия 2.0 с OSHI интеграцией + Telegram Bot
 */
public class App {
    
    private static final int DEFAULT_PORT = 8080;
    private static TelegramBot telegramBot; // Добавили поле для бота
    
    public static void main(String[] args) {
        System.out.println("===============================================");
        System.out.println("🖥️  SYSTEM MONITOR v2.0 (OSHI Edition)");
        System.out.println("===============================================");
        
        try {
            // Определяем порт
            int port = getPortFromArgs(args);
            System.out.println("📡 Порт: " + port);
            
            // Инициализируем компоненты
            System.out.println("🔧 Инициализация компонентов...");
            
            // Создаем SimpleSystemInfo для OSHI
            SimpleSystemInfo systemInfo = new SimpleSystemInfo();
            System.out.println("✅ OSHI SystemInfo инициализирован");
            
            // Создаем веб-сервис
            OSHIWebService webService = new OSHIWebService();
            System.out.println("✅ Web Service создан");
            
            // Создаем и запускаем HTTP сервер
            HttpApiServer server = new HttpApiServer(port);
            server.start();
            
            // Отображаем информацию о запуске
            printStartupInfo(port);
            
            // Тестируем OSHI
            // testOSHIConnection(systemInfo);  // Пока отключаем
            
            // ========== НОВОЕ: Инициализация Telegram Bot ==========
            initializeTelegramBot();
            
            // Shutdown hook для корректного завершения
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                System.out.println("\n🛑 Получен сигнал завершения...");
                server.stop();
                
                // Останавливаем Telegram бота
                if (telegramBot != null) {
                    telegramBot.stop();
                    System.out.println("🤖 Telegram бот остановлен");
                }
                
                System.out.println("✅ System Monitor остановлен");
            }));
            
            System.out.println("💡 Нажмите Ctrl+C для остановки сервера");
            System.out.println("📱 Попробуйте отправить /status в Telegram!");
            
            // Держим приложение запущенным
            Thread.currentThread().join();
            
        } catch (NumberFormatException e) {
            System.err.println("❌ Ошибка: некорректный номер порта");
            System.err.println("Использование: java App [port]");
            System.exit(1);
        } catch (IOException e) {
            System.err.println("❌ Ошибка запуска HTTP сервера: " + e.getMessage());
            System.exit(1);
        } catch (Exception e) {
            System.err.println("❌ Критическая ошибка: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
    
    /**
     * Получить порт из аргументов командной строки
     */
    private static int getPortFromArgs(String[] args) {
        if (args.length > 0) {
            try {
                int port = Integer.parseInt(args[0]);
                if (port > 0 && port < 65536) {
                    return port;
                } else {
                    System.out.println("⚠️  Некорректный диапазон порта: " + port + ". Используется порт по умолчанию: " + DEFAULT_PORT);
                }
            } catch (NumberFormatException e) {
                System.out.println("⚠️  Некорректный формат порта: " + args[0] + ". Используется порт по умолчанию: " + DEFAULT_PORT);
            }
        }
        return DEFAULT_PORT;
    }
    
    /**
     * Вывод информации о запуске
     */
    private static void printStartupInfo(int port) {
        System.out.println();
        System.out.println("🚀 СЕРВЕР ЗАПУЩЕН УСПЕШНО!");
        System.out.println("🌐 URL: http://localhost:" + port);
        System.out.println();
        System.out.println("📋 Доступные API endpoints:");
        System.out.println("   GET  /api/system/current    - Полная информация о системе (OSHI)");
        System.out.println("   GET  /api/system/cpu        - Информация о процессоре");
        System.out.println("   GET  /api/system/memory     - Информация о памяти");
        System.out.println("   GET  /api/system/sensors    - Данные сенсоров");
        System.out.println("   GET  /health                - Проверка работоспособности");
        System.out.println();
        System.out.println("🔄 Legacy endpoints (deprecated):");
        System.out.println("   GET  /status                - Старый формат статуса");
        System.out.println("   GET  /metrics               - Старый формат метрик");
        System.out.println();
        System.out.println("📱 Telegram команды:");
        System.out.println("   /status                     - Полный статус системы");
        System.out.println("   /cpu                        - Данные процессора");  
        System.out.println("   /memory                     - Информация о памяти");
        System.out.println("   /temp                       - Температура и датчики");
        System.out.println("   /help                       - Справка по командам");
        System.out.println();
        System.out.println("🧪 Тестирование:");
        System.out.println("   curl http://localhost:" + port + "/api/system/current");
        System.out.println("   curl http://localhost:" + port + "/health");
        System.out.println("   Отправьте /status в Telegram");
        System.out.println();
    }
    
    /**
     * Инициализация Telegram бота (заменяет старый initializeTelegram)
     */
    private static void initializeTelegramBot() {
        System.out.println("📱 Инициализация Telegram бота...");
        
        // Проверяем конфигурацию
        if (!TelegramSender.isConfigured()) {
            System.out.println("⚠️  Telegram не настроен в telegram.properties");
            System.out.println("💡 Файл будет создан автоматически с настройками по умолчанию");
            System.out.println("💡 Или настройте через веб-интерфейс на вкладке Settings");
            return;
        }
        
        try {
            telegramBot = new TelegramBot();
            
            // Запускаем бота в отдельном потоке
            Thread botThread = new Thread(() -> {
                telegramBot.start();
            });
            botThread.setDaemon(true); // Завершается с главным процессом
            botThread.setName("TelegramBot");
            botThread.start();
            
            System.out.println("✅ Telegram бот запущен успешно");
            
            // Отправляем уведомление о запуске (опционально)
            try {
                TelegramSender.send("🚀 <b>System Monitor запущен!</b>\n\n" +
                    "Система готова к мониторингу.\n" +
                    "Используйте /help для списка команд.");
            } catch (Exception e) {
                System.out.println("⚠️  Не удалось отправить стартовое сообщение: " + e.getMessage());
            }
            
        } catch (Exception e) {
            System.err.println("❌ Ошибка запуска Telegram бота: " + e.getMessage());
            System.out.println("💡 Проверьте настройки в telegram.properties");
        }
    }
}