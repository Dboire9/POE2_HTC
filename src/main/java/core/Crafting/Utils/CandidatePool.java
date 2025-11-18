package core.Crafting.Utils;

import java.util.concurrent.ConcurrentLinkedQueue;
import core.Crafting.Crafting_Candidate;

/**
 * Thread-safe object pool for Crafting_Candidate instances.
 * Reduces heap pressure by reusing candidate objects instead of creating new ones.
 * 
 * CRITICAL: This is a key memory optimization to prevent OutOfMemoryError in complex scenarios.
 * 
 * Usage pattern:
 * <pre>
 * CandidatePool pool = new CandidatePool(50000);
 * Crafting_Candidate candidate = pool.acquire();
 * try {
 *     // Use candidate
 * } finally {
 *     pool.release(candidate);
 * }
 * </pre>
 * 
 * @see core.Crafting.Crafting_Candidate#reset()
 */
public class CandidatePool {
    /**
     * Thread-safe queue holding pooled candidates.
     * ConcurrentLinkedQueue provides lock-free operations for high performance.
     */
    private final ConcurrentLinkedQueue<Crafting_Candidate> pool;
    
    /**
     * Maximum number of candidates to keep in the pool.
     * Prevents unbounded memory growth.
     */
    private final int maxPoolSize;
    
    /**
     * Creates a new candidate pool with the specified maximum size.
     * 
     * @param maxPoolSize Maximum number of candidates to keep in pool (e.g., 50000)
     * @throws IllegalArgumentException if maxPoolSize <= 0
     */
    public CandidatePool(int maxPoolSize) {
        if (maxPoolSize <= 0) {
            throw new IllegalArgumentException("maxPoolSize must be positive");
        }
        this.pool = new ConcurrentLinkedQueue<>();
        this.maxPoolSize = maxPoolSize;
    }
    
    /**
     * Acquires a candidate from the pool, or creates a new one if pool is empty.
     * 
     * This method is thread-safe and can be called concurrently.
     * 
     * @return A ready-to-use Crafting_Candidate (may be recycled from pool)
     */
    public Crafting_Candidate acquire() {
        Crafting_Candidate candidate = pool.poll();
        if (candidate != null) {
            // Reusing pooled candidate
            return candidate;
        }
        // Pool empty, create new instance
        return new Crafting_Candidate();
    }
    
    /**
     * Returns a candidate to the pool after use.
     * The candidate is automatically reset to prevent data leakage.
     * 
     * This method is thread-safe and can be called concurrently.
     * 
     * CRITICAL: Always call this in a finally block to ensure candidates are returned.
     * 
     * @param candidate The candidate to return to pool (must not be null)
     * @throws IllegalArgumentException if candidate is null
     */
    public void release(Crafting_Candidate candidate) {
        if (candidate == null) {
            throw new IllegalArgumentException("Cannot release null candidate");
        }
        
        // Only add to pool if not at capacity
        if (pool.size() < maxPoolSize) {
            candidate.reset(); // Clear data to prevent leakage
            pool.offer(candidate);
        }
        // If pool is full, let candidate be garbage collected
    }
    
    /**
     * Gets the current number of candidates in the pool.
     * 
     * Note: This is an approximate count in concurrent scenarios.
     * 
     * @return Current pool size (between 0 and maxPoolSize)
     */
    public int size() {
        return pool.size();
    }
    
    /**
     * Gets the maximum pool size configured.
     * 
     * @return Maximum number of candidates this pool can hold
     */
    public int getMaxPoolSize() {
        return maxPoolSize;
    }
    
    /**
     * Clears all candidates from the pool.
     * Useful for cleanup or testing.
     */
    public void clear() {
        pool.clear();
    }
}
