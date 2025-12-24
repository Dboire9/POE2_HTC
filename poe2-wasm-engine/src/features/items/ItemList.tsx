import React from 'react';
import { Item } from '../../types';
import ItemCard from './ItemCard';

interface ItemListProps {
  items: Item[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
}

// T014: Grid/list of items
const ItemList: React.FC<ItemListProps> = ({ items, selectedItemId, onSelectItem }) => {
  if (items.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No items available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          selected={item.id === selectedItemId}
          onClick={onSelectItem}
        />
      ))}
    </div>
  );
};

// T017: Wrap with React.memo() for performance
export default React.memo(ItemList);
