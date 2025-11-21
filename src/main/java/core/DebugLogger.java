package core;

/**
 * DebugLogger - Centralized logging system with configurable debug levels
 * 
 * Usage:
 *   DebugLogger.setLevel(DebugLevel.INFO);  // Set log level
 *   DebugLogger.debug("Debug message");      // Only prints if level >= DEBUG
 *   DebugLogger.info("Info message");        // Only prints if level >= INFO
 *   DebugLogger.warn("Warning message");     // Only prints if level >= WARN
 *   DebugLogger.error("Error message");      // Always prints
 */
public class DebugLogger {
    
    public enum DebugLevel {
        OFF(0),      // No logging
        ERROR(1),    // Only errors
        WARN(2),     // Warnings and errors
        INFO(3),     // Important info, warnings, errors
        DEBUG(4),    // Everything including debug details
        TRACE(5);    // Maximum verbosity including algorithm internals
        
        private final int level;
        
        DebugLevel(int level) {
            this.level = level;
        }
        
        public int getLevel() {
            return level;
        }
    }
    
    private static DebugLevel currentLevel = DebugLevel.INFO;
    
    public static void setLevel(DebugLevel level) {
        currentLevel = level;
    }
    
    public static DebugLevel getLevel() {
        return currentLevel;
    }
    
    public static void trace(String message) {
        if (currentLevel.getLevel() >= DebugLevel.TRACE.getLevel()) {
            System.out.println("[TRACE] " + message);
        }
    }
    
    public static void debug(String message) {
        if (currentLevel.getLevel() >= DebugLevel.DEBUG.getLevel()) {
            System.out.println("[DEBUG] " + message);
        }
    }
    
    public static void info(String message) {
        if (currentLevel.getLevel() >= DebugLevel.INFO.getLevel()) {
            System.out.println("[INFO] " + message);
        }
    }
    
    public static void warn(String message) {
        if (currentLevel.getLevel() >= DebugLevel.WARN.getLevel()) {
            System.out.println("[WARN] " + message);
        }
    }
    
    public static void error(String message) {
        if (currentLevel.getLevel() >= DebugLevel.ERROR.getLevel()) {
            System.err.println("[ERROR] " + message);
        }
    }
    
    public static void error(String message, Throwable e) {
        if (currentLevel.getLevel() >= DebugLevel.ERROR.getLevel()) {
            System.err.println("[ERROR] " + message);
            e.printStackTrace();
        }
    }
}
