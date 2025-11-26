import React, { useState } from 'react';
import { useModifiers } from '../../contexts/ModifiersContext';
import { Modifier } from '../../types';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import ModifierList from './ModifierList';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

/**
 * ExistingModsPanel - Two-step workflow for crafting with existing mods
 * Step 1: Select mods already on the item
 * Step 2: Select desired target mods to add
 */
const ExistingModsPanel: React.FC = () => {
  const {
    prefixes,
    suffixes,
    selectedPrefixes,
    selectedSuffixes,
    existingPrefixes,
    existingSuffixes,
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
    if (hasExistingMods) {
      setStep(2);
      // Scroll to top when switching steps
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToStep1 = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold ${step === 1 ? 'text-orange-500' : 'text-muted-foreground'}`}>
            Step 1: Current Mods
          </span>
          <span className={`text-xs font-semibold ${step === 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            Step 2: Target Mods
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-primary transition-all duration-500"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>
      </div>

      {/* Step 1: Select Existing Mods */}
      {step === 1 && (
        <>
          {/* Header Card */}
          <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/30">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 text-white font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Select Your Current Mods</h3>
                    <p className="text-sm text-muted-foreground">
                      Click on the modifiers that are already on your item
                    </p>
                  </div>
                </div>
              </div>

              {/* Selection Status */}
              {hasExistingMods ? (
                <div className="flex items-center justify-between p-4 bg-orange-500/20 rounded-lg border border-orange-500/30">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-orange-500" />
                    <div>
                      <div className="font-semibold text-sm">
                        {totalExistingMods} mod{totalExistingMods !== 1 ? 's' : ''} selected
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {existingPrefixes.length} {existingPrefixes.length === 1 ? 'Prefix' : 'Prefixes'}, {existingSuffixes.length} {existingSuffixes.length === 1 ? 'Suffix' : 'Suffixes'}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearExistingMods}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-500/20"
                  >
                    Clear All
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
                  <p className="text-sm text-muted-foreground text-center">
                    No mods selected yet. Click on modifiers below to mark them as existing on your item.
                  </p>
                </div>
              )}

              {/* Action Button */}
              <Button
                onClick={goToStep2}
                disabled={!hasExistingMods}
                size="lg"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              >
                Continue to Target Selection
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* Modifier Selection */}
          <div className="space-y-6">
            <ModifierList
              title="Prefixes"
              modifiers={prefixes}
              selectedModifiers={existingPrefixes}
              onSelect={handleSelectExistingMod}
              onDeselect={handleDeselectExistingMod}
              isModifierDisabled={(id) => existingPrefixes.length >= 3 && !existingPrefixes.some(m => m.text === id)}
            />

            <ModifierList
              title="Suffixes"
              modifiers={suffixes}
              selectedModifiers={existingSuffixes}
              onSelect={handleSelectExistingMod}
              onDeselect={handleDeselectExistingMod}
              isModifierDisabled={(id) => existingSuffixes.length >= 3 && !existingSuffixes.some(m => m.text === id)}
            />
          </div>
        </>
      )}

      {/* Step 2: Select Target Mods */}
      {step === 2 && (
        <>
          {/* Header Card */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Select Your Target Mods</h3>
                    <p className="text-sm text-muted-foreground">
                      Click on the modifiers you want to add to your item
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Mods Summary */}
              <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <div className="text-xs font-semibold text-orange-600 uppercase mb-2">
                  Your item currently has:
                </div>
                <div className="flex flex-wrap gap-2">
                  {existingPrefixes.map((mod, idx) => (
                    <div
                      key={`existing-p-${idx}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-background border border-orange-500/30 text-xs"
                    >
                      <span className="font-semibold text-orange-500">P</span>
                      <span>{mod.text}</span>
                      <span className="text-orange-500 font-mono text-[10px]">T{mod.tier}</span>
                    </div>
                  ))}
                  {existingSuffixes.map((mod, idx) => (
                    <div
                      key={`existing-s-${idx}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-background border border-orange-500/30 text-xs"
                    >
                      <span className="font-semibold text-orange-500">S</span>
                      <span>{mod.text}</span>
                      <span className="text-orange-500 font-mono text-[10px]">T{mod.tier}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Mods Status */}
              {totalTargetMods > 0 && (
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="text-xs font-semibold text-primary uppercase mb-2">
                    Target mods to add:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrefixes.map((mod, idx) => (
                      <div
                        key={`target-p-${idx}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-background border border-primary/30 text-xs"
                      >
                        <span className="font-semibold text-primary">P</span>
                        <span>{mod.text}</span>
                        <span className="text-primary font-mono text-[10px]">T{mod.tier}</span>
                      </div>
                    ))}
                    {selectedSuffixes.map((mod, idx) => (
                      <div
                        key={`target-s-${idx}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-background border border-primary/30 text-xs"
                      >
                        <span className="font-semibold text-primary">S</span>
                        <span>{mod.text}</span>
                        <span className="text-primary font-mono text-[10px]">T{mod.tier}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Back Button */}
              <Button
                onClick={goToStep1}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Edit Current Mods
              </Button>
            </div>
          </Card>

          {/* Modifier Selection (filtered to exclude existing) */}
          <div className="space-y-6">
            <ModifierList
              title="Prefixes"
              modifiers={prefixes.filter(p => !existingPrefixes.some(ep => ep.text === p.text))}
              selectedModifiers={selectedPrefixes}
              onSelect={handleSelectTargetMod}
              onDeselect={handleDeselectTargetMod}
              isModifierDisabled={isModifierDisabled}
            />

            <ModifierList
              title="Suffixes"
              modifiers={suffixes.filter(s => !existingSuffixes.some(es => es.text === s.text))}
              selectedModifiers={selectedSuffixes}
              onSelect={handleSelectTargetMod}
              onDeselect={handleDeselectTargetMod}
              isModifierDisabled={isModifierDisabled}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ExistingModsPanel;
