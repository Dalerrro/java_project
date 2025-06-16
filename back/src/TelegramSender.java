package monitor;

import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Properties;
import java.io.InputStream;
import java.io.IOException;

/**
 * Сервис для отправки уведомлений в Telegram
 */
public class TelegramSender {
    private static final String CONFIG_FILE = "/config.properties";
    private static String BOT_TOKEN;
    private static String CHAT_ID;

    static {
        try (InputStream in = TelegramSender.class.getResourceAsStream(CONFIG_FILE)) {
            if (in != null) {
                Properties props = new Properties();
                props.load(in);
                BOT_TOKEN = props.getProperty("telegram.bot.token");
                CHAT_ID = props.getProperty("telegram.chat.id");
            } else {
                System.err.println("Конфигурационный файл не найден: " + CONFIG_FILE);
            }
        } catch (IOException e) {
            System.err.println("Не удалось загрузить конфигурацию Telegram: " + e.getMessage());
        }
    }

    /**
     * Отправить сообщение в Telegram
     * @param message текст уведомления
     */
    public static void send(String message) {
        if (BOT_TOKEN == null || CHAT_ID == null) {
            System.err.println("Telegram не сконфигурирован");
            return;
        }
        HttpURLConnection conn = null;
        try {
            String text = URLEncoder.encode(message, StandardCharsets.UTF_8);
            String urlString = String.format(
                "https://api.telegram.org/bot%s/sendMessage?chat_id=%s&text=%s",
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
            if (conn != null) {
                conn.disconnect();
            }
        }
    }

    /**
     * Проверить, настроен ли бот
     */
    public static boolean isConfigured() {
        return BOT_TOKEN != null && CHAT_ID != null &&
               !BOT_TOKEN.isBlank() && !CHAT_ID.isBlank();
    }
}