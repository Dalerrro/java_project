// back/src/OSHIWebService.java

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * Веб-сервис для отдачи OSHI данных через HTTP API
 */
public class OSHIWebService implements HttpHandler {
    
    private SimpleSystemInfo systemInfo;
    
    public OSHIWebService() {
        this.systemInfo = new SimpleSystemInfo();
    }
    
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // Добавляем CORS заголовки
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
        
        String path = exchange.getRequestURI().getPath();
        String response = "";
        
        try {
            switch (path) {
                case "/api/system/current":
                    response = getCompleteSystemInfo();
                    break;
                case "/api/system/cpu":
                    response = getCPUInfo();
                    break;
                case "/api/system/memory":
                    response = getMemoryInfo();
                    break;
                case "/api/system/sensors":
                    response = getSensorInfo();
                    break;
                default:
                    response = "{\"error\": \"Unknown endpoint\"}";
                    break;
            }
            
            // Отправляем ответ
            byte[] responseBytes = response.getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, responseBytes.length);
            
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(responseBytes);
            }
            
        } catch (Exception e) {
            String errorResponse = String.format(
                "{\"error\": \"Internal server error\", \"message\": \"%s\"}", 
                e.getMessage().replace("\"", "\\\"")
            );
            
            byte[] errorBytes = errorResponse.getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(500, errorBytes.length);
            
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(errorBytes);
            }
        }
    }
    
    private String getCompleteSystemInfo() {
        SimpleSystemInfo.GeneralInfo general = systemInfo.getGeneralInfo();
        SimpleSystemInfo.CPUInfo cpu = systemInfo.getCPUInfo();
        SimpleSystemInfo.MemoryInfo memory = systemInfo.getMemoryInfo();
        SimpleSystemInfo.SensorInfo sensors = systemInfo.getSensorInfo();
        
        return String.format(
            "{" +
                "\"timestamp\": %d," +
                "\"staticInfo\": {" +
                    "\"osName\": \"%s\"," +
                    "\"uptime\": \"%s\"," +
                    "\"processes\": %d," +
                    "\"physicalCores\": %d," +
                    "\"logicalCores\": %d" +
                "}," +
                "\"currentMetrics\": {" +
                    "\"cpuUsage\": %.2f," +
                    "\"memoryUsed\": %d," +
                    "\"memoryTotal\": %d," +
                    "\"memoryUsagePercent\": %.2f" +
                "}," +
                "\"cpuDetails\": {" +
                    "\"name\": \"%s\"," +
                    "\"vendor\": \"%s\"," +
                    "\"currentFrequency\": %.2f," +
                    "\"boostActive\": %s" +
                "}," +
                "\"sensorData\": {" +
                    "\"cpuTemperature\": %.2f," +
                    "\"cpuVoltage\": %.2f" +
                "}" +
            "}",
            System.currentTimeMillis(),
            escapeJson(general.osName),
            escapeJson(general.uptime),
            general.processCount,
            cpu.physicalCores,
            cpu.logicalCores,
            cpu.usage,
            memory.usedMemory,
            memory.totalMemory,
            memory.usagePercent,
            escapeJson(cpu.name),
            escapeJson(cpu.vendor),
            cpu.currentFrequency,
            cpu.boostActive,
            sensors.cpuTemperature,
            sensors.cpuVoltage
        );
    }
    
    private String getCPUInfo() {
        SimpleSystemInfo.CPUInfo cpu = systemInfo.getCPUInfo();
        
        return String.format(
            "{" +
                "\"name\": \"%s\"," +
                "\"vendor\": \"%s\"," +
                "\"physicalCores\": %d," +
                "\"logicalCores\": %d," +
                "\"currentFrequency\": %.2f," +
                "\"usage\": %.2f," +
                "\"boostActive\": %s" +
            "}",
            escapeJson(cpu.name),
            escapeJson(cpu.vendor),
            cpu.physicalCores,
            cpu.logicalCores,
            cpu.currentFrequency,
            cpu.usage,
            cpu.boostActive
        );
    }
    
    private String getMemoryInfo() {
        SimpleSystemInfo.MemoryInfo memory = systemInfo.getMemoryInfo();
        
        return String.format(
            "{" +
                "\"totalMemory\": %d," +
                "\"usedMemory\": %d," +
                "\"availableMemory\": %d," +
                "\"usagePercent\": %.2f" +
            "}",
            memory.totalMemory,
            memory.usedMemory,
            memory.availableMemory,
            memory.usagePercent
        );
    }
    
    private String getSensorInfo() {
        SimpleSystemInfo.SensorInfo sensors = systemInfo.getSensorInfo();
        
        return String.format(
            "{" +
                "\"cpuTemperature\": %.2f," +
                "\"cpuVoltage\": %.2f" +
            "}",
            sensors.cpuTemperature,
            sensors.cpuVoltage
        );
    }
    
    private String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\"", "\\\"")
                  .replace("\\", "\\\\")
                  .replace("\n", "\\n");
    }
}