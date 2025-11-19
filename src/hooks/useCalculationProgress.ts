import { useState, useEffect, useRef } from 'react';

/**
 * Progress data structure returned from backend
 */
export interface ProgressData {
  percent: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
  cancelled: boolean;
}

/**
 * Hook return type
 */
interface UseCalculationProgressReturn {
  progress: ProgressData | null;
  error: Error | null;
  isPolling: boolean;
}

/**
 * Custom hook for polling calculation progress from backend
 * 
 * Polls GET /api/progress/{sessionId} every 100ms while active.
 * Automatically cleans up interval on unmount or when sessionId changes.
 * 
 * @param sessionId - Unique session identifier from backend (UUID)
 * @param enabled - Whether polling is active (default: true)
 * @returns Progress data, error state, and polling status
 * 
 * @example
 * ```typescript
 * const { progress, error } = useCalculationProgress(sessionId, isCalculating);
 * 
 * if (progress) {
 *   console.log(`Progress: ${progress.percent}%`);
 *   console.log(`Elapsed: ${progress.elapsedMs}ms`);
 * }
 * ```
 */
export function useCalculationProgress(
  sessionId: string | null,
  enabled: boolean = true
): UseCalculationProgressReturn {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear previous state when sessionId changes
    setProgress(null);
    setError(null);

    // Don't poll if disabled or no sessionId
    if (!enabled || !sessionId) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);

    // Poll progress endpoint every 100ms
    const poll = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/progress/${sessionId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            // Session not found - likely completed or cancelled
            // Stop polling but don't show error
            setIsPolling(false);
            if (intervalRef.current !== null) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: ProgressData = await response.json();
        setProgress(data);
        setError(null);

        // Stop polling if cancelled (backend will clean up session)
        if (data.cancelled) {
          setIsPolling(false);
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch progress'));
        // Don't stop polling on transient errors - backend might be busy
      }
    };

    // Start polling immediately
    poll();

    // Set up interval for subsequent polls
    intervalRef.current = window.setInterval(poll, 100);

    // Cleanup function
    return () => {
      setIsPolling(false);
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sessionId, enabled]);

  return { progress, error, isPolling };
}
