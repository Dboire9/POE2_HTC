"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { api } from "../services/api"
import type { Item } from "../types/api"

interface ItemSelectorProps {
  selectedItem: Item | null;
  onItemChange: (item: Item | null) => void;
  disabled?: boolean;
}

export function ItemSelector({ selectedItem, onItemChange, disabled }: ItemSelectorProps) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      const data = await api.getItems();
      setItems(data);
    } catch (error) {
      console.error("Failed to load items:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleItemChange = (itemId: string) => {
    const item = items.find(i => i.id === itemId) || null;
    onItemChange(item);
  }

  return (
    <div className="space-y-4">
      <Label>Select Item Base</Label>
      <Select 
        value={selectedItem?.id || ""}
        onValueChange={handleItemChange} 
        disabled={loading || disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={loading ? "Loading items..." : "Choose an item"} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
