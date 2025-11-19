/**
 * Currency Selection & Strategy Panel Component
 * Allows users to select crafting currencies and optimization strategy
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Button } from './ui/button';
import type { Currency } from '../types/api';

interface CurrencyStrategyPanelProps {
  currencies: Currency[];
  selectedCurrencies: string[];
  onCurrenciesChange: (currencies: string[]) => void;
  strategy: 'fastest' | 'cheapest' | 'balanced';
  onStrategyChange: (strategy: 'fastest' | 'cheapest' | 'balanced') => void;
  disabled?: boolean;
}

export function CurrencyStrategyPanel({
  currencies,
  selectedCurrencies,
  onCurrenciesChange,
  strategy,
  onStrategyChange,
  disabled = false,
}: CurrencyStrategyPanelProps) {
  // Group currencies by category
  const currenciesByCategory = currencies.reduce((acc, currency) => {
    if (!acc[currency.category]) {
      acc[currency.category] = [];
    }
    acc[currency.category].push(currency);
    return acc;
  }, {} as Record<string, Currency[]>);

  const handleCurrencyToggle = (currencyId: string) => {
    if (selectedCurrencies.includes(currencyId)) {
      onCurrenciesChange(selectedCurrencies.filter(id => id !== currencyId));
    } else {
      onCurrenciesChange([...selectedCurrencies, currencyId]);
    }
  };

  const handleSelectAll = () => {
    onCurrenciesChange(currencies.map(c => c.id));
  };

  const handleSelectEssentials = () => {
    // Essential currencies: transmutation, augmentation, regal, exalted
    const essentials = ['transmutation', 'augmentation', 'regal', 'exalted', 'alchemy'];
    onCurrenciesChange(currencies.filter(c => essentials.includes(c.id)).map(c => c.id));
  };

  const handleSelectNone = () => {
    onCurrenciesChange([]);
  };

  // Load from localStorage on mount
  useEffect(() => {
    const savedCurrencies = localStorage.getItem('selectedCurrencies');
    const savedStrategy = localStorage.getItem('craftingStrategy');
    
    if (savedCurrencies) {
      try {
        const parsed = JSON.parse(savedCurrencies);
        if (Array.isArray(parsed)) {
          onCurrenciesChange(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved currencies:', e);
      }
    }
    
    if (savedStrategy && ['fastest', 'cheapest', 'balanced'].includes(savedStrategy)) {
      onStrategyChange(savedStrategy as 'fastest' | 'cheapest' | 'balanced');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('selectedCurrencies', JSON.stringify(selectedCurrencies));
  }, [selectedCurrencies]);

  useEffect(() => {
    localStorage.setItem('craftingStrategy', strategy);
  }, [strategy]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Crafting Strategy</CardTitle>
        <CardDescription>
          Choose optimization goal and allowed currencies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Strategy Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Optimization Goal</Label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="strategy"
                value="fastest"
                checked={strategy === 'fastest'}
                onChange={() => onStrategyChange('fastest')}
                disabled={disabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">
                <span className="font-medium">Fastest</span>
                <span className="text-muted-foreground"> - Minimize crafting steps</span>
              </span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="strategy"
                value="cheapest"
                checked={strategy === 'cheapest'}
                onChange={() => onStrategyChange('cheapest')}
                disabled={disabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">
                <span className="font-medium">Cheapest</span>
                <span className="text-muted-foreground"> - Minimize currency cost</span>
              </span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="strategy"
                value="balanced"
                checked={strategy === 'balanced'}
                onChange={() => onStrategyChange('balanced')}
                disabled={disabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">
                <span className="font-medium">Balanced</span>
                <span className="text-muted-foreground"> - Balance speed and cost</span>
              </span>
            </label>
          </div>
        </div>

        {/* Currency Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Allowed Currencies</Label>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                disabled={disabled}
                className="h-7 text-xs"
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectEssentials}
                disabled={disabled}
                className="h-7 text-xs"
              >
                Essentials
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectNone}
                disabled={disabled}
                className="h-7 text-xs"
              >
                None
              </Button>
            </div>
          </div>

          {/* Currency checkboxes by category */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(currenciesByCategory).map(([category, currencyList]) => (
              <div key={category} className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">
                  {category}
                </Label>
                <div className="space-y-2 pl-2">
                  {currencyList.map((currency) => (
                    <div key={currency.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`currency-${currency.id}`}
                        checked={selectedCurrencies.includes(currency.id)}
                        onCheckedChange={() => handleCurrencyToggle(currency.id)}
                        disabled={disabled}
                      />
                      <Label
                        htmlFor={`currency-${currency.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {currency.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {selectedCurrencies.length === 0 && (
            <p className="text-xs text-yellow-600 dark:text-yellow-500">
              ⚠️ Select at least one currency to enable crafting calculations
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
