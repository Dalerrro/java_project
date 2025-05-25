// monitor/TelegramSender.java

package monitor;

import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;

public class TelegramSender {
    private static final String BOT_TOKEN = "7763857597:AAFB3eIcwlbBmCnBIT1WbkrjsdvupalqC1w";
    private static final String CHAT_ID = "390304506";

    public static void send(String message) {
        try {
            String text = URLEncoder.encode(message, "UTF-8");
            String urlString = "https://api.telegram.org/bot" + BOT_TOKEN +
                    "/sendMessage?chat_id=" + CHAT_ID + "&text=" + text;
            URL url = new URL(urlString);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.connect();
            
           // int code = conn.getResponseCode();

            conn.getInputStream().close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
