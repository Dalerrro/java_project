public class TestOSHI {
    
    public static void main(String[] args) {
        System.out.println("=== ТЕСТ OSHI БИБЛИОТЕКИ ===\n");
        
        try {
            SimpleSystemInfo systemInfo = new SimpleSystemInfo();
            
            System.out.println("📋 ОБЩАЯ ИНФОРМАЦИЯ:");
            System.out.println(systemInfo.getGeneralInfo());
            System.out.println();
            
            System.out.println("🖥️ ПРОЦЕССОР:");
            System.out.println(systemInfo.getCPUInfo());
            System.out.println();
            
            System.out.println("💾 ПАМЯТЬ:");
            System.out.println(systemInfo.getMemoryInfo());
            System.out.println();
            
            System.out.println("🌡️ СЕНСОРЫ:");
            System.out.println(systemInfo.getSensorInfo());
            System.out.println();
            
            System.out.println("🔄 ТЕСТ НЕСКОЛЬКИХ ЗАМЕРОВ CPU:");
            for (int i = 1; i <= 3; i++) {
                Thread.sleep(1000);
                SimpleSystemInfo.CPUInfo cpu = systemInfo.getCPUInfo();
                System.out.printf("Замер %d: CPU %.1f%%, Частота %.2f GHz, Boost: %s\n", 
                    i, cpu.usage, cpu.currentFrequency, cpu.boostActive ? "ДА" : "НЕТ");
            }
            
            System.out.println("\n✅ ТЕСТ ЗАВЕРШЕН УСПЕШНО!");
            
        } catch (Exception e) {
            System.out.println("❌ ОШИБКА: " + e.getMessage());
            e.printStackTrace();
        }
    }
}