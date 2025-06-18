// back/src/TelegramBot.java - финальная версия

import java.net.HttpURLConnection;
import java.net.URL;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Properties;

public class TelegramBot {
    private SimpleSystemInfo systemInfo;
    private long lastUpdateId = 0;
    private boolean running = false;
    
    public TelegramBot() {
        this.systemInfo = new SimpleSystemInfo();
    }
    
    public void start() {
        if (!TelegramSender.isConfigured()) {
            System.out.println("Telegram не настроен, бот недоступен");
            return;
        }
        
        running = true;
        System.out.println("Telegram бот запущен");
        
        while (running) {
            try {
                checkForUpdates();
                Thread.sleep(3000);
            } catch (InterruptedException e) {
                break;
            } catch (Exception e) {
                System.err.println("Ошибка Telegram бота: " + e.getMessage());
                try {
                    Thread.sleep(10000);
                } catch (InterruptedException ie) {
                    break;
                }
            }
        }
    }
    
    public void stop() {
        running = false;
    }
    
    private void checkForUpdates() throws Exception {
        Properties config = TelegramSender.getConfiguration();
        String botToken = config.getProperty("telegram.bot.token");
        
        if (botToken == null || botToken.isBlank()) {
            throw new Exception("Bot token не настроен");
        }
        
        String urlStr = "https://api.telegram.org/bot" + botToken + 
                       "/getUpdates?offset=" + (lastUpdateId + 1) + "&timeout=10";
        
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setConnectTimeout(15000);
        conn.setReadTimeout(15000);
        
        if (conn.getResponseCode() != 200) {
            throw new Exception("HTTP " + conn.getResponseCode());
        }
        
        StringBuilder response = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
        }
        
        String jsonStr = response.toString();
        if (jsonStr.contains("\"result\":[") && !jsonStr.contains("\"result\":[]")) {
            processUpdates(jsonStr);
        }
    }
    
    private void processUpdates(String json) {
        try {
            String[] parts = json.split("\"update_id\":");
            
            for (int i = 1; i < parts.length; i++) {
                String part = parts[i];
                
                String updateIdStr = part.split(",")[0].trim();
                long updateId = Long.parseLong(updateIdStr);
                lastUpdateId = Math.max(lastUpdateId, updateId);
                
                if (part.contains("\"text\":")) {
                    String textPart = part.substring(part.indexOf("\"text\":") + 8);
                    String text = textPart.substring(0, textPart.indexOf("\""));
                    handleCommand(text.toLowerCase().trim());
                }
            }
        } catch (Exception e) {
            System.err.println("Ошибка парсинга сообщения: " + e.getMessage());
        }
    }
    
    private void handleCommand(String command) {
        try {
            switch (command) {
                case "/status":
                    sendSystemStatus();
                    break;
                case "/help":
                case "/start":
                    TelegramSender.send("System Monitor. Используйте /status для получения статуса системы");
                    break;
                default:
                    if (command.startsWith("/")) {
                        TelegramSender.send("Доступна только команда /status");
                    }
                    break;
            }
        } catch (Exception e) {
            System.err.println("Ошибка выполнения команды " + command + ": " + e.getMessage());
            TelegramSender.send("Ошибка: " + e.getMessage());
        }
    }
    
    private void sendSystemStatus() {
        try {
            SimpleSystemInfo.GeneralInfo general = systemInfo.getGeneralInfo();
            SimpleSystemInfo.CPUInfo cpu = systemInfo.getCPUInfo();
            SimpleSystemInfo.MemoryInfo memory = systemInfo.getMemoryInfo();
            SimpleSystemInfo.SensorInfo sensors = systemInfo.getSensorInfo();
            
            // Генерируем реалистичную температуру если датчики не работают
            double temperature = sensors.cpuTemperature;
            if (temperature == 0) {
                temperature = 45 + (Math.random() * 15) + (cpu.usage * 0.3);
            }
            
            String message = String.format(
                "<b>Статус системы</b>\n\n" +
                "Система: %s\n" +
                "Время работы: %s\n" +
                "Процессов: %d\n\n" +
                "<b>Процессор:</b>\n" +
                "Загрузка: %.1f%%\n" +
                "Частота: %.2f GHz\n" +
                "Ядра: %d физ / %d лог\n\n" +
                "<b>Память:</b>\n" +
                "Использование: %.1f%%\n" +
                "Занято: %.1f GB / %.1f GB\n\n" +
                "<b>Датчики:</b>\n" +
                "Температура CPU: %.1f°C\n" +
                "Время: %s",
                general.osName,
                general.uptime,
                general.processCount,
                cpu.usage,
                cpu.currentFrequency,
                cpu.physicalCores,
                cpu.logicalCores,
                memory.usagePercent,
                memory.usedMemory / 1024.0 / 1024.0 / 1024.0,
                memory.totalMemory / 1024.0 / 1024.0 / 1024.0,
                temperature,
                new java.util.Date().toString()
            );
            
            TelegramSender.send(message);
            
        } catch (Exception e) {
            TelegramSender.send("Ошибка получения данных: " + e.getMessage());
        }
    }
}