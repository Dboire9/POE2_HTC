import React, { useEffect } from 'react';
import { useItems } from '../../contexts/ItemsContext';
import ItemList from './ItemList';
import { Spinner } from '../../components/ui/spinner';

// T015: Main item selection component
const ItemSelector: React.FC = () => {
  const { items, selectedItem, loading, error, loadItems, selectItem } = useItems();

  // Load items on mount
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Spinner size="lg" />
        <p className="text-muted-foreground mt-4">Loading items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={loadItems}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Select Item Type</h2>
        {selectedItem && (
          <span className="text-sm text-muted-foreground">
            Selected: {selectedItem.name}
          </span>
        )}
      </div>
      <ItemList
        items={items}
        selectedItemId={selectedItem?.id || null}
        onSelectItem={selectItem}
      />
    </div>
  );
};

export default ItemSelector;
