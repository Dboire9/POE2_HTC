import React, { useState } from 'react';
import { useModifiers } from '../../contexts/ModifiersContext';
import { Modifier } from '../../types';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import ModifierList from './ModifierList';
import { ArrowRight, ArrowLeft, Check, X, Sparkles, Info } from 'lucide-react';

/**
 * ExistingModsPanel - Intuitive two-step workflow for crafting with existing mods
 * Step 1: What mods do you have? (Select item rarity and current mods)
 * Step 2: What mods do you want? (Select target mods to add)
 */
const ExistingModsPanel: React.FC = () => {
  const {
    prefixes,
    suffixes,
    selectedPrefixes,
    selectedSuffixes,
    existingPrefixes,
    existingSuffixes,
    itemRarity,
    setItemRarity,
    markAsExisting,
    unmarkAsExisting,
    clearExistingMods,
    selectModifier,
    deselectModifier,
    isModifierDisabled,
  } = useModifiers();

  const [step, setStep] = useState<1 | 2>(1);

  const hasExistingMods = existingPrefixes.length > 0 || existingSuffixes.length > 0;
  const totalExistingMods = existingPrefixes.length + existingSuffixes.length;
  const totalTargetMods = selectedPrefixes.length + selectedSuffixes.length;

  // Get max slots based on rarity
  const maxPrefixes = itemRarity === 'magic' ? 1 : 3;
  const maxSuffixes = itemRarity === 'magic' ? 1 : 3;

  // Available slots for target mods
  const availablePrefixSlots = maxPrefixes - existingPrefixes.length;
  const availableSuffixSlots = maxSuffixes - existingSuffixes.length;

  // Check if we can proceed
  const canProceedToStep2 = hasExistingMods;

  // Step 1: Select existing mods
  const handleSelectExistingMod = (modifier: Modifier, tier?: number) => {
    markAsExisting(modifier, tier);
  };

  const handleDeselectExistingMod = (modifierId: string) => {
    unmarkAsExisting(modifierId);
  };

  // Step 2: Select target mods
  const handleSelectTargetMod = (modifier: Modifier, tier?: number) => {
    selectModifier(modifier, tier);
  };

  const handleDeselectTargetMod = (modifierId: string) => {
    deselectModifier(modifierId);
  };

  const goToStep2 = () => {
    if (canProceedToStep2) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToStep1 = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Step 1 */}
          <div className={`flex items-center gap-2 ${step === 1 ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
              ${step === 1 
                ? 'bg-orange-500 text-white' 
                : hasExistingMods 
                  ? 'bg-green-500 text-white' 
                  : 'bg-muted text-muted-foreground'}
            `}>
              {hasExistingMods && step === 2 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className="text-sm font-medium hidden sm:inline">Current Mods</span>
          </div>

          {/* Connector */}
          <div className={`h-0.5 w-12 ${step === 2 ? 'bg-primary' : 'bg-muted'}`} />

          {/* Step 2 */}
          <div className={`flex items-center gap-2 ${step === 2 ? 'opacity-100' : 'opacity-50'}`}>
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
              ${step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
            `}>
              2
            </div>
            <span className="text-sm font-medium hidden sm:inline">Target Mods</span>
          </div>
        </div>

        {/* Reset All */}
        {(hasExistingMods || totalTargetMods > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearExistingMods();
              setStep(1);
            }}
            className="text-destructive hover:text-destructive"
          >
            <X className="w-4 h-4 mr-1" />
            Reset All
          </Button>
        )}
      </div>

      {/* Step 1: What mods do you HAVE? */}
      {step === 1 && (
        <>
          <Card className="p-6 border-2 border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
            <div className="space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Current Item Modifiers</h2>
                <p className="text-sm text-muted-foreground">
                  Select your item's rarity and the modifiers it currently has
                </p>
              </div>

              {/* Rarity Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <span className="text-orange-500">①</span>
                  What rarity is your item?
                </Label>
                <Select value={itemRarity} onValueChange={(value) => setItemRarity(value as 'magic' | 'rare')}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="magic" className="text-base">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium text-blue-600">Magic</span>
                        <span className="text-xs text-muted-foreground ml-4">1 Prefix + 1 Suffix</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="rare" className="text-base">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium text-yellow-600">Rare</span>
                        <span className="text-xs text-muted-foreground ml-4">3 Prefixes + 3 Suffixes</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Current Mods Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <span className="text-orange-500">②</span>
                  Select the mods your item currently has
                </Label>
                
                {/* Info Box */}
                <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Click on the modifiers below that are already on your {itemRarity} item. 
                    You can select up to {maxPrefixes} {maxPrefixes === 1 ? 'prefix' : 'prefixes'} and {maxSuffixes} {maxSuffixes === 1 ? 'suffix' : 'suffixes'}.
                  </p>
                </div>

                {/* Selected Mods Display */}
                {hasExistingMods ? (
                  <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-orange-600">
                        ✓ {totalExistingMods} mod{totalExistingMods !== 1 ? 's' : ''} selected
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {existingPrefixes.length}/{maxPrefixes} P · {existingSuffixes.length}/{maxSuffixes} S
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {existingPrefixes.map((mod, idx) => (
                        <div
                          key={`ep-${idx}`}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-background border-2 border-orange-500/50 shadow-sm"
                        >
                          <span className="text-xs font-bold text-orange-500">PREFIX</span>
                          <span className="text-sm font-medium">{mod.text}</span>
                          <span className="text-xs text-orange-500 font-mono">T{mod.tier}</span>
                        </div>
                      ))}
                      {existingSuffixes.map((mod, idx) => (
                        <div
                          key={`es-${idx}`}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-background border-2 border-orange-500/50 shadow-sm"
                        >
                          <span className="text-xs font-bold text-orange-500">SUFFIX</span>
                          <span className="text-sm font-medium">{mod.text}</span>
                          <span className="text-xs text-orange-500 font-mono">T{mod.tier}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 border-2 border-dashed border-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">
                      No mods selected. Click on modifiers below to mark them as current.
                    </p>
                  </div>
                )}
              </div>

              {/* Continue Button */}
              <Button
                onClick={goToStep2}
                disabled={!canProceedToStep2}
                size="lg"
                className="w-full h-12 text-base font-semibold bg-orange-500 hover:bg-orange-600"
              >
                {canProceedToStep2 ? (
                  <>
                    Continue to Target Selection
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                ) : (
                  'Select at least one mod to continue'
                )}
              </Button>
            </div>
          </Card>

          {/* Modifier Lists */}
          <div className="space-y-6">
            <ModifierList
              title="Prefixes"
              modifiers={prefixes}
              selectedModifiers={existingPrefixes}
              onSelect={handleSelectExistingMod}
              onDeselect={handleDeselectExistingMod}
              isModifierDisabled={(id) => existingPrefixes.length >= maxPrefixes && !existingPrefixes.some(m => m.text === id)}
            />

            <ModifierList
              title="Suffixes"
              modifiers={suffixes}
              selectedModifiers={existingSuffixes}
              onSelect={handleSelectExistingMod}
              onDeselect={handleDeselectExistingMod}
              isModifierDisabled={(id) => existingSuffixes.length >= maxSuffixes && !existingSuffixes.some(m => m.text === id)}
            />
          </div>
        </>
      )}

      {/* Step 2: What mods do you WANT? */}
      {step === 2 && (
        <>
          <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Target Modifiers</h2>
                <p className="text-sm text-muted-foreground">
                  Select the modifiers you want to add to your item
                </p>
              </div>

              {/* Current Mods Summary */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-muted-foreground">Your item currently has:</Label>
                <div className="flex flex-wrap gap-2">
                  {existingPrefixes.map((mod, idx) => (
                    <div key={`cur-p-${idx}`} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-orange-500/10 border border-orange-500/20 text-xs">
                      <span className="font-bold text-orange-500">P</span>
                      <span>{mod.text}</span>
                    </div>
                  ))}
                  {existingSuffixes.map((mod, idx) => (
                    <div key={`cur-s-${idx}`} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-orange-500/10 border border-orange-500/20 text-xs">
                      <span className="font-bold text-orange-500">S</span>
                      <span>{mod.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Slots Info */}
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Info className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  You can add up to <span className="font-semibold text-foreground">{availablePrefixSlots} {availablePrefixSlots === 1 ? 'prefix' : 'prefixes'}</span> and{' '}
                  <span className="font-semibold text-foreground">{availableSuffixSlots} {availableSuffixSlots === 1 ? 'suffix' : 'suffixes'}</span>
                </span>
              </div>

              {/* Target Mods Display */}
              {totalTargetMods > 0 ? (
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">
                      ✓ {totalTargetMods} target mod{totalTargetMods !== 1 ? 's' : ''} selected
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {selectedPrefixes.length} P · {selectedSuffixes.length} S
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrefixes.map((mod, idx) => (
                      <div
                        key={`tp-${idx}`}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-background border-2 border-primary/50 shadow-sm"
                      >
                        <span className="text-xs font-bold text-primary">PREFIX</span>
                        <span className="text-sm font-medium">{mod.text}</span>
                        <span className="text-xs text-primary font-mono">T{mod.tier}</span>
                      </div>
                    ))}
                    {selectedSuffixes.map((mod, idx) => (
                      <div
                        key={`ts-${idx}`}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-background border-2 border-primary/50 shadow-sm"
                      >
                        <span className="text-xs font-bold text-primary">SUFFIX</span>
                        <span className="text-sm font-medium">{mod.text}</span>
                        <span className="text-xs text-primary font-mono">T{mod.tier}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 border-2 border-dashed border-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    No target mods selected. Click on modifiers below to add them to your crafting goals.
                  </p>
                </div>
              )}

              {/* Back Button */}
              <Button
                onClick={goToStep1}
                variant="outline"
                size="lg"
                className="w-full h-12"
              >
                <ArrowLeft className="mr-2 w-5 h-5" />
                Back to Edit Current Mods
              </Button>
            </div>
          </Card>

          {/* Modifier Lists (filtered) */}
          <div className="space-y-6">
            <ModifierList
              title="Prefixes"
              modifiers={prefixes.filter(p => !existingPrefixes.some(ep => ep.text === p.text))}
              selectedModifiers={selectedPrefixes}
              onSelect={handleSelectTargetMod}
              onDeselect={handleDeselectTargetMod}
              isModifierDisabled={(id) => {
                const totalPrefixes = existingPrefixes.length + selectedPrefixes.length;
                const wouldExceedLimit = totalPrefixes >= maxPrefixes && !selectedPrefixes.some(m => m.text === id);
                return wouldExceedLimit || isModifierDisabled(id);
              }}
            />

            <ModifierList
              title="Suffixes"
              modifiers={suffixes.filter(s => !existingSuffixes.some(es => es.text === s.text))}
              selectedModifiers={selectedSuffixes}
              onSelect={handleSelectTargetMod}
              onDeselect={handleDeselectTargetMod}
              isModifierDisabled={(id) => {
                const totalSuffixes = existingSuffixes.length + selectedSuffixes.length;
                const wouldExceedLimit = totalSuffixes >= maxSuffixes && !selectedSuffixes.some(m => m.text === id);
                return wouldExceedLimit || isModifierDisabled(id);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ExistingModsPanel;
