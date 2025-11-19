/**
 * Centralized state management hook for crafting simulator
 * Consolidates calculation logic, error handling, and state management
 */

import { useRef, useCallback } from 'react';
import { useCrafting } from '../contexts/CraftingContext';
import { api } from '../services/api';
import { CraftingError } from '../types/errors';
import type { CraftingRequest, CraftingResult } from '../types/api';

/**
 * Hook for managing crafting simulator state and operations
 * 
 * Provides centralized state management with:
 * - Calculation execution with progress tracking
 * - Error handling with user-friendly messages
 * - Session management with cancellation support
 * - TypeScript strict mode (no 'any' types)
 * 
 * @returns Object containing state and action methods
 * 
 * @example
 * ```tsx
 * const { state, calculate, cancel } = useCraftingSimulator();
 * 
 * // Check if calculation can proceed
 * if (state.canCalculate) {
 *   await calculate();
 * }
 * 
 * // Cancel ongoing calculation
 * cancel();
 * ```
 */
export function useCraftingSimulator() {
  const context = useCrafting();
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    selectedItem,
    selectedModifiers,
    sessionId,
    isCalculating,
    progress,
    result,
    error,
    setIsCalculating,
    setSessionId,
    setProgress,
    setResult,
    setError,
  } = context;

  /**
   * Validates input before calculation
   * @returns CraftingError if validation fails, null otherwise
   */
  const validateInput = useCallback((): CraftingError | null => {
    if (!selectedItem) {
      return new CraftingError(
        'VALIDATION_ERROR',
        'No item selected',
        ['Select an item type before calculating'],
        true
      );
    }

    const totalModifiers = selectedModifiers.prefixes.length + selectedModifiers.suffixes.length;
    
    if (totalModifiers === 0) {
      return new CraftingError(
        'VALIDATION_ERROR',
        'No modifiers selected',
        ['Select at least one modifier to craft'],
        true
      );
    }

    if (totalModifiers > 6) {
      return new CraftingError(
        'VALIDATION_ERROR',
        'Too many modifiers selected',
        ['Items can have at most 6 modifiers total', 'Remove some modifiers and try again'],
        true
      );
    }

    return null;
  }, [selectedItem, selectedModifiers]);

  /**
   * Maps backend errors to user-friendly CraftingError instances
   * @param error - Error from backend or network
   * @returns Mapped CraftingError
   */
  const mapError = useCallback((error: unknown): CraftingError => {
    // Already a CraftingError
    if (error instanceof CraftingError) {
      return error;
    }

    // AbortError from cancelled request
    if (error instanceof Error && error.name === 'AbortError') {
      return new CraftingError(
        'NETWORK_ERROR',
        'Calculation cancelled by user',
        ['You can start a new calculation'],
        true
      );
    }

    // Network/fetch errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new CraftingError(
        'NETWORK_ERROR',
        'Failed to communicate with backend server',
        [
          'Ensure the backend server is running on port 8080',
          'Check your network connection',
          'Restart the application if the issue persists',
        ],
        true
      );
    }

    // Generic Error instances
    if (error instanceof Error) {
      return CraftingError.fromUnknown(error);
    }

    // Unknown error type
    return new CraftingError(
      'UNKNOWN_ERROR',
      'An unexpected error occurred',
      ['Check the console for details', 'Try restarting the application'],
      true
    );
  }, []);

  /**
   * Executes crafting calculation with progress tracking
   * Handles validation, session management, and error handling
   */
  const calculate = useCallback(async (): Promise<void> => {
    // Validation
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      return;
    }

    let progressInterval: ReturnType<typeof setInterval> | null = null;
    const startTime = Date.now();
    
    try {
      // Generate unique session ID for progress tracking
      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();
      console.log('[useCraftingSimulator] Setting isCalculating to true');
      setIsCalculating(true);
      
      // Simulate progress since backend doesn't report it yet
      let simulatedProgress = 0;
      progressInterval = setInterval(() => {
        simulatedProgress += 1; // Slower increment for smoother animation
        if (simulatedProgress <= 95) { // Go up to 95% to leave room for completion
          setProgress({
            percent: simulatedProgress,
            elapsedMs: Date.now() - startTime,
            estimatedRemainingMs: Math.max(0, ((100 - simulatedProgress) / simulatedProgress) * (Date.now() - startTime)),
            cancelled: false,
          });
        }
      }, 300); // Update every 300ms for smoother animation
      
      setProgress({
        percent: 0,
        elapsedMs: 0,
        estimatedRemainingMs: 20000, // Estimate 20 seconds
        cancelled: false,
      });
      setError(null);

      // Build request with sessionId
      const request: CraftingRequest = {
        sessionId: newSessionId,
        itemId: selectedItem!.id, // Safe: validated above
        modifiers: {
          prefixes: selectedModifiers.prefixes.map((m) => ({
            id: m.modifier.id,
            tier: m.tier,
          })),
          suffixes: selectedModifiers.suffixes.map((m) => ({
            id: m.modifier.id,
            tier: m.tier,
          })),
        },
        strategy: 'balanced',
        iterations: 100,
      };

      // Call API with abort signal
      const calculationResult: CraftingResult = await api.calculate(
        request,
        abortControllerRef.current.signal
      );

      if (progressInterval) clearInterval(progressInterval);
      setProgress({
        percent: 100,
        elapsedMs: Date.now() - startTime,
        estimatedRemainingMs: 0,
        cancelled: false,
      });
      
      setResult(calculationResult);
    } catch (error) {
      if (progressInterval) clearInterval(progressInterval);
      const craftingError = mapError(error);
      setError(craftingError);
      console.error('Calculation error:', error);
    } finally {
      setIsCalculating(false);
      setSessionId(null);
      abortControllerRef.current = null;
    }
  }, [
    validateInput,
    selectedItem,
    selectedModifiers,
    setIsCalculating,
    setSessionId,
    setProgress,
    setResult,
    setError,
    mapError,
  ]);

  /**
   * Cancels ongoing calculation
   * Calls backend cancel endpoint and aborts HTTP request
   */
  const cancel = useCallback(async (): Promise<void> => {
    // Call backend cancel endpoint if we have a sessionId
    if (sessionId) {
      try {
        await api.cancel(sessionId);
      } catch (error) {
        console.error('Failed to cancel calculation on backend:', error);
        // Continue with abort even if backend cancel fails
      }
    }

    // Abort the HTTP request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [sessionId]);

  /**
   * Computed state properties
   */
  const canCalculate =
    selectedItem !== null &&
    (selectedModifiers.prefixes.length > 0 || selectedModifiers.suffixes.length > 0) &&
    !isCalculating;

  const hasModifiers =
    selectedModifiers.prefixes.length > 0 || selectedModifiers.suffixes.length > 0;

  return {
    // State
    state: {
      ...context,
      canCalculate,
      hasModifiers,
    },
    
    // Actions
    calculate,
    cancel,
  };
}
