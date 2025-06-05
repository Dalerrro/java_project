package db;

import config.ConfigLoader;

import java.sql.*;
import java.util.Properties;

public class DatabaseManager {
    private static String DB_URL;
    private static String USER;
    private static String PASSWORD;
    private static final String DATA_TABLE = "DATA";
    
    // Статический блок для загрузки конфигурации
    static {
        Properties config = ConfigLoader.load("config.cfg");
        DB_URL = config.getProperty("db.url", "jdbc:postgresql://localhost:5432/dbd");
        USER = config.getProperty("db.user", "root");
        PASSWORD = config.getProperty("db.password", "password");
    }

    public static void createTableIfNeeded() {
        final String createTableSQL = "CREATE TABLE IF NOT EXISTS " + DATA_TABLE + " ("
                + "id SERIAL PRIMARY KEY,"
                + "CPU BIGINT NOT NULL,"
                + "MEMORY_TOTAL BIGINT NOT NULL,"
                + "MEMORY_USED BIGINT NOT NULL,"
                + "DISK_USAGE BIGINT NOT NULL,"
                + "TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
                + ")";

        try (Connection connection = connect()) {
            if (connection == null) {
                throw new SQLException("Не удалось подключиться к базе данных");
            }
            
            try (Statement statement = connection.createStatement()) {
                statement.execute(createTableSQL);
                System.out.println("Таблица " + DATA_TABLE + " готова к использованию");
            }
        } catch (SQLException e) {
            System.err.println("Ошибка создания таблицы: " + e.getMessage());
            throw new RuntimeException("Не удалось создать таблицу в БД", e);
        }
    }

    public static Connection connect() {
        try {
            Class.forName("org.postgresql.Driver");
            Connection connection = DriverManager.getConnection(DB_URL, USER, PASSWORD);
            
            // Проверяем, что соединение работает
            if (connection != null && !connection.isClosed()) {
                return connection;
            } else {
                System.err.println("Соединение с БД не установлено");
                return null;
            }
            
        } catch (ClassNotFoundException e) {
            System.err.println("PostgreSQL драйвер не найден: " + e.getMessage());
            return null;
        } catch (SQLException e) {
            System.err.println("Ошибка подключения к БД: " + e.getMessage());
            System.err.println("URL: " + DB_URL);
            System.err.println("User: " + USER);
            return null;
        }
    }
    
    // Метод для проверки соединения с БД
    public static boolean isConnectionValid() {
        try (Connection conn = connect()) {
            return conn != null && conn.isValid(5); // 5 секунд на проверку
        } catch (SQLException e) {
            return false;
        }
    }
    
    // Метод для получения информации о БД
    public static String getDatabaseInfo() {
        try (Connection conn = connect()) {
            if (conn != null) {
                DatabaseMetaData metaData = conn.getMetaData();
                return "База данных: " + metaData.getDatabaseProductName() + 
                       " " + metaData.getDatabaseProductVersion();
            }
        } catch (SQLException e) {
            System.err.println("Ошибка получения информации о БД: " + e.getMessage());
        }
        return "Информация о БД недоступна";
    }
}