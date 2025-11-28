import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Coins, X } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface CurrencyExclusion {
  currency: string;
  tier?: string; // For Exalted/Regal: 'base', 'greater', 'perfect'
}

interface CurrencyExclusionPanelProps {
  excludedCurrencies: string[];
  onExcludedCurrenciesChange: (currencies: string[]) => void;
  minTier: number;
  onMinTierChange: (tier: number) => void;
}

const AVAILABLE_CURRENCIES = [
  { id: 'transmutation', name: 'Orb of Transmutation', hasTiers: true, tierType: 'orb' },
  { id: 'augmentation', name: 'Orb of Augmentation', hasTiers: true, tierType: 'orb' },
  { id: 'exalted', name: 'Exalted Orb', hasTiers: true, tierType: 'orb' },
  { id: 'annulment', name: 'Orb of Annulment', hasTiers: false },
];

const ORB_TIER_OPTIONS = [
  { value: 'base', label: 'Base' },
  { value: 'greater', label: 'Greater' },
  { value: 'perfect', label: 'Perfect' },
];

const CurrencyExclusionPanel: React.FC<CurrencyExclusionPanelProps> = ({
  excludedCurrencies,
  onExcludedCurrenciesChange,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<string>('base');

  // Reset tier to base when currency changes
  useEffect(() => {
    if (selectedCurrency) {
      setSelectedTier('base');
    }
  }, [selectedCurrency]);

  const handleAddExclusion = () => {
    if (!selectedCurrency) return;
    
    const currency = AVAILABLE_CURRENCIES.find(c => c.id === selectedCurrency);
    if (!currency) return;

    // For currencies with tiers, include tier in the ID
    const exclusionId = currency.hasTiers 
      ? `${selectedCurrency}:${selectedTier}`
      : selectedCurrency;

    if (!excludedCurrencies.includes(exclusionId)) {
      onExcludedCurrenciesChange([...excludedCurrencies, exclusionId]);
    }

    // Reset selection
    setSelectedCurrency('');
    setSelectedTier('base');
  };

  const handleRemoveExclusion = (exclusionId: string) => {
    onExcludedCurrenciesChange(excludedCurrencies.filter(id => id !== exclusionId));
  };

  const getExclusionDisplay = (exclusionId: string) => {
    const [currencyId, tier] = exclusionId.split(':');
    const currency = AVAILABLE_CURRENCIES.find(c => c.id === currencyId);
    if (!currency) return exclusionId;

    if (tier) {
      const tierLabel = ORB_TIER_OPTIONS.find(t => t.value === tier)?.label || tier;
      return `${currency.name} (${tierLabel})`;
    }
    return currency.name;
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Coins className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-base font-bold">Currency Exclusions</h2>
            <p className="text-sm text-muted-foreground">
              Exclude specific currencies from the crafting simulation
            </p>
          </div>
        </div>
      </div>

      {/* Add Currency Exclusion - Always shown */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Exclude Currency</Label>
        <p className="text-xs text-muted-foreground">
          Select a currency and tier (if applicable) to exclude from simulation
        </p>

        <div className="flex gap-2">
          {/* Currency Selection */}
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select currency..." />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_CURRENCIES.map((currency) => (
                <SelectItem key={currency.id} value={currency.id}>
                  {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Tier Selection (only for currencies with tiers) */}
          {selectedCurrency && AVAILABLE_CURRENCIES.find(c => c.id === selectedCurrency)?.hasTiers && (
            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORB_TIER_OPTIONS.map((tier) => (
                  <SelectItem key={tier.value} value={tier.value}>
                    {tier.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Add Button */}
          <Button
            onClick={handleAddExclusion}
            disabled={!selectedCurrency}
            size="default"
            className="whitespace-nowrap"
          >
            Add
          </Button>
        </div>
      </div>

      {/* Excluded Currencies List */}
      {excludedCurrencies.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-muted-foreground">
            Excluded ({excludedCurrencies.length})
          </Label>
          <div className="flex flex-wrap gap-2">
            {excludedCurrencies.map((exclusionId) => (
              <div
                key={exclusionId}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-destructive/10 border border-destructive/30 text-sm"
              >
                <span className="font-medium">{getExclusionDisplay(exclusionId)}</span>
                <button
                  onClick={() => handleRemoveExclusion(exclusionId)}
                  className="hover:bg-destructive/20 rounded p-0.5 transition-colors"
                  aria-label="Remove exclusion"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default CurrencyExclusionPanel;
