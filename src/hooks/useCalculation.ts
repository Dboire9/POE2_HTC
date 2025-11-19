/**
 * Custom hooks for crafting calculations
 */

import { useRef, useCallback } from 'react';
import { useCrafting } from '../contexts/CraftingContext';
import { api } from '../services/api';
import { CraftingError } from '../types/errors';
import type { CraftingRequest } from '../types/api';

/**
 * Hook for managing crafting calculations
 */
export function useCalculation() {
  const {
    selectedItem,
    selectedModifiers,
    setIsCalculating,
    setProgress,
    setResult,
    setError,
  } = useCrafting();

  const abortControllerRef = useRef<AbortController | null>(null);

  const calculate = useCallback(async () => {
    if (!selectedItem) {
      setError(
        new CraftingError(
          'VALIDATION_ERROR',
          'No item selected',
          ['Select an item type before calculating']
        )
      );
      return;
    }

    if (selectedModifiers.prefixes.length === 0 && selectedModifiers.suffixes.length === 0) {
      setError(
        new CraftingError(
          'VALIDATION_ERROR',
          'No modifiers selected',
          ['Select at least one modifier to craft']
        )
      );
      return;
    }

    try {
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();
      setIsCalculating(true);
      setProgress(0);
      setError(null);

      // Build request
      const request: CraftingRequest = {
        itemId: selectedItem.id,
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
        iterations: 100,
      };

      // Call API
      const result = await api.calculate(request, abortControllerRef.current.signal);
      setResult(result);
      setProgress(100);
    } catch (error) {
      if (error instanceof CraftingError) {
        setError(error);
      } else if (error instanceof Error && error.name === 'AbortError') {
        // Calculation was cancelled
        setError(
          new CraftingError('NETWORK_ERROR', 'Calculation cancelled by user', [
            'You can start a new calculation',
          ])
        );
      } else {
        setError(
          new CraftingError('UNKNOWN_ERROR', 'An unexpected error occurred', [
            'Please try again',
            'Check the console for details',
          ])
        );
      }
    } finally {
      setIsCalculating(false);
      abortControllerRef.current = null;
    }
  }, [selectedItem, selectedModifiers, setIsCalculating, setProgress, setResult, setError]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return { calculate, cancel };
}
