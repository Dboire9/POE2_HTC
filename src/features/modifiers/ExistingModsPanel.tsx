import React, { useState } from 'react';
import { useModifiers } from '../../contexts/ModifiersContext';
import { Modifier } from '../../types';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import ModifierList from './ModifierList';
import { ArrowRight, ArrowLeft, Check, X, Sparkles, Info, RotateCcw, Search } from 'lucide-react';
import { HelpIcon } from '../../components/ui/help-icon';

interface ExistingModsPanelProps {
  sourceFilter: 'all' | 'normal' | 'perfect' | 'desecrated';
  setSourceFilter: (filter: 'all' | 'normal' | 'perfect' | 'desecrated') => void;
  onClearAll: () => void;
}

/**
 * ExistingModsPanel - Intuitive two-step workflow for crafting with existing mods
 * Step 1: What mods do you have? (Select item rarity and current mods)
 * Step 2: What mods do you want? (Select target mods to add)
 */
const ExistingModsPanel: React.FC<ExistingModsPanelProps> = ({ sourceFilter, setSourceFilter, onClearAll }) => {
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

  const [step, setStep] = useState<0 | 1 | 2>(0); // Add step 0 for mode selection
  const [craftingMode, setCraftingMode] = useState<'scratch' | 'improve' | null>(null);
  const [raritySelected, setRaritySelected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const hasExistingMods = existingPrefixes.length > 0 || existingSuffixes.length > 0;
  const totalExistingMods = existingPrefixes.length + existingSuffixes.length;
  const totalTargetMods = selectedPrefixes.length + selectedSuffixes.length;

  // Filter modifiers based on search query
  const filterModifiers = (mods: typeof prefixes) => {
    if (!searchQuery.trim()) return mods;
    const query = searchQuery.toLowerCase();
    return mods.filter(mod => 
      mod.text.toLowerCase().includes(query)
    );
  };

  // Get max slots based on rarity
  const maxPrefixes = itemRarity === 'magic' ? 1 : 3;
  const maxSuffixes = itemRarity === 'magic' ? 1 : 3;

  // Available slots for target mods
  const availablePrefixSlots = maxPrefixes - existingPrefixes.length;
  const availableSuffixSlots = maxSuffixes - existingSuffixes.length;

  // Check if we can proceed
  const canProceedToStep2 = craftingMode === 'scratch' ? true : hasExistingMods;

  const handleModeSelect = (mode: 'scratch' | 'improve') => {
    setCraftingMode(mode);
    
    if (mode === 'scratch') {
      // For scratch mode, skip rarity selection and go directly to target mods with rare
      setItemRarity('rare');
      setRaritySelected(true);
      clearExistingMods();
      setStep(2);
      // Scroll down to the modifier lists
      setTimeout(() => {
        const modifierLists = document.querySelector('[data-modifier-lists]');
        if (modifierLists) {
          modifierLists.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      // For improve mode, show rarity selection
      setRaritySelected(false);
      // Scroll to rarity selection
      setTimeout(() => {
        const modifierSection = document.querySelector('[data-section="modifiers"]');
        modifierSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleRarityChange = (rarity: 'magic' | 'rare') => {
    const previousRarity = itemRarity;
    setItemRarity(rarity);
    
    // If rarity changes, clear all modifiers (reset)
    if (rarity !== previousRarity) {
      // Clear all existing mods
      existingPrefixes.forEach(mod => unmarkAsExisting(mod.text));
      existingSuffixes.forEach(mod => unmarkAsExisting(mod.text));
      
      // Clear all selected target mods
      selectedPrefixes.forEach(mod => deselectModifier(mod.text));
      selectedSuffixes.forEach(mod => deselectModifier(mod.text));
    }
  };

  const handleRaritySelect = (rarity: 'magic' | 'rare') => {
    handleRarityChange(rarity);
    setRaritySelected(true);
    
    if (craftingMode === 'scratch') {
      // Clear any existing mods and go directly to step 2 (target mods)
      clearExistingMods();
      setStep(2);
    } else {
      // Go to step 1 to select existing mods
      setStep(1);
    }
    // Scroll down to the modifier lists
    setTimeout(() => {
      const modifierLists = document.querySelector('[data-modifier-lists]');
      if (modifierLists) {
        modifierLists.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

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
      // Scroll to modifier lists in step 2
      setTimeout(() => {
        const modifierLists = document.querySelector('[data-modifier-lists]');
        if (modifierLists) {
          modifierLists.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const goToStep1 = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToModeSelection = () => {
    setStep(0);
    setCraftingMode(null);
    setRaritySelected(false);
    clearExistingMods();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-4">
      {/* Step 0: Mode Selection */}
      {step === 0 && !craftingMode && (
        <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-lg font-bold flex items-center justify-center gap-2">
                Choose Your Crafting Approach
                <HelpIcon content="Select whether you're starting with a fresh base item or improving an item that already has some modifiers." />
              </h2>
              <p className="text-sm text-muted-foreground">
                How would you like to craft your item?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mt-6">
              {/* Start from Scratch */}
              <button
                onClick={() => handleModeSelect('scratch')}
                className="group p-6 border-2 border-muted hover:border-primary rounded-lg transition-all bg-card hover:bg-primary/5 text-left"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-base font-bold">Start from Scratch</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Begin with a blank item and craft the modifiers you want from the ground up.
                  </p>
                </div>
              </button>

              {/* Improve Existing Item */}
              <button
                onClick={() => handleModeSelect('improve')}
                className="group p-6 border-2 border-muted hover:border-orange-500 rounded-lg transition-all bg-card hover:bg-orange-500/5 text-left"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 group-hover:bg-orange-500/20 flex items-center justify-center transition-colors">
                      <Info className="w-6 h-6 text-orange-500" />
                    </div>
                    <h3 className="text-base font-bold">Improve Existing Item</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Already have an item with some mods? Add or improve specific modifiers.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Rarity Selection - Show after mode is selected but before proceeding */}
      {step === 0 && craftingMode && !raritySelected && (
        <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-lg font-bold flex items-center justify-center gap-2">
                Select Item Rarity
                <HelpIcon content="Magic items can have 1 prefix and 1 suffix. Rare items can have up to 3 prefixes and 3 suffixes. This determines how many modifiers your item can have." />
              </h2>
              <p className="text-sm text-muted-foreground">
                What rarity is your item?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mt-6">
              {/* Magic */}
              <button
                onClick={() => handleRaritySelect('magic')}
                className="group p-6 border-2 border-muted hover:border-blue-500 rounded-lg transition-all bg-card hover:bg-blue-500/5 text-left"
              >
                <div className="flex flex-col gap-3">
                  <h3 className="text-base font-bold text-blue-400">Magic Item</h3>
                  <p className="text-sm text-muted-foreground">
                    1 prefix and 1 suffix maximum
                  </p>
                </div>
              </button>

              {/* Rare */}
              <button
                onClick={() => handleRaritySelect('rare')}
                className="group p-6 border-2 border-muted hover:border-yellow-500 rounded-lg transition-all bg-card hover:bg-yellow-500/5 text-left"
              >
                <div className="flex flex-col gap-3">
                  <h3 className="text-base font-bold text-yellow-400">Rare Item</h3>
                  <p className="text-sm text-muted-foreground">
                    Up to 3 prefixes and 3 suffixes
                  </p>
                </div>
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCraftingMode(null)}
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Mode Selection
            </Button>
          </div>
        </Card>
      )}

      {/* Step Indicator - Only show when past mode selection */}
      {step > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Step 1 - Only show for 'improve' mode */}
            {craftingMode === 'improve' && (
              <>
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
              </>
            )}

            {/* Step 2 */}
            <div className={`flex items-center gap-2 ${step === 2 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                ${step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
              `}>
                {craftingMode === 'scratch' ? '1' : '2'}
              </div>
              <span className="text-sm font-medium hidden sm:inline">Target Mods</span>
            </div>
          </div>

          {/* Reset/Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={goToModeSelection}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Change Mode
          </Button>
        </div>
      )}

      {/* Step 1: What mods do you HAVE? */}
      {step === 1 && (
        <>
          <Card className="p-4 border-2 border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <h2 className="text-base font-bold">Current Item Modifiers</h2>
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
                <Select value={itemRarity} onValueChange={(value) => handleRarityChange(value as 'magic' | 'rare')}>
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

              {/* Instruction */}
              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <span className="text-orange-500">②</span>
                  Select the mods your item currently has
                </Label>
                <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Click on the modifiers below that are already on your {itemRarity} item. 
                    You can select up to {maxPrefixes} {maxPrefixes === 1 ? 'prefix' : 'prefixes'} and {maxSuffixes} {maxSuffixes === 1 ? 'suffix' : 'suffixes'}.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Filter Controls */}
          <div className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Filter:</span>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as any)}
                className="text-sm border rounded px-3 py-1.5 bg-background"
              >
                <option value="all">All Mods</option>
                <option value="normal">Normal</option>
                <option value="perfect">Perfect Essence</option>
                <option value="desecrated">Desecrated</option>
              </select>
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search affixes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-1.5 text-sm border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="default"
              onClick={onClearAll}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear All
            </Button>
          </div>

          {/* Modifier Lists */}
          <div className="space-y-4" data-modifier-lists>
            <ModifierList
              title="Prefixes"
              modifiers={filterModifiers(prefixes)}
              selectedModifiers={existingPrefixes}
              onSelect={handleSelectExistingMod}
              onDeselect={handleDeselectExistingMod}
              isModifierDisabled={(id) => existingPrefixes.length >= maxPrefixes && !existingPrefixes.some(m => m.text === id)}
            />

            <ModifierList
              title="Suffixes"
              modifiers={filterModifiers(suffixes)}
              selectedModifiers={existingSuffixes}
              onSelect={handleSelectExistingMod}
              onDeselect={handleDeselectExistingMod}
              isModifierDisabled={(id) => existingSuffixes.length >= maxSuffixes && !existingSuffixes.some(m => m.text === id)}
            />
          </div>

          {/* Summary Card - After Modifier Lists */}
          <Card className="p-4 border-2 border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
            <div className="space-y-4">
              <h3 className="text-base font-semibold">Current Item Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Prefixes */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-card border border-border rounded">
                    <Label className="text-sm font-semibold">Prefixes</Label>
                    <span className="text-xs text-muted-foreground">
                      {existingPrefixes.length}/{maxPrefixes} slots
                    </span>
                  </div>
                  
                  {existingPrefixes.length > 0 ? (
                    <div className="space-y-1.5">
                      {existingPrefixes.map((mod, idx) => (
                        <div key={`sum-p-${idx}`} className="p-2 rounded bg-muted/30 border border-border/50">
                          <div className="text-xs font-medium">{mod.text}</div>
                          <div className="text-xs text-muted-foreground font-mono">Tier {mod.tier}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 border-2 border-dashed border-muted rounded text-center">
                      <p className="text-xs text-muted-foreground">No prefixes</p>
                    </div>
                  )}
                </div>

                {/* Suffixes */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-card border border-border rounded">
                    <Label className="text-sm font-semibold">Suffixes</Label>
                    <span className="text-xs text-muted-foreground">
                      {existingSuffixes.length}/{maxSuffixes} slots
                    </span>
                  </div>
                  
                  {existingSuffixes.length > 0 ? (
                    <div className="space-y-1.5">
                      {existingSuffixes.map((mod, idx) => (
                        <div key={`sum-s-${idx}`} className="p-2 rounded bg-muted/30 border border-border/50">
                          <div className="text-xs font-medium">{mod.text}</div>
                          <div className="text-xs text-muted-foreground font-mono">Tier {mod.tier}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 border-2 border-dashed border-muted rounded text-center">
                      <p className="text-xs text-muted-foreground">No suffixes</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Message */}
              {!hasExistingMods && (
                <div className="p-3 border-2 border-dashed border-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    Select current modifiers above to continue
                  </p>
                </div>
              )}
            </div>
          </Card>

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
        </>
      )}

      {/* Step 2: What mods do you WANT? */}
      {step === 2 && (
        <>
          <Card className="p-4 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="space-y-2">
              <h2 className="text-base font-bold">Target Modifiers</h2>
              <p className="text-sm text-muted-foreground">
                Select the modifiers you want to add to your item
              </p>
            </div>
          </Card>

          {/* Filter Controls */}
          <div className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Filter:</span>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as any)}
                className="text-sm border rounded px-3 py-1.5 bg-background"
              >
                <option value="all">All Mods</option>
                <option value="normal">Normal</option>
                <option value="perfect">Perfect Essence</option>
                <option value="desecrated">Desecrated</option>
              </select>
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search affixes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-1.5 text-sm border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="default"
              onClick={onClearAll}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear All
            </Button>
          </div>

          {/* Modifier Lists (filtered) */}
          <div className="space-y-4" data-modifier-lists>
            <ModifierList
              title="Prefixes"
              modifiers={filterModifiers(prefixes.filter(p => !existingPrefixes.some(ep => ep.text === p.text)))}
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
              modifiers={filterModifiers(suffixes.filter(s => !existingSuffixes.some(es => es.text === s.text)))}
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

          {/* Summary Card - After Modifier Lists */}
          <Card className="p-4 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="space-y-4">
              <h3 className="text-base font-semibold">Selection Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Prefixes Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-card border border-border rounded">
                    <Label className="text-sm font-semibold">Prefixes</Label>
                    <span className="text-xs text-muted-foreground">
                      {existingPrefixes.length + selectedPrefixes.length}/{maxPrefixes} slots
                    </span>
                  </div>
                  
                  {/* Current Prefixes */}
                  {existingPrefixes.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground font-medium">Current:</span>
                      <div className="space-y-1.5">
                        {existingPrefixes.map((mod, idx) => (
                          <div key={`cur-p-${idx}`} className="p-2 rounded bg-muted/30 border border-border/50">
                            <div className="text-xs font-medium">{mod.text}</div>
                            <div className="text-xs text-muted-foreground font-mono">Tier {mod.tier}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Target Prefixes */}
                  {selectedPrefixes.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs text-foreground font-medium">Target:</span>
                      <div className="space-y-1.5">
                        {selectedPrefixes.map((mod, idx) => (
                          <div key={`tp-${idx}`} className="p-2 rounded bg-muted/50 border border-border">
                            <div className="text-xs font-medium">{mod.text}</div>
                            <div className="text-xs text-foreground/70 font-mono">Tier {mod.tier}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {existingPrefixes.length === 0 && selectedPrefixes.length === 0 && (
                    <div className="p-3 border-2 border-dashed border-muted rounded text-center">
                      <p className="text-xs text-muted-foreground">No prefixes</p>
                    </div>
                  )}
                </div>

                {/* Suffixes Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-card border border-border rounded">
                    <Label className="text-sm font-semibold">Suffixes</Label>
                    <span className="text-xs text-muted-foreground">
                      {existingSuffixes.length + selectedSuffixes.length}/{maxSuffixes} slots
                    </span>
                  </div>
                  
                  {/* Current Suffixes */}
                  {existingSuffixes.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground font-medium">Current:</span>
                      <div className="space-y-1.5">
                        {existingSuffixes.map((mod, idx) => (
                          <div key={`cur-s-${idx}`} className="p-2 rounded bg-muted/30 border border-border/50">
                            <div className="text-xs font-medium">{mod.text}</div>
                            <div className="text-xs text-muted-foreground font-mono">Tier {mod.tier}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Target Suffixes */}
                  {selectedSuffixes.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs text-foreground font-medium">Target:</span>
                      <div className="space-y-1.5">
                        {selectedSuffixes.map((mod, idx) => (
                          <div key={`ts-${idx}`} className="p-2 rounded bg-muted/50 border border-border">
                            <div className="text-xs font-medium">{mod.text}</div>
                            <div className="text-xs text-foreground/70 font-mono">Tier {mod.tier}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {existingSuffixes.length === 0 && selectedSuffixes.length === 0 && (
                    <div className="p-3 border-2 border-dashed border-muted rounded text-center">
                      <p className="text-xs text-muted-foreground">No suffixes</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Message */}
              {totalTargetMods === 0 && (
                <div className="p-3 border-2 border-dashed border-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    Select target modifiers above to begin crafting simulation
                  </p>
                </div>
              )}

              {/* Back Button - Only show in improve mode */}
              {craftingMode === 'improve' && (
                <Button
                  onClick={goToStep1}
                  variant="outline"
                  size="lg"
                  className="w-full h-12"
                >
                  <ArrowLeft className="mr-2 w-5 h-5" />
                  Back to Edit Current Mods
                </Button>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default ExistingModsPanel;

