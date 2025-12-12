import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Coins, X } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface CurrencyExclusion {
  currency: string;
  tier?: string; // For Exalted/Regal: 'base', 'greater', 'perfect'
  omen?: string; // For currencies with omens
}

interface OmenOption {
  value: string;
  label: string;
}

interface CurrencyConfig {
  id: string;
  name: string;
  hasTiers: boolean;
  hasOmens: boolean;
  tierType?: string;
  omens?: OmenOption[];
}

interface CurrencyExclusionPanelProps {
  excludedCurrencies: string[];
  onExcludedCurrenciesChange: (currencies: string[]) => void;
  minTier: number;
  onMinTierChange: (tier: number) => void;
}

const AVAILABLE_CURRENCIES: CurrencyConfig[] = [
  { 
    id: 'transmutation', 
    name: 'Orb of Transmutation', 
    hasTiers: true, 
    hasOmens: false,
    tierType: 'orb' 
  },
  { 
    id: 'augmentation', 
    name: 'Orb of Augmentation', 
    hasTiers: true, 
    hasOmens: false,
    tierType: 'orb' 
  },
  { 
    id: 'regal', 
    name: 'Regal Orb', 
    hasTiers: true, 
    hasOmens: true,
    tierType: 'orb',
    omens: [
      { value: 'None', label: 'None' },
    //   { value: 'OmenofHomogenisingCoronation', label: 'Omen of Homogenising Coronation' },
    ]
  },
  { 
    id: 'exalted', 
    name: 'Exalted Orb', 
    hasTiers: true, 
    hasOmens: true,
    tierType: 'orb',
    omens: [
      { value: 'None', label: 'None' },
    //   { value: 'OmenofHomogenisingExaltation', label: 'Omen of Homogenising Exaltation' },
      { value: 'OmenofSinistralExaltation', label: 'Omen of Sinistral Exaltation' },
      { value: 'OmenofDextralExaltation', label: 'Omen of Dextral Exaltation' },
      { value: 'OmenofGreaterExaltation', label: 'Omen of Greater Exaltation' },
    ]
  },
  { 
    id: 'annulment', 
    name: 'Orb of Annulment', 
    hasTiers: false,
    hasOmens: true,
    omens: [
      { value: 'None', label: 'None' },
      { value: 'OmenofSinistralAnnulment', label: 'Omen of Sinistral Annulment' },
      { value: 'OmenofDextralAnnulment', label: 'Omen of Dextral Annulment' },
      { value: 'OmenofLight', label: 'Omen of Light' },
    ]
  },
];

const ORB_TIER_OPTIONS = [
  { value: 'all', label: 'All Tiers' },
  { value: 'base', label: 'Base' },
  { value: 'greater', label: 'Greater' },
  { value: 'perfect', label: 'Perfect' },
];

const CurrencyExclusionPanel: React.FC<CurrencyExclusionPanelProps> = ({
  excludedCurrencies,
  onExcludedCurrenciesChange,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  
  // Separate state for omen exclusions
  const [selectedOmenCurrency, setSelectedOmenCurrency] = useState<string>('');
  const [selectedOmen, setSelectedOmen] = useState<string>('None');

  // Reset tier when currency changes
  useEffect(() => {
    if (selectedCurrency) {
      setSelectedTier('all');
    }
  }, [selectedCurrency]);

  // Reset omen when omen currency changes
  useEffect(() => {
    if (selectedOmenCurrency) {
      setSelectedOmen('None');
    }
  }, [selectedOmenCurrency]);

  const handleAddCurrencyExclusion = () => {
    if (!selectedCurrency) return;
    
    const currency = AVAILABLE_CURRENCIES.find(c => c.id === selectedCurrency);
    if (!currency) return;

    let exclusionId: string;
    
    if (currency.hasTiers) {
      exclusionId = `${selectedCurrency}:${selectedTier}`;
    } else {
      exclusionId = selectedCurrency;
    }

    if (!excludedCurrencies.includes(exclusionId)) {
      onExcludedCurrenciesChange([...excludedCurrencies, exclusionId]);
    }

    // Reset selection
    setSelectedCurrency('');
    setSelectedTier('all');
  };

  const handleAddOmenExclusion = () => {
    if (!selectedOmenCurrency || selectedOmen === 'None') return;
    
    const currency = AVAILABLE_CURRENCIES.find(c => c.id === selectedOmenCurrency);
    if (!currency || !currency.hasOmens) return;

    const exclusionId = `${selectedOmenCurrency}:omen:${selectedOmen}`;

    if (!excludedCurrencies.includes(exclusionId)) {
      onExcludedCurrenciesChange([...excludedCurrencies, exclusionId]);
    }

    // Reset selection
    setSelectedOmenCurrency('');
    setSelectedOmen('None');
  };

  const handleRemoveExclusion = (exclusionId: string) => {
    onExcludedCurrenciesChange(excludedCurrencies.filter(id => id !== exclusionId));
  };

  const getExclusionDisplay = (exclusionId: string) => {
    const parts = exclusionId.split(':');
    const currencyId = parts[0];
    const currency = AVAILABLE_CURRENCIES.find(c => c.id === currencyId);
    if (!currency) return exclusionId;

    let display = currency.name;

    // Check if this is an omen-only exclusion
    if (parts[1] === 'omen' && parts[2]) {
      const omenValue = parts[2];
      const omenLabel = currency.omens?.find(o => o.value === omenValue)?.label || omenValue;
      display += ` - ${omenLabel}`;
    }
    // Otherwise it's a tier-based exclusion
    else if (parts[1] && parts[1] !== 'all') {
      const tierLabel = ORB_TIER_OPTIONS.find(t => t.value === parts[1])?.label || parts[1];
      display += ` (${tierLabel})`;
    }

    return display;
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

      {/* Add Currency Exclusion */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Exclude Currency by Tier</Label>
        <p className="text-xs text-muted-foreground">
          Exclude specific currency tiers from the simulation
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
              <SelectTrigger className="w-[120px]">
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
            onClick={handleAddCurrencyExclusion}
            disabled={!selectedCurrency}
            size="default"
            className="whitespace-nowrap"
          >
            Add
          </Button>
        </div>
      </div>

      {/* Add Omen Exclusion */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Exclude Omen</Label>
        <p className="text-xs text-muted-foreground">
          Exclude specific omens without excluding the currency itself
        </p>

        <div className="flex gap-2">
          {/* Currency Selection for Omens */}
          <Select value={selectedOmenCurrency} onValueChange={setSelectedOmenCurrency}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select omen..." />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_CURRENCIES.filter(c => c.hasOmens).map((currency) => (
                <SelectItem key={currency.id} value={currency.id}>
                  {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Omen Selection */}
          {selectedOmenCurrency && (
            <Select value={selectedOmen} onValueChange={setSelectedOmen}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select omen..." />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_CURRENCIES.find(c => c.id === selectedOmenCurrency)?.omens
                  ?.filter(o => o.value !== 'None')
                  .map((omen) => (
                    <SelectItem key={omen.value} value={omen.value}>
                      {omen.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}

          {/* Add Button */}
          <Button
            onClick={handleAddOmenExclusion}
            disabled={!selectedOmenCurrency || selectedOmen === 'None'}
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
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-destructive/10 border border-destructive/30 text-sm max-w-full"
              >
                <span className="font-medium break-words">{getExclusionDisplay(exclusionId)}</span>
                <button
                  onClick={() => handleRemoveExclusion(exclusionId)}
                  className="hover:bg-destructive/20 rounded p-0.5 transition-colors flex-shrink-0"
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
