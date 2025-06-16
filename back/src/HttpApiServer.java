import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.net.InetSocketAddress;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * HTTP API сервер для системного мониторинга с OSHI
 */
public class HttpApiServer {
    
    private HttpServer server;
    private OSHIWebService oshiService;
    private int port;
    
    public HttpApiServer(int port) {
        this.port = port;
        this.oshiService = new OSHIWebService();
    }
    
    /**
     * Запуск HTTP сервера
     */
    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);
        
        // Настраиваем OSHI endpoints
        setupOSHIEndpoints();
        
        // Добавляем общие endpoints
        setupGeneralEndpoints();
        
        // Запускаем сервер
        server.setExecutor(null);
        server.start();
        
        System.out.println("=== HTTP API SERVER STARTED ===");
        System.out.println("🚀 Сервер запущен на порту: " + port);
        System.out.println("🌐 Базовый URL: http://localhost:" + port);
    }
    
    /**
     * Остановка сервера
     */
    public void stop() {
        if (server != null) {
            server.stop(0);
            System.out.println("🛑 HTTP сервер остановлен");
        }
    }
    
    /**
     * Настройка OSHI endpoints
     */
    private void setupOSHIEndpoints() {
        server.createContext("/api/system/current", oshiService);
        server.createContext("/api/system/cpu", oshiService);
        server.createContext("/api/system/memory", oshiService);
        server.createContext("/api/system/sensors", oshiService);
    }
    
    /**
     * Настройка общих endpoints
     */
    private void setupGeneralEndpoints() {
        server.createContext("/", new ApiInfoHandler());
        server.createContext("/health", new HealthCheckHandler());
    }
    
    private static class ApiInfoHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setCORSHeaders(exchange);
            String apiInfo = "{\n" +
                "  \"service\": \"System Monitor API\",\n" +
                "  \"version\": \"2.0.0\",\n" +
                "  \"description\": \"Real-time system monitoring with OSHI\"\n" +
            "}";
            sendResponse(exchange, 200, apiInfo);
        }
    }
    
    private static class HealthCheckHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setCORSHeaders(exchange);
            String health = "{\n" +
                "  \"status\": \"UP\"\n" +
            "}";
            sendResponse(exchange, 200, health);
        }
    }
    
    private static void setCORSHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
    }
    
    private static void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
    
    public static void main(String[] args) {
        int port = 8080;
        if (args.length > 0) {
            try { port = Integer.parseInt(args[0]); } catch (NumberFormatException ignored) {}
        }
        HttpApiServer server = new HttpApiServer(port);
        Runtime.getRuntime().addShutdownHook(new Thread(server::stop));
        try {
            server.start();
        } catch (IOException e) {
            System.err.println("Error starting server: " + e.getMessage());
        }
    }
}
