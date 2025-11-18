package core.Crafting;

/**
 * Exception thrown when a crafting computation is cancelled by the user.
 * 
 * This exception is used to signal graceful termination of the beam search
 * algorithm when the user requests cancellation via the progress tracking API.
 * 
 * <h2>Usage Pattern</h2>
 * <pre>{@code
 * // In Crafting_Algorithm.optimizeCrafting():
 * if (ProgressTracker.getProgress(sessionId).isCancelled()) {
 *     throw new CancelledException("User cancelled crafting computation");
 * }
 * }</pre>
 * 
 * @see ProgressTracker
 * @see core.ServerMain.CancelHandler
 */
public class CancelledException extends RuntimeException {
    
    /**
     * Constructs a new CancelledException with the specified detail message.
     * 
     * @param message The detail message explaining the cancellation.
     */
    public CancelledException(String message) {
        super(message);
    }
    
    /**
     * Constructs a new CancelledException with the specified detail message and cause.
     * 
     * @param message The detail message explaining the cancellation.
     * @param cause The cause of the cancellation (nullable).
     */
    public CancelledException(String message, Throwable cause) {
        super(message, cause);
    }
}
