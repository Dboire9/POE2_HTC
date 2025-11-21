import React, { createContext, useContext, useState, useCallback } from 'react';
import { Item, ItemsState, ItemsActions } from '../types';
import { ErrorCode, getErrorMessage } from '../lib/errorMessages';

// Context type combining state and actions
type ItemsContextType = ItemsState & ItemsActions;

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

// Provider component (T009)
export const ItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // T010: Load items from backend via Electron IPC
  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!window.electronAPI) {
        throw new Error(ErrorCode.BACKEND_UNAVAILABLE);
      }

      const response = await window.electronAPI.invoke('api:items', {});
      
      if (response.error) {
        throw new Error(response.error.code || ErrorCode.UNKNOWN);
      }

      setItems(response.items || []);
    } catch (err) {
      const errorCode = err instanceof Error ? err.message : ErrorCode.UNKNOWN;
      setError(getErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  }, []);

  // T011: Select item by ID
  const selectItem = useCallback((itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      setSelectedItem(item);
    }
  }, [items]);

  // T011: Clear selection
  const clearSelection = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const value: ItemsContextType = {
    // State
    items,
    selectedItem,
    loading,
    error,
    // Actions
    loadItems,
    selectItem,
    clearSelection,
  };

  return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>;
};

// T012: Custom hook to use ItemsContext
export const useItems = (): ItemsContextType => {
  const context = useContext(ItemsContext);
  if (context === undefined) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
};
