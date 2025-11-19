"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Modifier } from "../types/api"

interface ModifierSelectorProps {
  availableModifiers: Modifier[];
  selectedModifiers: {
    prefixes: Array<{ modifier: Modifier; tier: number }>;
    suffixes: Array<{ modifier: Modifier; tier: number }>;
  };
  onAddModifier: (type: 'prefix' | 'suffix', modifier: Modifier, tier: number) => void;
  onRemoveModifier: (type: 'prefix' | 'suffix', modifierId: string) => void;
  onUpdateTier: (type: 'prefix' | 'suffix', modifierId: string, tier: number) => void;
  disabled?: boolean;
}

export function ModifierSelector({
  availableModifiers,
  selectedModifiers,
  onAddModifier,
  onRemoveModifier,
  onUpdateTier,
  disabled = false
}: ModifierSelectorProps) {
  const [selectedPrefixId, setSelectedPrefixId] = useState<string>("");
  const [selectedSuffixId, setSelectedSuffixId] = useState<string>("");
  const [prefixTier, setPrefixTier] = useState<number>(1);
  const [suffixTier, setSuffixTier] = useState<number>(1);

  // Separate available modifiers by type
  const prefixes = availableModifiers.filter(m => m.type === 'PREFIX');
  const suffixes = availableModifiers.filter(m => m.type === 'SUFFIX');

  const handleAddPrefix = () => {
    if (!selectedPrefixId) return;
    const modifier = prefixes.find(m => m.id === selectedPrefixId);
    if (modifier) {
      onAddModifier('prefix', modifier, prefixTier);
      setSelectedPrefixId("");
      setPrefixTier(1);
    }
  };

  const handleAddSuffix = () => {
    if (!selectedSuffixId) return;
    const modifier = suffixes.find(m => m.id === selectedSuffixId);
    if (modifier) {
      onAddModifier('suffix', modifier, suffixTier);
      setSelectedSuffixId("");
      setSuffixTier(1);
    }
  };

  if (availableModifiers.length === 0 && !disabled) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>Select an item first to view available modifiers</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Prefixes Section */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Prefixes</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Select value={selectedPrefixId} onValueChange={setSelectedPrefixId} disabled={disabled}>
                <SelectTrigger>
                  <SelectValue placeholder="Select prefix..." />
                </SelectTrigger>
                <SelectContent>
                  {prefixes.map((mod) => (
                    <SelectItem key={mod.id} value={mod.id}>
                      {mod.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <Select 
                value={prefixTier.toString()} 
                onValueChange={(v) => setPrefixTier(parseInt(v))}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tier) => (
                    <SelectItem key={tier} value={tier.toString()}>
                      T{tier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddPrefix} disabled={!selectedPrefixId || disabled}>
              Add
            </Button>
          </div>
          
          {/* Selected Prefixes */}
          <div className="space-y-2">
            {selectedModifiers.prefixes.map((item, index) => (
              <div key={`${item.modifier.id}-${index}`} className="flex items-center justify-between bg-muted p-2 rounded">
                <span className="text-sm">{item.modifier.name} (Tier {item.tier})</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onRemoveModifier('prefix', item.modifier.id)}
                  disabled={disabled}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Suffixes Section */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Suffixes</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Select value={selectedSuffixId} onValueChange={setSelectedSuffixId} disabled={disabled}>
                <SelectTrigger>
                  <SelectValue placeholder="Select suffix..." />
                </SelectTrigger>
                <SelectContent>
                  {suffixes.map((mod) => (
                    <SelectItem key={mod.id} value={mod.id}>
                      {mod.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <Select 
                value={suffixTier.toString()} 
                onValueChange={(v) => setSuffixTier(parseInt(v))}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tier) => (
                    <SelectItem key={tier} value={tier.toString()}>
                      T{tier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddSuffix} disabled={!selectedSuffixId || disabled}>
              Add
            </Button>
          </div>
          
          {/* Selected Suffixes */}
          <div className="space-y-2">
            {selectedModifiers.suffixes.map((item, index) => (
              <div key={`${item.modifier.id}-${index}`} className="flex items-center justify-between bg-muted p-2 rounded">
                <span className="text-sm">{item.modifier.name} (Tier {item.tier})</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onRemoveModifier('suffix', item.modifier.id)}
                  disabled={disabled}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
