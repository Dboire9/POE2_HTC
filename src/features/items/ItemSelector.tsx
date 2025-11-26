import React, { useEffect, useState } from 'react';
import { useItems } from '../../contexts/ItemsContext';
import ItemList from './ItemList';
import SubcategorySelector from './SubcategorySelector';
import { Spinner } from '../../components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Item } from '../../types';

// T015: Main item selection component
const ItemSelector: React.FC = () => {
  const { items, selectedItem, loading, error, loadItems, selectItem } = useItems();
  const [showingSubcategories, setShowingSubcategories] = useState<Item | null>(null);

  // Load items on mount
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleItemSelect = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // If item has subcategories, show subcategory selector
    if (item.hasSubcategories) {
      setShowingSubcategories(item);
    } else {
      // No subcategories, select directly
      selectItem(itemId);
      // Scroll to modifier selector
      setTimeout(() => {
        const modifierSection = document.querySelector('[data-section="modifiers"]');
        modifierSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleSubcategorySelect = (subcategory: string) => {
    if (showingSubcategories) {
      selectItem(showingSubcategories.id, subcategory);
      setShowingSubcategories(null);
      // Scroll to modifier selector
      setTimeout(() => {
        const modifierSection = document.querySelector('[data-section="modifiers"]');
        modifierSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleBack = () => {
    setShowingSubcategories(null);
  };

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

  // Show subcategory selector if an item with subcategories was clicked
  if (showingSubcategories) {
    return (
      <SubcategorySelector
        category={showingSubcategories}
        onSelect={handleSubcategorySelect}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Select Item Type</h2>
        {selectedItem && (
          <span className="text-sm text-muted-foreground">
            Selected: {selectedItem.name}{selectedItem.subcategory ? ` (${selectedItem.subcategory})` : ''}
          </span>
        )}
      </div>
      <ItemList
        items={items}
        selectedItemId={selectedItem?.id || null}
        onSelectItem={handleItemSelect}
      />
    </div>
  );
};

export default ItemSelector;
