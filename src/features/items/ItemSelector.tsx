import React, { useEffect } from 'react';
import { useItems } from '../../contexts/ItemsContext';
import ItemList from './ItemList';
import { Spinner } from '../../components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';

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

  // T061: Enhanced error display with recovery actions
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to Load Items</AlertTitle>
        <AlertDescription>
          <p className="mb-3">{error}</p>
          <Button size="sm" variant="outline" onClick={loadItems}>
            Retry Loading
          </Button>
        </AlertDescription>
      </Alert>
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
