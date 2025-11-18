package core.Crafting;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Thread-safe progress tracking for long-running crafting computations.
 * 
 * <h2>Purpose</h2>
 * Enables real-time progress monitoring and user-initiated cancellation for
 * beam search operations that may take several seconds or longer. Supports
 * concurrent sessions for multi-user scenarios.
 * 
 * <h2>Architecture</h2>
 * - Uses ConcurrentHashMap for thread-safe session storage
 * - Atomic counters ensure consistency across threads
 * - Immutable progress snapshots prevent race conditions
 * 
 * <h2>Usage Pattern</h2>
 * <pre>{@code
 * // In Crafting_Algorithm.optimizeCrafting():
 * ProgressTracker.startSession(sessionId, totalIterations);
 * try {
 *     for (int i = 0; i < totalIterations; i++) {
 *         SessionProgress progress = ProgressTracker.getProgress(sessionId);
 *         if (progress != null && progress.isCancelled()) {
 *             throw new CancelledException("User cancelled computation");
 *         }
 *         
 *         // ... perform beam search iteration ...
 *         
 *         ProgressTracker.incrementProgress(sessionId);
 *     }
 * } finally {
 *     ProgressTracker.endSession(sessionId);
 * }
 * 
 * // In frontend (polling every 100ms):
 * GET /api/progress/{sessionId}
 * // Returns: { "percent": 45.2, "elapsedMs": 12000, "estimatedRemainingMs": 14500 }
 * }</pre>
 * 
 * <h2>Thread Safety</h2>
 * All methods are thread-safe. Multiple threads can query or update progress
 * concurrently without additional synchronization.
 * 
 * @see SessionProgress
 * @see core.ServerMain (HTTP endpoints)
 * @see Crafting_Algorithm#optimizeCrafting (integration point)
 */
public class ProgressTracker {
    
    /**
     * Active progress sessions indexed by sessionId.
     * ConcurrentHashMap ensures thread-safe access without external locking.
     */
    private static final ConcurrentHashMap<String, SessionProgress> sessions = new ConcurrentHashMap<>();
    
    /**
     * Represents progress for a single crafting computation session.
     * 
     * <h3>Immutability</h3>
     * Progress data methods (getPercent, getElapsedMs, etc.) return snapshots
     * at the time of invocation. Values may change between calls.
     * 
     * <h3>Thread Safety</h3>
     * All fields use atomic operations, ensuring consistency without locks.
     */
    public static class SessionProgress {
        private final AtomicInteger totalIterations;
        private final AtomicInteger completedIterations;
        private final AtomicLong startTimeMs;
        private final AtomicBoolean cancelled;
        
        /**
         * Creates a new session progress tracker.
         * 
         * @param totalIterations Expected total iterations (e.g., threshold countdown steps).
         * @throws IllegalArgumentException if totalIterations <= 0
         */
        public SessionProgress(int totalIterations) {
            if (totalIterations <= 0) {
                throw new IllegalArgumentException("totalIterations must be positive: " + totalIterations);
            }
            this.totalIterations = new AtomicInteger(totalIterations);
            this.completedIterations = new AtomicInteger(0);
            this.startTimeMs = new AtomicLong(System.currentTimeMillis());
            this.cancelled = new AtomicBoolean(false);
        }
        
        /**
         * Returns completion percentage (0.0 - 100.0).
         * 
         * @return Percentage of iterations completed.
         */
        public double getPercent() {
            int total = totalIterations.get();
            int completed = completedIterations.get();
            if (total == 0) return 0.0;
            return (completed * 100.0) / total;
        }
        
        /**
         * Returns elapsed time since session start in milliseconds.
         * 
         * @return Elapsed time in milliseconds.
         */
        public long getElapsedMs() {
            return System.currentTimeMillis() - startTimeMs.get();
        }
        
        /**
         * Estimates remaining time based on current progress rate.
         * 
         * Formula: remainingMs = (elapsedMs / completedIterations) * remainingIterations
         * 
         * @return Estimated remaining time in milliseconds, or -1 if cannot estimate
         *         (e.g., no iterations completed yet).
         */
        public long getEstimatedRemainingMs() {
            int completed = completedIterations.get();
            if (completed == 0) return -1; // Cannot estimate without progress
            
            long elapsed = getElapsedMs();
            int total = totalIterations.get();
            int remaining = total - completed;
            
            // Avoid division by zero (though completed > 0 guarantees this)
            double avgMsPerIteration = (double) elapsed / completed;
            return (long) (avgMsPerIteration * remaining);
        }
        
        /**
         * Increments the completed iteration count.
         * Called by the algorithm after each iteration completes.
         */
        public void incrementProgress() {
            completedIterations.incrementAndGet();
        }
        
        /**
         * Marks this session as cancelled by the user.
         * The algorithm should check isCancelled() periodically and terminate gracefully.
         */
        public void cancel() {
            cancelled.set(true);
        }
        
        /**
         * Checks if the user has requested cancellation.
         * 
         * @return true if cancel() was called, false otherwise.
         */
        public boolean isCancelled() {
            return cancelled.get();
        }
        
        /**
         * Returns the total number of expected iterations.
         * 
         * @return Total iterations for this session.
         */
        public int getTotalIterations() {
            return totalIterations.get();
        }
        
        /**
         * Returns the number of completed iterations.
         * 
         * @return Completed iterations count.
         */
        public int getCompletedIterations() {
            return completedIterations.get();
        }
        
        /**
         * Updates the total iteration count (used when recalculating iterations dynamically).
         * 
         * @param newTotal New total iteration count.
         * @throws IllegalArgumentException if newTotal <= 0
         */
        public void updateTotalIterations(int newTotal) {
            if (newTotal <= 0) {
                throw new IllegalArgumentException("newTotal must be positive: " + newTotal);
            }
            totalIterations.set(newTotal);
        }
        
        /**
         * Returns a JSON-compatible representation of current progress.
         * 
         * @return JSON string with percent, elapsedMs, estimatedRemainingMs, cancelled.
         */
        public String toJson() {
            return String.format(
                "{\"percent\":%.2f,\"elapsedMs\":%d,\"estimatedRemainingMs\":%d,\"cancelled\":%b}",
                getPercent(),
                getElapsedMs(),
                getEstimatedRemainingMs(),
                isCancelled()
            );
        }
    }
    
    /**
     * Starts a new progress tracking session.
     * 
     * If a session with the same sessionId already exists, it will be replaced.
     * The algorithm should call this before starting computation.
     * 
     * @param sessionId Unique identifier for this computation session (e.g., UUID).
     * @param totalIterations Expected total iterations (e.g., threshold countdown steps).
     * @throws IllegalArgumentException if sessionId is null or empty, or totalIterations <= 0.
     */
    public static void startSession(String sessionId, int totalIterations) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            throw new IllegalArgumentException("sessionId cannot be null or empty");
        }
        if (totalIterations <= 0) {
            throw new IllegalArgumentException("totalIterations must be positive: " + totalIterations);
        }
        sessions.put(sessionId, new SessionProgress(totalIterations));
    }
    
    /**
     * Retrieves the progress for a given session.
     * 
     * @param sessionId The unique session identifier.
     * @return SessionProgress object, or null if session doesn't exist.
     */
    public static SessionProgress getProgress(String sessionId) {
        return sessions.get(sessionId);
    }
    
    /**
     * Increments the progress for a given session by 1 iteration.
     * 
     * Convenience method equivalent to:
     * <pre>{@code
     * SessionProgress progress = ProgressTracker.getProgress(sessionId);
     * if (progress != null) progress.incrementProgress();
     * }</pre>
     * 
     * @param sessionId The unique session identifier.
     * @throws IllegalStateException if session doesn't exist.
     */
    public static void incrementProgress(String sessionId) {
        SessionProgress progress = sessions.get(sessionId);
        if (progress == null) {
            throw new IllegalStateException("No session found for sessionId: " + sessionId);
        }
        progress.incrementProgress();
    }
    
    /**
     * Cancels a progress tracking session.
     * 
     * Sets the cancelled flag to true. The algorithm should check this periodically
     * and terminate gracefully when cancellation is requested.
     * 
     * @param sessionId The unique session identifier.
     * @throws IllegalStateException if session doesn't exist.
     */
    public static void cancelSession(String sessionId) {
        SessionProgress progress = sessions.get(sessionId);
        if (progress == null) {
            throw new IllegalStateException("No session found for sessionId: " + sessionId);
        }
        progress.cancel();
    }
    
    /**
     * Ends a progress tracking session and removes it from memory.
     * 
     * Should be called in a finally block to ensure cleanup even if computation fails.
     * 
     * @param sessionId The unique session identifier.
     */
    public static void endSession(String sessionId) {
        sessions.remove(sessionId);
    }
    
    /**
     * Checks if a session with the given ID exists.
     * 
     * @param sessionId The unique session identifier.
     * @return true if session exists, false otherwise.
     */
    public static boolean hasSession(String sessionId) {
        return sessions.containsKey(sessionId);
    }
    
    /**
     * Returns the number of active sessions.
     * 
     * Useful for monitoring resource usage in multi-user scenarios.
     * 
     * @return Count of active progress sessions.
     */
    public static int getActiveSessionCount() {
        return sessions.size();
    }
    
    /**
     * Clears all active sessions.
     * 
     * WARNING: This will remove progress tracking for all ongoing computations.
     * Use only for testing or emergency cleanup scenarios.
     */
    public static void clearAllSessions() {
        sessions.clear();
    }
}
