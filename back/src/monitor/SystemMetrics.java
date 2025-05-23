// monitor/SystemMetrics.java

package monitor;

import java.io.*;
import java.util.HashMap;

public class SystemMetrics {
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
