package core.API;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Utility class for monitoring and logging slow HTTP requests.
 * Logs request details when processing time exceeds the configured threshold.
 */
public class SlowRequestMonitor {
    
    private static final long SLOW_THRESHOLD_MS = 2000; // 2 seconds
    private static final String LOG_DIR = "slow-requests-logs";
    private static final DateTimeFormatter TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss_SSS");
    
    static {
        // Create log directory on startup
        try {
            Path logPath = Paths.get(LOG_DIR);
            if (!Files.exists(logPath)) {
                Files.createDirectories(logPath);
                System.out.println("Created slow requests log directory: " + LOG_DIR);
            }
        } catch (IOException e) {
            System.err.println("Failed to create slow requests log directory: " + e.getMessage());
        }
    }
    
    /**
     * Checks if the request duration exceeds the threshold and logs it if necessary.
     * 
     * @param requestBody The JSON request body
     * @param durationMs The request processing duration in milliseconds
     * @param endpoint The endpoint that was called (e.g., "/api/crafting")
     */
    public static void checkAndLog(String requestBody, long durationMs, String endpoint) {
        if (durationMs >= SLOW_THRESHOLD_MS) {
            logSlowRequest(requestBody, durationMs, endpoint);
        }
    }
    
    /**
     * Logs a slow request to disk with both JSON content and metadata.
     */
    private static void logSlowRequest(String requestBody, long durationMs, String endpoint) {
        try {
            String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMAT);
            String baseFilename = String.format("slow_request_%s_%dms", timestamp, durationMs);
            
            // Write request JSON
            File jsonFile = new File(LOG_DIR, baseFilename + ".json");
            try (FileWriter writer = new FileWriter(jsonFile)) {
                writer.write(requestBody);
            }
            
            // Write metadata
            File metaFile = new File(LOG_DIR, baseFilename + ".meta");
            try (FileWriter writer = new FileWriter(metaFile)) {
                writer.write("Timestamp: " + LocalDateTime.now() + "\n");
                writer.write("Duration: " + durationMs + "ms\n");
                writer.write("Endpoint: " + endpoint + "\n");
                writer.write("Threshold: " + SLOW_THRESHOLD_MS + "ms\n");
                writer.write("Request file: " + baseFilename + ".json\n");
            }
            
            System.out.println("⚠️  SLOW REQUEST LOGGED: " + endpoint + " took " + durationMs + "ms (threshold: " + SLOW_THRESHOLD_MS + "ms)");
            System.out.println("   Saved to: " + jsonFile.getAbsolutePath());
            
        } catch (IOException e) {
            System.err.println("Failed to log slow request: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Gets the configured threshold in milliseconds.
     */
    public static long getThreshold() {
        return SLOW_THRESHOLD_MS;
    }
}
