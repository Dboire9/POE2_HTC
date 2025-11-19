import { useEffect } from 'react';
import { useCrafting } from '../contexts/CraftingContext';
import { useCalculationProgress } from './useCalculationProgress';

/**
 * Higher-level hook that integrates progress tracking with CraftingContext
 * 
 * Automatically polls progress while calculation is running and updates context state.
 * Handles cleanup and error management.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const crafting = useCrafting();
 *   useCraftingProgress();
 *   
 *   // crafting.progress will be automatically updated
 *   return (
 *     <div>
 *       {crafting.isCalculating && crafting.progress && (
 *         <ProgressBar progress={crafting.progress} />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCraftingProgress() {
  const { sessionId, isCalculating, setProgress } = useCrafting();
  
  // Poll progress from backend
  const { progress, error } = useCalculationProgress(sessionId, isCalculating);
  
  // Update context when progress changes
  useEffect(() => {
    if (progress) {
      setProgress(progress);
    }
  }, [progress, setProgress]);
  
  // Log errors (could be enhanced to update error state)
  useEffect(() => {
    if (error) {
      console.error('Progress polling error:', error);
    }
  }, [error]);
}
