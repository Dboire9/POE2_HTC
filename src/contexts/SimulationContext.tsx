import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';
import { SimulationRequest, SimulationResult, SimulationState, SimulationActions } from '../types';
import { sortPathsByProbability } from '../lib/resultsSorting';
import { ErrorCode, getErrorMessage } from '../lib/errorMessages';
import { toast } from 'sonner';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8080/api'
  : 'https://api.poe2htc.com';

// Context type combining state and actions
type SimulationContextType = SimulationState & SimulationActions;

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

// T038: Provider component
export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [excludedCurrencies, setExcludedCurrencies] = useState<string[]>([]);
  const [minTier, setMinTier] = useState<number>(10); // Default: allow all tiers

  // T039: AbortController for cancellation support
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // T040: Debounce timer reference
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // T062: Timeout warning timer reference (30 seconds)
  const timeoutWarningRef = useRef<NodeJS.Timeout | null>(null);

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

      // T062: Start timeout warning timer (30 seconds)
      timeoutWarningRef.current = setTimeout(() => {
        if (loading) {
          toast.warning('Simulation taking longer than expected', {
            description: 'This may indicate a complex crafting path. Please wait...',
            duration: 5000,
          });
        }
      }, 30000);

      try {
        let response;
        
        // Parse excluded currencies to separate currency, tier, and omen
        const parsedExclusions = excludedCurrencies.map(exclusion => {
          const parts = exclusion.split(':');
          if (parts.length === 3 && parts[1] === 'omen') {
            // Format: currency:omen:OmenName
            return { currency: parts[0], omen: parts[2] };
          } else if (parts.length === 2) {
            // Format: currency:tier
            return { currency: parts[0], tier: parts[1] };
          } else {
            // Format: currency only
            return { currency: parts[0] };
          }
        });
        
        // Add global_threshold and excluded currencies to request
        const requestWithThreshold = {
          ...request,
          global_threshold: 0.33, // 33% threshold
          excludedCurrencies: parsedExclusions,
          _timestamp: Date.now(), // Cache buster
        };
        
        // Direct HTTP API call
        const httpResponse = await fetch(`${API_BASE_URL}/crafting?_=${Date.now()}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          cache: 'no-store',
          body: JSON.stringify(requestWithThreshold),
        });
        if (!httpResponse.ok) {
          // Check if it's a family conflict error (400 status)
          if (httpResponse.status === 400) {
            const errorData = await httpResponse.json();
            if (errorData.error === 'family_conflict') {
              // Show detailed toast notification for family conflicts
              const cleanMessage = errorData.message.replace(/\\n/g, '\n');
              toast.error('Modifier Family Conflict', {
                description: cleanMessage,
                duration: 10000, // 10 seconds to read the details
              });
              throw new Error('family_conflict');
            }
          }
          throw new Error(ErrorCode.BACKEND_UNAVAILABLE);
        }
        response = await httpResponse.json();
        
        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        if (response.error) {
          // Check for family conflict error
          if (response.error === 'family_conflict') {
            const cleanMessage = response.message.replace(/\\n/g, '\n');
            toast.error('Modifier Family Conflict', {
              description: cleanMessage,
              duration: 10000, // 10 seconds to read the details
            });
            throw new Error('family_conflict');
          }
          throw new Error(response.error.code || ErrorCode.UNKNOWN);
        }

        // Transform backend response to match frontend types
        const transformedPaths = (response.paths || []).map((path: any, index: number) => {
          const steps = (path.bestPath?.actions || []).map((action: any, stepIdx: number) => ({
            order: stepIdx + 1,
            action: action.action || 'Unknown',
            currencyUsed: action.action || 'Unknown',
            targetModifier: action.modifier,
            probability: action.probability || 0,
            tier: action.tier,
            omen: action.omen,
            omens: action.omens,
            modifierType: action.modifierType,
            eventType: action.eventType,
            replacedModifier: action.replacedModifier,
            replacedModifierType: action.replacedModifierType,
            isPerfectEssenceReplacement: action.isPerfectEssenceReplacement
          }));

          // Calculate total cost from steps
          const totalCost = steps.reduce((acc: Record<string, number>, step: { currencyUsed?: string }) => {
            if (step.currencyUsed) {
              acc[step.currencyUsed] = (acc[step.currencyUsed] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>);

          return {
            id: `path-${index}`,
            probability: path.probability || 0,
            steps: steps,
            totalCost
          };
        });

        // T042: Sort results by probability (highest first)
        const sortedResult: SimulationResult = {
          itemId: response.itemId || '',
          requestedModifiers: [],
          paths: sortPathsByProbability(transformedPaths),
          computationTime: response.computationTime || 0,
          warnings: []
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
        // T062: Clear timeout warning timer
        if (timeoutWarningRef.current) {
          clearTimeout(timeoutWarningRef.current);
        }
        setLoading(false);
      }
    }, 500); // 500ms debounce
  }, [excludedCurrencies]);

  // T043: Cancel simulation
  const cancelSimulation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (timeoutWarningRef.current) {
      clearTimeout(timeoutWarningRef.current);
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
    excludedCurrencies,
    minTier,
    // Actions
    startSimulation,
    cancelSimulation,
    clearResults,
    setExcludedCurrencies,
    setMinTier,
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
