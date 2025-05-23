import config.ConfigLoader;
import db.DatabaseManager;
import monitor.MonitoringTask;
import web.HttpApiServer;

import java.util.Properties;
import java.util.Timer;

public class App {
    public static void main(String[] args) {
        Properties properties = ConfigLoader.load("config.cfg");

        DatabaseManager.createTableIfNeeded();

        int period = Integer.parseInt(properties.getProperty("period", "1000"));
        new Timer().schedule(new MonitoringTask(), 0, period);

        HttpApiServer.start();
    }
}
