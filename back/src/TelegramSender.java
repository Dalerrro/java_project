// // monitor/TelegramSender.java
// import java.net.HttpURLConnection;
// import java.net.URL;
// import java.net.URLEncoder;
// import java.util.Properties;

// public class TelegramSender {
//     private static String BOT_TOKEN;
//     private static String CHAT_ID;
    
//     // Статический блок для загрузки конфигурации при первом обращении
//     static {
        
//         if (BOT_TOKEN == null || CHAT_ID == null) {
//             System.err.println("Ошибка: не найдены настройки Telegram в конфигурации");
//         }
//     }
    
//     public static void send(String message) {
//         // Проверяем, что конфигурация загружена
//         if (BOT_TOKEN == null || CHAT_ID == null) {
//             System.err.println("Не удалось отправить сообщение в Telegram: отсутствует конфигурация");
//             return;
//         }
        
//         HttpURLConnection conn = null;
//         try {
//             String text = URLEncoder.encode(message, "UTF-8");
//             String urlString = "https://api.telegram.org/bot" + BOT_TOKEN +
//                     "/sendMessage?chat_id=" + CHAT_ID + "&text=" + text;
            
//             URL url = new URL(urlString);
//             conn = (HttpURLConnection) url.openConnection();
//             conn.setRequestMethod("GET");
//             conn.setConnectTimeout(5000); // 5 секунд на подключение
//             conn.setReadTimeout(10000);   // 10 секунд на чтение
//             conn.connect();
            
//             int responseCode = conn.getResponseCode();
//             if (responseCode == 200) {
//                 System.out.println("Telegram уведомление отправлено: " + message);
//             } else {
//                 System.err.println("Ошибка отправки в Telegram, код ответа: " + responseCode);
//             }
            
//             // Читаем ответ, чтобы соединение корректно закрылось
//             conn.getInputStream().close();
            
//         } catch (Exception e) {
//             System.err.println("Ошибка отправки Telegram сообщения: " + e.getMessage());
//             e.printStackTrace();
//         } finally {
//             if (conn != null) {
//                 conn.disconnect();
//             }
//         }
//     }
    
//     // Метод для проверки доступности Telegram API
//     public static boolean isConfigured() {
//         return BOT_TOKEN != null && CHAT_ID != null && 
//                !BOT_TOKEN.trim().isEmpty() && !CHAT_ID.trim().isEmpty();
//     }
// }