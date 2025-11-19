import { Button } from './ui/button';
import { Card } from './ui/card';
import type { ProgressData } from '../hooks/useCalculationProgress';

/**
 * ProgressBar component props
 */
interface ProgressBarProps {
  /** Progress data from backend */
  progress: ProgressData;
  /** Callback when cancel button is clicked */
  onCancel: () => void;
}

/**
 * Formats milliseconds into human-readable time string
 * @param ms - Time in milliseconds
 * @returns Formatted string (e.g., "1m 23s", "45s", "12.3s")
 */
function formatTime(ms: number): string {
  if (ms < 0) return '0s';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  if (seconds >= 10) {
    return `${seconds}s`;
  }
  
  // Show decimal for < 10s
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Visual progress bar component with ETA and cancel button
 * 
 * Displays:
 * - Progress bar with percentage
 * - Elapsed time
 * - Estimated remaining time
 * - Cancel button
 * 
 * Features:
 * - Smooth CSS transitions
 * - Accessible (ARIA labels)
 * - Dark mode support
 * 
 * @example
 * ```tsx
 * <ProgressBar
 *   progress={{ percent: 45.2, elapsedMs: 12000, estimatedRemainingMs: 14500, cancelled: false }}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export function ProgressBar({ progress, onCancel }: ProgressBarProps) {
  const { percent, elapsedMs, estimatedRemainingMs, cancelled } = progress;
  
  // Clamp percent to 0-100 range
  const clampedPercent = Math.max(0, Math.min(100, percent));
  
  return (
    <Card className="p-6 space-y-4 bg-card dark:bg-gray-800 border-border dark:border-gray-700">
      <div className="space-y-2">
        {/* Header with percentage */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground dark:text-gray-100">
            Calculating Crafting Path...
          </h3>
          <span 
            className="text-2xl font-bold text-primary dark:text-blue-400"
            aria-live="polite"
            aria-atomic="true"
          >
            {clampedPercent.toFixed(1)}%
          </span>
        </div>
        
        {/* Progress bar */}
        <div 
          className="w-full bg-secondary dark:bg-gray-700 rounded-full h-4 overflow-hidden"
          role="progressbar"
          aria-valuenow={clampedPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Calculation progress"
        >
          <div
            className="h-full bg-primary dark:bg-blue-500 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${clampedPercent}%` }}
          />
        </div>
        
        {/* Time information */}
        <div className="flex items-center justify-between text-sm text-muted-foreground dark:text-gray-400">
          <span>
            Elapsed: <strong className="text-foreground dark:text-gray-200">{formatTime(elapsedMs)}</strong>
          </span>
          {estimatedRemainingMs > 0 && !cancelled && (
            <span>
              Remaining: <strong className="text-foreground dark:text-gray-200">{formatTime(estimatedRemainingMs)}</strong>
            </span>
          )}
        </div>
      </div>
      
      {/* Cancel button */}
      <Button
        variant="destructive"
        onClick={onCancel}
        disabled={cancelled}
        className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        aria-label="Cancel calculation"
      >
        {cancelled ? 'Cancelling...' : 'Cancel'}
      </Button>
      
      {cancelled && (
        <p className="text-sm text-muted-foreground dark:text-gray-400 text-center animate-pulse">
          Stopping calculation gracefully...
        </p>
      )}
    </Card>
  );
}
