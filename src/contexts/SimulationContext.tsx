import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';
import { SimulationRequest, SimulationResult, SimulationState, SimulationActions } from '../types';
import { sortPathsByProbability } from '../lib/resultsSorting';
import { ErrorCode, getErrorMessage } from '../lib/errorMessages';

// Context type combining state and actions
type SimulationContextType = SimulationState & SimulationActions;

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

// T038: Provider component
export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // T039: AbortController for cancellation support
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // T040: Debounce timer reference
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // T041, T042: Start simulation with IPC call and sorting
  const startSimulation = useCallback(async (request: SimulationRequest) => {
    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // T040: Debounce with 500ms delay
    debounceTimerRef.current = setTimeout(async () => {
      // T039: Cancel previous simulation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);
      setProgress(0);

      try {
        if (!window.electronAPI) {
          throw new Error(ErrorCode.BACKEND_UNAVAILABLE);
        }

        // T041: Call backend via Electron IPC
        const response = await window.electronAPI.invoke('api:crafting', request);
        
        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        if (response.error) {
          throw new Error(response.error.code || ErrorCode.UNKNOWN);
        }

        // T042: Sort results by probability (highest first)
        const sortedResult: SimulationResult = {
          ...response,
          paths: sortPathsByProbability(response.paths || []),
        };

        setResult(sortedResult);
        setProgress(100);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Silently handle abort
          return;
        }
        const errorCode = err instanceof Error ? err.message : ErrorCode.UNKNOWN;
        setError(getErrorMessage(errorCode));
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce
  }, []);

  // T043: Cancel simulation
  const cancelSimulation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setLoading(false);
    setProgress(null);
  }, []);

  // T044: Clear results
  const clearResults = useCallback(() => {
    setResult(null);
    setError(null);
    setProgress(null);
  }, []);

  const value: SimulationContextType = {
    // State
    result,
    loading,
    progress,
    error,
    // Actions
    startSimulation,
    cancelSimulation,
    clearResults,
  };

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
};

// T045: Custom hook to use SimulationContext
export const useSimulation = (): SimulationContextType => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
