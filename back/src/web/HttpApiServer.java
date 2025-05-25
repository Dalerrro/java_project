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
    public static void start() {
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

            server.createContext("/metrics", exchange -> {
                if (!"GET".equals(exchange.getRequestMethod())) {
                    exchange.sendResponseHeaders(405, -1);
                    return;
                }
                String response = getLastRecordsAsJson();
                exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                exchange.sendResponseHeaders(200, response.getBytes().length);
                OutputStream os = exchange.getResponseBody();
                os.write(response.getBytes());
                os.close();
            });

            server.createContext("/status", exchange -> {
                if (!"GET".equals(exchange.getRequestMethod())) {
                    exchange.sendResponseHeaders(405, -1);
                    return;
                }
                
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
                exchange.sendResponseHeaders(200, json.getBytes().length);
                OutputStream os = exchange.getResponseBody();
                os.write(json.getBytes());
                os.close();
            });
            

            server.setExecutor(null);
            server.start();
            System.out.println("HTTP сервер запущен на порту 8080");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static String getLastRecordsAsJson() {
        StringBuilder json = new StringBuilder("[");
        try (Connection conn = DatabaseManager.connect(); Statement stmt = conn.createStatement()) {
            ResultSet rs = stmt.executeQuery("SELECT * FROM data ORDER BY timestamp DESC LIMIT 30");
            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{")
                    .append("\"cpu\":" + rs.getInt("cpu") + ",")
                    .append("\"memory_total\":" + rs.getInt("memory_total") + ",")
                    .append("\"memory_used\":" + rs.getInt("memory_used") + ",")
                    .append("\"disk_usage\":" + rs.getInt("disk_usage"))
                    .append("}");
                first = false;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        json.append("]");
        return json.toString();
    }
}
