// monitor/MonitoringTask.java

package monitor;

import db.DatabaseManager;
import monitor.TelegramSender;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.TimerTask;

public class MonitoringTask extends TimerTask {
    
    @Override
    public void run() {
        try {
            // Получаем метрики системы
            int cpu = SystemMetrics.getCPU();
            int disk = SystemMetrics.getDiskUsage();
            HashMap<String, Integer> memory = SystemMetrics.getMemory();
            
            // Проверяем валидность полученных данных
            if (cpu < 0 || disk < 0 || memory.isEmpty()) {
                System.err.println("Ошибка получения системных метрик, пропускаем итерацию");
                return;
            }

            System.out.println("CPU: " + cpu + "%");
            System.out.println("Memory: " + memory.get("used") + "/" + memory.get("total"));
            System.out.println("DiskUsage: " + disk + "%");

            // Проверяем пороги и отправляем уведомления
            checkThresholdsAndNotify(cpu, memory, disk);

            // Сохраняем данные в БД с использованием try-with-resources
            saveMetricsToDatabase(cpu, memory, disk);
            
        } catch (Exception e) {
            System.err.println("Ошибка в MonitoringTask: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private void checkThresholdsAndNotify(int cpu, HashMap<String, Integer> memory, int disk) {
        try {
            if (cpu > 90) {
                TelegramSender.send("⚠️ Высокая загрузка CPU: " + cpu + "%");
            }
            
            int memoryTotal = memory.get("total");
            int memoryUsed = memory.get("used");
            if (memoryTotal > 0 && memoryUsed > memoryTotal * 0.9) {
                TelegramSender.send("⚠️ Память почти заполнена: " + memoryUsed + "/" + memoryTotal);
            }
            
            if (disk > 90) {
                TelegramSender.send("⚠️ Мало места на диске: " + disk + "% занято");
            }
        } catch (Exception e) {
            System.err.println("Ошибка при отправке уведомлений: " + e.getMessage());
        }
    }
    
    private void saveMetricsToDatabase(int cpu, HashMap<String, Integer> memory, int disk) {
        final String insertSQL = "INSERT INTO DATA (CPU, MEMORY_TOTAL, MEMORY_USED, DISK_USAGE) VALUES (?, ?, ?, ?)";
        
        // Используем try-with-resources для автоматического закрытия соединения
        try (Connection connection = DatabaseManager.connect()) {
            
            if (connection == null) {
                System.err.println("Не удалось подключиться к базе данных");
                return;
            }
            
            try (PreparedStatement stmt = connection.prepareStatement(insertSQL)) {
                stmt.setInt(1, cpu);
                stmt.setInt(2, memory.get("total"));
                stmt.setInt(3, memory.get("used"));
                stmt.setInt(4, disk);
                
                int rowsAffected = stmt.executeUpdate();
                if (rowsAffected > 0) {
                    System.out.println("Метрики успешно сохранены в БД");
                }
                
            } catch (SQLException e) {
                System.err.println("Ошибка при выполнении SQL запроса: " + e.getMessage());
                e.printStackTrace();
            }
            
        } catch (SQLException e) {
            System.err.println("Ошибка при работе с базой данных: " + e.getMessage());
            e.printStackTrace();
        }
    }
}