import oshi.SystemInfo;
import oshi.hardware.CentralProcessor;
import oshi.hardware.GlobalMemory;
import oshi.hardware.HardwareAbstractionLayer;
import oshi.hardware.Sensors;
import oshi.software.os.OperatingSystem;


public class SimpleSystemInfo {
    
    private SystemInfo systemInfo;
    private HardwareAbstractionLayer hardware;
    private CentralProcessor processor;
    private GlobalMemory memory;
    private Sensors sensors;
    private OperatingSystem os;
    
    private long[] prevTicks;
    
    public SimpleSystemInfo() {

        this.systemInfo = new SystemInfo();
        this.hardware = systemInfo.getHardware();
        this.processor = hardware.getProcessor();
        this.memory = hardware.getMemory();
        this.sensors = hardware.getSensors();
        this.os = systemInfo.getOperatingSystem();
        
        this.prevTicks = processor.getSystemCpuLoadTicks();
    }
    
    /**
     * Получить информацию о CPU
     */
    public CPUInfo getCPUInfo() {
        CPUInfo info = new CPUInfo();
        
        // Базовая информация
        info.name = processor.getProcessorIdentifier().getName().trim();
        info.vendor = processor.getProcessorIdentifier().getVendor().trim();
        info.physicalCores = processor.getPhysicalProcessorCount();
        info.logicalCores = processor.getLogicalProcessorCount();
        
        // Частоты
        long[] frequencies = processor.getCurrentFreq();
        if (frequencies.length > 0) {
            // Переводим из Hz в GHz
            info.currentFrequency = frequencies[0] / 1_000_000_000.0;
        }
        info.baseFrequency = processor.getProcessorIdentifier().getVendorFreq() / 1_000_000_000.0;
        
 
        long[] currentTicks = processor.getSystemCpuLoadTicks();
        info.usage = processor.getSystemCpuLoadBetweenTicks(prevTicks) * 100.0;
        prevTicks = currentTicks; 
        
        info.boostActive = info.currentFrequency > info.baseFrequency * 1.1;
        
        return info;
    }
    
    /**
     * Получить информацию о памяти
     */
    public MemoryInfo getMemoryInfo() {
        MemoryInfo info = new MemoryInfo();
        
        info.totalMemory = memory.getTotal();
        info.availableMemory = memory.getAvailable();
        info.usedMemory = info.totalMemory - info.availableMemory;
        info.usagePercent = (double) info.usedMemory / info.totalMemory * 100.0;
        
        // Swap память
        info.swapTotal = memory.getVirtualMemory().getSwapTotal();
        info.swapUsed = memory.getVirtualMemory().getSwapUsed();
        
        return info;
    }
    
    /**
     * Получить информацию о температуре
     */
    public SensorInfo getSensorInfo() {
        SensorInfo info = new SensorInfo();
        
        info.cpuTemperature = sensors.getCpuTemperature();
        info.cpuVoltage = sensors.getCpuVoltage();
        
        return info;
    }
    

    public GeneralInfo getGeneralInfo() {
        GeneralInfo info = new GeneralInfo();
        
        info.osName = os.getFamily();
        info.osVersion = os.getVersionInfo().toString();
        info.uptime = formatUptime(os.getSystemUptime());
        info.processCount = os.getProcessCount();
        info.threadCount = os.getThreadCount();
        
        return info;
    }
    
    private String formatUptime(long uptimeSeconds) {
        long days = uptimeSeconds / 86400;
        long hours = (uptimeSeconds % 86400) / 3600;
        long minutes = (uptimeSeconds % 3600) / 60;
        
        return String.format("%dd %dh %dm", days, hours, minutes);
    }
    
    public static class CPUInfo {
        public String name;
        public String vendor;
        public int physicalCores;
        public int logicalCores;
        public double baseFrequency;    
        public double currentFrequency;  
        public double usage;             
        public boolean boostActive;
        
        @Override
        public String toString() {
            return String.format(
                "CPU: %s\nЯдра: %d физ / %d лог\nЧастота: %.2f GHz (базовая: %.2f GHz)\nИспользование: %.1f%%\nBoost: %s",
                name, physicalCores, logicalCores, currentFrequency, baseFrequency, usage, 
                boostActive ? "Активен" : "Неактивен"
            );
        }
    }
    

    public static class MemoryInfo {
        public long totalMemory;     
        public long usedMemory;      
        public long availableMemory; 
        public double usagePercent;   
        public long swapTotal;       
        public long swapUsed;       
        
        @Override
        public String toString() {
            return String.format(
                "Память: %.1f%% (%.2f GB / %.2f GB)\nSwap: %.2f GB / %.2f GB",
                usagePercent, 
                usedMemory / 1024.0 / 1024.0 / 1024.0,
                totalMemory / 1024.0 / 1024.0 / 1024.0,
                swapUsed / 1024.0 / 1024.0 / 1024.0,
                swapTotal / 1024.0 / 1024.0 / 1024.0
            );
        }
    }
    

    public static class SensorInfo {
        public double cpuTemperature;  
        public double cpuVoltage;     
        
        @Override
        public String toString() {
            return String.format(
                "Температура CPU: %.1f°C\nНапряжение CPU: %.2fV",
                cpuTemperature, cpuVoltage
            );
        }
    }
    

    public static class GeneralInfo {
        public String osName;
        public String osVersion;
        public String uptime;
        public int processCount;
        public int threadCount;
        
        @Override
        public String toString() {
            return String.format(
                "ОС: %s %s\nВремя работы: %s\nПроцессы: %d\nПотоки: %d",
                osName, osVersion, uptime, processCount, threadCount
            );
        }
    }
}
