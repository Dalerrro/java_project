import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.*;
import java.util.*;
import java.net.InetSocketAddress;


import com.sun.net.httpserver.HttpServer;
// import com.sun.net.httpserver.HttpHandler;
// import com.sun.net.httpserver.HttpExchange;

public class Main {
    static final String DB_URL = "jdbc:postgresql://localhost:5432/dbd";
    static final String USER = "root";
    static final String PASSWORD = "password";
    static final String DATA_TABLE = "DATA";

    public static void main(String[] args) {
        Properties properties = readPropertiesFromFile("config.cfg");
        createDBTable();

        int period = Integer.parseInt(properties.getProperty("period", "1000"));
        new Timer().schedule(createMainTask(), 0, period);

        startHttpServer();
    }

    public static void createDBTable() {
        final String createTableSQL = "CREATE TABLE IF NOT EXISTS " + DATA_TABLE + " ("
                + "CPU BIGINT NOT NULL,"
                + "MEMORY_TOTAL BIGINT NOT NULL,"
                + "MEMORY_USED BIGINT NOT NULL,"
                + "DISK_USAGE BIGINT NOT NULL,"
                + "TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
                + ")";

        try (Connection connection = tryConnectToDB(); Statement statement = connection.createStatement()) {
            statement.execute(createTableSQL);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public static Connection tryConnectToDB() {
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            System.out.println("PostgreSQL JDBC Driver is not found. Include it in your library path.");
            e.printStackTrace();
        }

        try {
            return DriverManager.getConnection(DB_URL, USER, PASSWORD);
        } catch (SQLException e) {
            System.out.println("Connection Failed");
            return null;
        }
    }

    public static TimerTask createMainTask() {
        return new TimerTask() {
            final Connection connection = tryConnectToDB();

            @Override
            public void run() {
                int CPU = getCPU();
                int DiskUsage = getDiskUsage();
                HashMap<String, Integer> MEMORY = getMemory();

                System.out.println("CPU: " + CPU + "%");
                System.out.println("Memory: " + MEMORY.get("used") + "/" + MEMORY.get("total"));
                System.out.println("DiskUsage: " + DiskUsage + "%");

                final String insertSQL = "INSERT INTO " + DATA_TABLE + " (CPU, MEMORY_TOTAL, MEMORY_USED, DISK_USAGE) VALUES (?, ?, ?, ?)";

                try (PreparedStatement stmt = connection.prepareStatement(insertSQL)) {
                    stmt.setInt(1, CPU);
                    stmt.setInt(2, MEMORY.get("total"));
                    stmt.setInt(3, MEMORY.get("used"));
                    stmt.setInt(4, DiskUsage);
                    stmt.executeUpdate();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        };
    }

    public static Properties readPropertiesFromFile(String filename) {
        Properties properties = new Properties();

        try {
            properties.load(Files.newInputStream(Paths.get(filename)));
        } catch (IOException e) {
            try (FileWriter writer = new FileWriter(filename)) {
                writer.write("period = 1000\n");
            } catch (IOException ex) {
                System.out.println("Не удалось создать файл конфигурации.");
            }
        }

        return properties;
    }

    public static int getCPU() {
        ProcessBuilder builder = new ProcessBuilder("vmstat", "1", "2", "-w").redirectErrorStream(true);
        try {
            Process p = builder.start();
            BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()));
            String line = null, temp;
            while ((temp = r.readLine()) != null) line = temp;
            String[] per = line.replaceAll("\\s+", " ").split(" ");
            return Integer.parseInt(per[13]);
        } catch (IOException | NumberFormatException e) {
            return -1;
        }
    }

    public static HashMap<String, Integer> getMemory() {
        ProcessBuilder builder = new ProcessBuilder("free").redirectErrorStream(true);
        try {
            Process p = builder.start();
            BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()));
            String[] lines = new String[3];
            int count = 0;
            String temp;
            while ((temp = r.readLine()) != null && count < 3) lines[count++] = temp;
            String[] per = lines[1].replaceAll("\\s+", " ").split(" ");
            return new HashMap<String, Integer>() {{
                put("total", Integer.parseInt(per[1]));
                put("used", Integer.parseInt(per[2]));
            }};
        } catch (IOException e) {
            return new HashMap<>();
        }
    }

    public static int getDiskUsage() {
        ProcessBuilder builder = new ProcessBuilder("df", "-h", "--total").redirectErrorStream(true);
        try {
            Process p = builder.start();
            BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()));
            String line = null, temp;
            while ((temp = r.readLine()) != null) line = temp;
            String[] per = line.replaceAll("\\s+", " ").split(" ");
            return Integer.parseInt(per[4].replaceAll("\\D", ""));
        } catch (IOException | NumberFormatException e) {
            return -1;
        }
    }

    public static void startHttpServer() {
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
    
            // ⬇️ Контекст /metrics — уже был
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
    
            // ⬇️ Новый контекст /status
            server.createContext("/status", exchange -> {
                if (!"GET".equals(exchange.getRequestMethod())) {
                    exchange.sendResponseHeaders(405, -1);
                    return;
                }
    
                HashMap<String, Integer> swap = getSwap();
                String json = "{"
                        + "\"uptime\":\"" + getUptime() + "\","
                        + "\"processes\":" + getProcessCount() + ","
                        + "\"swap_total\":" + swap.get("total") + ","
                        + "\"swap_used\":" + swap.get("used")
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
        } catch (IOException e) {
            e.printStackTrace();
        }
    }    

    public static String getLastRecordsAsJson() {
        StringBuilder json = new StringBuilder("[");
        try (Connection conn = tryConnectToDB(); Statement stmt = conn.createStatement()) {
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

    public static HashMap<String, Integer> getSwap() {
        ProcessBuilder builder = new ProcessBuilder("free");
        builder.redirectErrorStream(true);
        HashMap<String, Integer> result = new HashMap<>();
        try {
            Process p = builder.start();
            BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()));
            String line;
            while ((line = r.readLine()) != null) {
                if (line.toLowerCase().startsWith("swap")) {
                    String[] parts = line.trim().split("\\s+");
                    result.put("total", Integer.parseInt(parts[1]));
                    result.put("used", Integer.parseInt(parts[2]));
                    break;
                }
            }
        } catch (IOException e) {
            result.put("total", 0);
            result.put("used", 0);
        }
        return result;
    }

    public static String getUptime() {
        ProcessBuilder builder = new ProcessBuilder("uptime", "-p");
        builder.redirectErrorStream(true);
        try {
            Process p = builder.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()));
            String line = reader.readLine();
            return line != null ? line.trim() : "unknown";
        } catch (IOException e) {
            return "unknown";
        }
    }

    public static int getProcessCount() {
        ProcessBuilder builder = new ProcessBuilder("ps", "-e");
        builder.redirectErrorStream(true);
        try {
            Process p = builder.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()));
            int count = 0;
            while (reader.readLine() != null) {
                count++;
            }
            return count;
        } catch (IOException e) {
            return -1;
        }
    }

}
