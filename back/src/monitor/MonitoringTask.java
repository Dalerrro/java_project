// monitor/MonitoringTask.java

package monitor;

import db.DatabaseManager;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.TimerTask;

public class MonitoringTask extends TimerTask {
    private final Connection connection = DatabaseManager.connect();

    @Override
    public void run() {
        int cpu = SystemMetrics.getCPU();
        int disk = SystemMetrics.getDiskUsage();
        HashMap<String, Integer> memory = SystemMetrics.getMemory();

        System.out.println("CPU: " + cpu + "%");
        System.out.println("Memory: " + memory.get("used") + "/" + memory.get("total"));
        System.out.println("DiskUsage: " + disk + "%");

        final String insertSQL = "INSERT INTO DATA (CPU, MEMORY_TOTAL, MEMORY_USED, DISK_USAGE) VALUES (?, ?, ?, ?)";

        try (PreparedStatement stmt = connection.prepareStatement(insertSQL)) {
            stmt.setInt(1, cpu);
            stmt.setInt(2, memory.get("total"));
            stmt.setInt(3, memory.get("used"));
            stmt.setInt(4, disk);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
