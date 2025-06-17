// back/src/App.java

import java.io.IOException;

/**
 * Главное приложение системного мониторинга
 * Версия 2.0 с OSHI интеграцией
 */
public class App {
    
    private static final int DEFAULT_PORT = 8080;
    
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
            
            // TODO: Инициализация Telegram (когда будет готово)
            // initializeTelegram();
            
            // Shutdown hook для корректного завершения
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                System.out.println("\n🛑 Получен сигнал завершения...");
                server.stop();
                System.out.println("✅ System Monitor остановлен");
            }));
            
            System.out.println("💡 Нажмите Ctrl+C для остановки сервера");
            
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
        System.out.println("🧪 Тестирование:");
        System.out.println("   curl http://localhost:" + port + "/api/system/current");
        System.out.println("   curl http://localhost:" + port + "/health");
        System.out.println();
    }
    
    /**
     * Тестирование OSHI подключения
     */
    /**
     * Инициализация Telegram (будет добавлено позже)
     */
    private static void initializeTelegram() {
        System.out.println("📱 Инициализация Telegram...");
        // TODO: Добавить когда будет готов TelegramBot
        System.out.println("⏳ Telegram интеграция будет добавлена позже");
    }
}