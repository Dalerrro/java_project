package config;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Properties;

public class ConfigLoader {
    public static Properties load(String filename) {
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
}
