import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Properties;
import java.io.InputStream;
import java.io.IOException;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.File;

/**
 * Сервис для отправки уведомлений в Telegram
 */
public class TelegramSender {
    private static final String CONFIG_FILE = "telegram.properties";
    private static String BOT_TOKEN;
    private static String CHAT_ID;
    private static boolean ENABLED = true;
    private static String LANGUAGE = "ru";
    private static String MESSAGE_FORMAT = "detailed";

    // Загружаем конфигурацию при старте класса
    static {
        loadConfiguration();
    }

    /**
     * Загрузить или создать файл конфигурации
     */
    public static void loadConfiguration() {
        Properties props = new Properties();
        File configFile = new File(CONFIG_FILE);
        try {
            if (configFile.exists()) {
                try (FileInputStream fis = new FileInputStream(configFile)) {
                    props.load(fis);
                    BOT_TOKEN = props.getProperty("telegram.bot.token");
                    CHAT_ID = props.getProperty("telegram.chat.id");
                    ENABLED = Boolean.parseBoolean(props.getProperty("telegram.enabled", "true"));
                    LANGUAGE = props.getProperty("telegram.language", "ru");
                    MESSAGE_FORMAT = props.getProperty("telegram.format", "detailed");
                }
            } else {
                // Создаем файл с настройками по умолчанию
                props.setProperty("telegram.bot.token", "7763857597:AAFB3eIcwlbBmCnBIT1WbkrjsdvupalqC1w");
                props.setProperty("telegram.chat.id", "390304506");
                props.setProperty("telegram.enabled", "true");
                props.setProperty("telegram.language", "ru");
                props.setProperty("telegram.format", "detailed");
                try (FileOutputStream fos = new FileOutputStream(configFile)) {
                    props.store(fos, "Telegram Bot Configuration");
                }
                BOT_TOKEN = props.getProperty("telegram.bot.token");
                CHAT_ID = props.getProperty("telegram.chat.id");
            }
        } catch (IOException e) {
            System.err.println("Не удалось загрузить конфигурацию Telegram: " + e.getMessage());
        }
    }

    /**
     * Обновить конфигурацию
     */
    public static void updateConfiguration(String botToken, String chatId, boolean enabled, String language, String format) {
        Properties props = new Properties();
        props.setProperty("telegram.bot.token", botToken);
        props.setProperty("telegram.chat.id", chatId);
        props.setProperty("telegram.enabled", String.valueOf(enabled));
        props.setProperty("telegram.language", language);
        props.setProperty("telegram.format", format);
        try (FileOutputStream fos = new FileOutputStream(CONFIG_FILE)) {
            props.store(fos, "Telegram Bot Configuration");
            BOT_TOKEN = botToken;
            CHAT_ID = chatId;
            ENABLED = enabled;
            LANGUAGE = language;
            MESSAGE_FORMAT = format;
            System.out.println("Конфигурация Telegram обновлена");
        } catch (IOException e) {
            System.err.println("Ошибка сохранения конфигурации: " + e.getMessage());
        }
    }

    /**
     * Отправить сообщение в Telegram
     */
    public static void send(String message) {
        if (!ENABLED) {
            System.out.println("Telegram уведомления отключены");
            return;
        }
        if (BOT_TOKEN == null || CHAT_ID == null) {
            System.err.println("Telegram не сконфигурирован");
            return;
        }
        HttpURLConnection conn = null;
        try {
            String text = URLEncoder.encode(message, StandardCharsets.UTF_8);
            String urlString = String.format(
                "https://api.telegram.org/bot%s/sendMessage?chat_id=%s&text=%s&parse_mode=HTML",
                BOT_TOKEN, CHAT_ID, text
            );
            URL url = new URL(urlString);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(10000);
            int code = conn.getResponseCode();
            if (code == HttpURLConnection.HTTP_OK) {
                System.out.println("Telegram уведомление отправлено: " + message);
            } else {
                System.err.println("Ошибка отправки Telegram, код ответа: " + code);
            }
        } catch (Exception e) {
            System.err.println("Ошибка отправки Telegram: " + e.getMessage());
        } finally {
            if (conn != null) conn.disconnect();
        }
    }

    /**
     * Отправить алерт
     */
    public static void sendAlert(String metric, double value, double threshold, String severity) {
        String emoji = severity.equals("critical") ? "🚨" : "⚠️";
        String severityText = severity.equals("critical") ? "КРИТИЧНО" : "ВНИМАНИЕ";
        String message;
        if (LANGUAGE.equals("ru")) {
            message = String.format(
                "%s <b>%s</b>\n\n" +
                "<b>Метрика:</b> %s\n" +
                "<b>Текущее значение:</b> %.1f\n" +
                "<b>Порог:</b> %.1f\n" +
                "<b>Время:</b> %s\n",
                emoji, severityText, metric, value, threshold, new java.util.Date().toString()
            );
        } else {
            message = String.format(
                "%s <b>%s ALERT</b>\n\n" +
                "<b>Metric:</b> %s\n" +
                "<b>Current Value:</b> %.1f\n" +
                "<b>Threshold:</b> %.1f\n" +
                "<b>Time:</b> %s\n\n" +
                "System check required!",
                emoji, severityText, metric, value, threshold, new java.util.Date().toString()
            );
        }
        send(message);
    }

    /**
     * Отправить статус системы
     */
    public static void sendSystemStatus(double cpuUsage, double memoryUsage, double temperature, String uptime) {
        String statusEmoji = (cpuUsage > 80 || memoryUsage > 85 || temperature > 75) ? "⚠️" : "✅";
        String message;
        if (MESSAGE_FORMAT.equals("brief")) {
            message = String.format(
                "%s CPU: %.1f%% | RAM: %.1f%% | Temp: %.1f°C",
                statusEmoji, cpuUsage, memoryUsage, temperature
            );
        } else {
            if (LANGUAGE.equals("ru")) {
                message = String.format(
                    "%s <b>Статус системы</b>\n\n" +
                    "📊 <b>CPU:</b> %.1f%%\n" +
                    "💾 <b>Память:</b> %.1f%%\n" +
                    "🌡️ <b>Температура:</b> %.1f°C\n" +
                    "⏰ <b>Uptime:</b> %s\n\n" +
                    "<b>Время:</b> %s",
                    statusEmoji, cpuUsage, memoryUsage, temperature, uptime, new java.util.Date().toString()
                );
            } else {
                message = String.format(
                    "%s <b>System Status</b>\n\n" +
                    "📊 <b>CPU:</b> %.1f%%\n" +
                    "💾 <b>Memory:</b> %.1f%%\n" +
                    "🌡️ <b>Temperature:</b> %.1f°C\n" +
                    "⏰ <b>Uptime:</b> %s\n\n" +
                    "<b>Time:</b> %s",
                    statusEmoji, cpuUsage, memoryUsage, temperature, uptime, new java.util.Date().toString()
                );
            }
        }
        send(message);
    }

    /**
     * Проверить, настроен ли бот
     */
    public static boolean isConfigured() {
        return BOT_TOKEN != null && CHAT_ID != null && !BOT_TOKEN.isBlank() && !CHAT_ID.isBlank();
    }

    /**
     * Получить текущую конфигурацию
     */
    public static Properties getConfiguration() {
        Properties props = new Properties();
        props.setProperty("telegram.bot.token", BOT_TOKEN != null ? BOT_TOKEN : "");
        props.setProperty("telegram.chat.id", CHAT_ID != null ? CHAT_ID : "");
        props.setProperty("telegram.enabled", String.valueOf(ENABLED));
        props.setProperty("telegram.language", LANGUAGE);
        props.setProperty("telegram.format", MESSAGE_FORMAT);
        return props;
    }
}