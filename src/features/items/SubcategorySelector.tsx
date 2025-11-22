import React, { useState, useEffect } from 'react';
import { Item } from '../../types';
import { useItems } from '../../contexts/ItemsContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface SubcategorySelectorProps {
  category: Item;
  onSelect: (subcategory: string) => void;
  onBack: () => void;
}

const SubcategorySelector: React.FC<SubcategorySelectorProps> = ({ category, onSelect, onBack }) => {
  const { loadSubcategories } = useItems();
  const [subcategories, setSubcategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubcategories = async () => {
      setLoading(true);
      const subs = await loadSubcategories(category.id);
      setSubcategories(subs);
      setLoading(false);
    };
    
    fetchSubcategories();
  }, [category.id, loadSubcategories]);

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Loading subcategories...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <h3 className="text-lg font-semibold">Select {category.name} Type</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {subcategories.map((subcat) => (
          <Card
            key={subcat.id}
            className="cursor-pointer hover:border-primary hover:shadow-sm transition-all p-4"
            onClick={() => onSelect(subcat.id)}
          >
            <div className="text-center">
              <p className="font-medium">{subcat.name}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubcategorySelector;
