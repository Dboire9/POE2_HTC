"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Modifier } from "../types/api"
import { api } from "../services/api"

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
  selectedItem: any; // Item object with id property
}

export function ModifierSelector({
  availableModifiers,
  selectedModifiers,
  onAddModifier,
  onRemoveModifier,
  onUpdateTier,
  disabled = false,
  selectedItem
}: ModifierSelectorProps) {
  const [selectedPrefixId, setSelectedPrefixId] = useState<string>("");
  const [selectedSuffixId, setSelectedSuffixId] = useState<string>("");
  const [prefixTier, setPrefixTier] = useState<number>(1);
  const [suffixTier, setSuffixTier] = useState<number>(1);
  const [displayModifiers, setDisplayModifiers] = useState<Modifier[]>([]);
  const [currentCurrencyType, setCurrentCurrencyType] = useState<string>('normal');
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

  // Determine currency type based on selected tiers
  const getCurrencyType = (prefTier: number, sufTier: number): string => {
    // Priority: if EITHER tier is special, use that currency type
    if (prefTier === 101 || sufTier === 101) return 'desecrated';
    if (prefTier === 100 || sufTier === 100) return 'essence';
    return 'normal';
  };

  // Update displayed modifiers when tier changes to special currency types OR on initial item selection
  useEffect(() => {
    if (!selectedItem) {
      setDisplayModifiers([]);
      return;
    }
    
    const newCurrencyType = getCurrencyType(prefixTier, suffixTier);
    
    // Load modifiers if: initial load OR currency type changed
    if (!isInitialLoad && newCurrencyType === currentCurrencyType) return;
    
    setCurrentCurrencyType(newCurrencyType);
    if (isInitialLoad) setIsInitialLoad(false);
    
    // Reload modifiers for new currency type
    const loadModifiers = async () => {
      try {
        const mods = await api.getModifiers(selectedItem.id, newCurrencyType);
        setDisplayModifiers(mods);
        // Reset selections when currency type changes
        setSelectedPrefixId("");
        setSelectedSuffixId("");
      } catch (error) {
        console.error('Failed to load modifiers for currency type:', error);
      }
    };
    
    loadModifiers();
  }, [prefixTier, suffixTier, selectedItem, currentCurrencyType, isInitialLoad]);

  // Separate available modifiers by type
  const prefixes = displayModifiers.filter(m => m.type === 'PREFIX');
  const suffixes = displayModifiers.filter(m => m.type === 'SUFFIX');

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
            <div className="w-32">
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
                  <SelectItem value="100">💎 Perfect Essence</SelectItem>
                  <SelectItem value="101">☠️ Desecrated Currency</SelectItem>
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
                <span className="text-sm">
                  {item.modifier.name} 
                  {item.tier === 100 && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">💎 Perfect Essence</span>}
                  {item.tier === 101 && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">☠️ Desecrated</span>}
                  {item.tier < 100 && ` (Tier ${item.tier})`}
                </span>
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
            <div className="w-32">
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
                  <SelectItem value="100">💎 Perfect Essence</SelectItem>
                  <SelectItem value="101">☠️ Desecrated Currency</SelectItem>
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
                <span className="text-sm">
                  {item.modifier.name} 
                  {item.tier === 100 && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">💎 Perfect Essence</span>}
                  {item.tier === 101 && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">☠️ Desecrated</span>}
                  {item.tier < 100 && ` (Tier ${item.tier})`}
                </span>
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
