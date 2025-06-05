// web/HttpApiServer.java

package web;

import com.sun.net.httpserver.HttpServer;
import db.DatabaseManager;
import monitor.SystemMetrics;

import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.sql.*;
import java.util.HashMap;

public class HttpApiServer {
    
    // Перегруженный метод для обратной совместимости
    public static void start() {
        start(8080);
    }
    
    public static void start(int port) {
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

            // Эндпоинт для получения истории метрик
            server.createContext("/metrics", exchange -> {
                if (!"GET".equals(exchange.getRequestMethod())) {
                    exchange.sendResponseHeaders(405, -1);
                    return;
                }
                
                try {
                    String response = getLastRecordsAsJson();
                    exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                    exchange.getResponseHeaders().add("Content-Type", "application/json");
                    exchange.sendResponseHeaders(200, response.getBytes().length);
                    
                    try (OutputStream os = exchange.getResponseBody()) {
                        os.write(response.getBytes());
                    }
                } catch (Exception e) {
                    System.err.println("Ошибка в /metrics: " + e.getMessage());
                    String errorResponse = "{\"error\":\"Ошибка получения данных\"}";
                    exchange.sendResponseHeaders(500, errorResponse.getBytes().length);
                    
                    try (OutputStream os = exchange.getResponseBody()) {
                        os.write(errorResponse.getBytes());
                    }
                }
            });

            // Эндпоинт для получения текущего статуса
            server.createContext("/status", exchange -> {
                if (!"GET".equals(exchange.getRequestMethod())) {
                    exchange.sendResponseHeaders(405, -1);
                    return;
                }
                
                try {
                    HashMap<String, Integer> swap = SystemMetrics.getSwap();
                    String uptime = SystemMetrics.getUptime();
                    int processes = SystemMetrics.getProcessCount();
                    double cpuTemp = SystemMetrics.getCPUTemperature();
                    int logical = SystemMetrics.getLogicalCores();
                    int physical = SystemMetrics.getPhysicalCores();
                    double freq = SystemMetrics.getCpuFrequency();
                
                    String json = "{"
                        + "\"uptime\":\"" + uptime + "\","
                        + "\"processes\":" + processes + ","
                        + "\"swap_total\":" + swap.get("total") + ","
                        + "\"swap_used\":" + swap.get("used") + ","
                        + "\"cpu_temp\":" + cpuTemp + ","
                        + "\"logical_cores\":" + logical + ","
                        + "\"physical_cores\":" + physical + ","
                        + "\"cpu_freq\":" + freq
                        + "}";
                
                    exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                    exchange.getResponseHeaders().add("Content-Type", "application/json");
                    exchange.sendResponseHeaders(200, json.getBytes().length);
                    
                    try (OutputStream os = exchange.getResponseBody()) {
                        os.write(json.getBytes());
                    }
                } catch (Exception e) {
                    System.err.println("Ошибка в /status: " + e.getMessage());
                    String errorResponse = "{\"error\":\"Ошибка получения статуса\"}";
                    exchange.sendResponseHeaders(500, errorResponse.getBytes().length);
                    
                    try (OutputStream os = exchange.getResponseBody()) {
                        os.write(errorResponse.getBytes());
                    }
                }
            });

            // Простой health check эндпоинт
            server.createContext("/health", exchange -> {
                String response = "{\"status\":\"ok\",\"timestamp\":" + System.currentTimeMillis() + "}";
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                exchange.getResponseHeaders().add("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, response.getBytes().length);
                
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(response.getBytes());
                }
            });

            server.setExecutor(null);
            server.start();
            
        } catch (Exception e) {
            System.err.println("Ошибка запуска HTTP сервера: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Не удалось запустить HTTP сервер", e);
        }
    }

    private static String getLastRecordsAsJson() {
        StringBuilder json = new StringBuilder("[");
        
        try (Connection conn = DatabaseManager.connect()) {
            if (conn == null) {
                throw new SQLException("Не удалось подключиться к базе данных");
            }
            
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT * FROM data ORDER BY timestamp DESC LIMIT 30")) {
                
                boolean first = true;
                while (rs.next()) {
                    if (!first) json.append(",");
                    json.append("{")
                        .append("\"cpu\":").append(rs.getInt("cpu")).append(",")
                        .append("\"memory_total\":").append(rs.getInt("memory_total")).append(",")
                        .append("\"memory_used\":").append(rs.getInt("memory_used")).append(",")
                        .append("\"disk_usage\":").append(rs.getInt("disk_usage")).append(",")
                        .append("\"timestamp\":\"").append(rs.getTimestamp("timestamp")).append("\"")
                        .append("}");
                    first = false;
                }
            }
        } catch (SQLException e) {
            System.err.println("Ошибка получения данных из БД: " + e.getMessage());
            e.printStackTrace();
            // Возвращаем пустой массив в случае ошибки
            return "[]";
        }
        
        json.append("]");
        return json.toString();
    }
}