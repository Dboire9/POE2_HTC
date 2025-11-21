import React from 'react';
import { Item } from '../../types';
import { Card } from '../../components/ui/card';
import { cn } from '../../lib/utils';

interface ItemCardProps {
  item: Item;
  selected: boolean;
  onClick: (itemId: string) => void;
}

// T013: Individual item display card
const ItemCard: React.FC<ItemCardProps> = ({ item, selected, onClick }) => {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:border-primary hover:shadow-md p-4',
        selected && 'border-primary ring-2 ring-primary'
      )}
      onClick={() => onClick(item.id)}
    >
      <div className="flex flex-col items-center gap-2">
        {item.iconPath && (
          <img
            src={item.iconPath}
            alt={item.name}
            className="h-16 w-16 object-contain"
          />
        )}
        <h3 className="text-sm font-medium text-center">{item.name}</h3>
        {item.type && (
          <span className="text-xs text-muted-foreground capitalize">
            {item.type.replace(/_/g, ' ')}
          </span>
        )}
      </div>
    </Card>
  );
};

// T016: Wrap with React.memo() for performance
export default React.memo(ItemCard);
