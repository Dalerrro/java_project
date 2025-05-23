package db;

import java.sql.*;

public class DatabaseManager {
    private static final String DB_URL = "jdbc:postgresql://localhost:5432/dbd";
    private static final String USER = "root";
    private static final String PASSWORD = "password";
    private static final String DATA_TABLE = "DATA";

    public static void createTableIfNeeded() {
        final String createTableSQL = "CREATE TABLE IF NOT EXISTS " + DATA_TABLE + " ("
                + "CPU BIGINT NOT NULL,"
                + "MEMORY_TOTAL BIGINT NOT NULL,"
                + "MEMORY_USED BIGINT NOT NULL,"
                + "DISK_USAGE BIGINT NOT NULL,"
                + "TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
                + ")";

        try (Connection connection = connect(); Statement statement = connection.createStatement()) {
            statement.execute(createTableSQL);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public static Connection connect() {
        try {
            Class.forName("org.postgresql.Driver");
            return DriverManager.getConnection(DB_URL, USER, PASSWORD);
        } catch (ClassNotFoundException | SQLException e) {
            System.out.println("Database connection failed: " + e.getMessage());
            return null;
        }
    }
}
