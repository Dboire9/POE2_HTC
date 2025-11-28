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
  const [itemLevel, setItemLevel] = useState<number>(86); // Default ilvl 86
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // T010: Load items from backend via Electron IPC
  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Direct HTTP API call
      const httpResponse = await fetch('http://localhost:8080/api/items');
      if (!httpResponse.ok) {
        throw new Error(ErrorCode.BACKEND_UNAVAILABLE);
      }
      const items = await httpResponse.json();
      
      setItems(items || []);
    } catch (err) {
      const errorCode = err instanceof Error ? err.message : ErrorCode.UNKNOWN;
      setError(getErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  }, []);

  // T010b: Load subcategories for an item category
  const loadSubcategories = useCallback(async (categoryId: string): Promise<{ id: string; name: string }[]> => {
    try {
      const httpResponse = await fetch(`http://localhost:8080/api/subcategories?category=${categoryId}`);
      if (!httpResponse.ok) {
        throw new Error(ErrorCode.BACKEND_UNAVAILABLE);
      }
      const subcategories = await httpResponse.json();
      return subcategories || [];
    } catch (err) {
      console.error('Failed to load subcategories:', err);
      return [];
    }
  }, []);

  // T011: Select item by ID with optional subcategory
  const selectItem = useCallback((itemId: string, subcategory?: string, newItemLevel?: number) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      setSelectedItem({ ...item, subcategory, itemLevel: newItemLevel ?? itemLevel });
    }
  }, [items, itemLevel]);

  // Only update itemLevel globally, do not update selectedItem (prevents workflow reset)
  const updateItemLevel = useCallback((level: number) => {
    setItemLevel(level);
    // Do NOT update selectedItem here, to avoid workflow reset
  }, []);

  // T011: Clear selection
  const clearSelection = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const value: ItemsContextType = {
    // State
    items,
    selectedItem,
    itemLevel,
    loading,
    error,
    // Actions
    loadItems,
    loadSubcategories,
    selectItem,
    updateItemLevel,
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
