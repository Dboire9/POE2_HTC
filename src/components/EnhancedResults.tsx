/**
 * Enhanced Results Display Component
 * Shows crafting calculation results with alternative paths and cost breakdown
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { CraftingResult, CraftingPath, CraftingStep } from '../types/api';
import { ChevronDown, ChevronUp, TrendingUp, DollarSign, Clock } from 'lucide-react';

interface EnhancedResultsProps {
  result: CraftingResult;
}

export function EnhancedResults({ result }: EnhancedResultsProps) {
  console.log('[EnhancedResults] Rendering with result:', result);
  const [expandedPaths, setExpandedPaths] = useState<Set<number>>(new Set([0]));

  const togglePath = (index: number) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const getCurrencyIcon = (currencyName: string, tier?: string, omens?: string[]): string => {
    // Debug: log values to check what we're receiving
    if (currencyName === 'Essence_currency' || currencyName === 'Desecrated_currency') {
      console.log(`[getCurrencyIcon] currencyName: ${currencyName}, tier: ${tier}, omens: ${omens}`);
    }
    
    // Special handling for Essence - Perfect Essence is identified by Crystallisation omens
    if (currencyName === 'Essence_currency') {
      // Perfect Essence has OmenofDextralCrystallisation or OmenofSinistralCrystallisation
      const hasCrystallisationOmen = omens?.some(omen => 
        omen === 'OmenofDextralCrystallisation' || omen === 'OmenofSinistralCrystallisation'
      );
      
      if (hasCrystallisationOmen) {
        return '💎'; // Perfect Essence
      } else {
        return '🔮'; // Normal Essence
      }
    }
    
    // Special handling for Desecrated - check omens
    if (currencyName === 'Desecrated_currency') {
      // Desecrated has OmenoftheSovereign or similar
      const hasDesecratedOmen = omens?.some(omen => omen.includes('Sovereign'));
      if (hasDesecratedOmen || tier === '101' || tier?.toUpperCase().includes('DESECRATED')) {
        return '☠️'; // Desecrated
      }
    }
    
    const icons: Record<string, string> = {
      TransmutationOrb: '🔷',
      AugmentationOrb: '🔶',
      RegalOrb: '🟣',
      ExaltedOrb: '🟡',
      AnnulmentOrb: '⚫',
      AlchemyOrb: '🟤',
      ChaosOrb: '🔴',
    };
    return icons[currencyName] || '⚪';
  };

  const getQualityColor = (quality: number): string => {
    if (quality >= 90) return 'text-green-600 dark:text-green-400';
    if (quality >= 70) return 'text-blue-600 dark:text-blue-400';
    if (quality >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const renderStep = (step: CraftingStep, index: number, allSteps: CraftingStep[]) => {
    const probabilityColor =
      step.probability >= 0.5
        ? 'text-green-600 dark:text-green-400'
        : step.probability >= 0.2
          ? 'text-yellow-600 dark:text-yellow-400'
          : 'text-red-600 dark:text-red-400';

    // Get previous step's modifiers to detect changes
    const previousMods = index > 0 ? allSteps[index - 1].resultingModifiers || [] : [];
    const currentMods = step.resultingModifiers || [];
    
    // Detect added modifiers (in current but not in previous)
    const addedMods = currentMods.filter(mod => !previousMods.includes(mod));
    
    // Detect removed modifiers (in previous but not in current)
    const removedMods = previousMods.filter(mod => !currentMods.includes(mod));
    
    // Unchanged modifiers
    const unchangedMods = currentMods.filter(mod => previousMods.includes(mod));

    return (
      <div
        key={index}
        className="flex items-start gap-3 p-3 rounded-md bg-muted/50 border border-border"
      >
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-background border-2 border-border font-semibold text-sm">
          {index + 1}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl">{getCurrencyIcon(step.currencyName, step.tier)}</span>
            <span className="font-medium">{step.currencyName}</span>
            {step.tier && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-medium">
                Tier {step.tier}
              </span>
            )}
            {step.omens && step.omens.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-medium">
                {step.omens.some(omen => omen === 'OmenofDextralCrystallisation' || omen === 'OmenofSinistralCrystallisation') ? '💎' : '🔮'} {step.omens.join(', ')}
              </span>
            )}
            <span className={`text-sm font-mono ${probabilityColor}`}>
              {(step.probability * 100).toFixed(1)}%
            </span>
          </div>
          {step.description && (
            <p className="text-sm text-muted-foreground">{step.description}</p>
          )}
          
          {/* Show what changed - ONLY for Perfect Essence (identified by Crystallisation omens) */}
          {currentMods.length > 0 && (() => {
            // Perfect Essence is identified by having Crystallisation omens
            const hasCrystallisationOmen = step.omens?.some(omen => 
              omen === 'OmenofDextralCrystallisation' || omen === 'OmenofSinistralCrystallisation'
            );
            const isPerfectEssence = step.currencyName === 'Essence_currency' && hasCrystallisationOmen;
            
            // ONLY Perfect Essence replaces modifiers - show added/removed
            if (isPerfectEssence) {
              return (
                <div className="text-xs space-y-1 pt-1">
                  {addedMods.length > 0 && (
                    <div>
                      <span className="text-green-600 dark:text-green-400 font-semibold">✓ Added:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {addedMods.map((mod, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 border-purple-300 dark:border-purple-700"
                          >
                            💎 {mod}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {removedMods.length > 0 && (
                    <div>
                      <span className="text-red-600 dark:text-red-400 font-semibold">✗ Removed:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {removedMods.map((mod, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 line-through opacity-75"
                          >
                            {mod}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            
            // For all other currency types (including Desecrated, normal essence, etc.), 
            // just show the modifier that was added
            if (addedMods.length > 0) {
              // Determine modifier type from next step's Perfect Essence omen
              let modifierType = 'modifier';
              if (index + 1 < allSteps.length) {
                const nextStep = allSteps[index + 1];
                if (nextStep.omens?.includes('OmenofSinistralCrystallisation')) {
                  modifierType = 'prefix';
                } else if (nextStep.omens?.includes('OmenofDextralCrystallisation')) {
                  modifierType = 'suffix';
                }
              }
              
              return (
                <div className="text-xs pt-1">
                  <div className="flex flex-wrap gap-1">
                    {addedMods.map((mod, idx) => (
                      <div key={idx} className="flex flex-col gap-1 w-full">
                        <span 
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700 w-fit"
                        >
                          {mod}
                        </span>
                        {step.temporaryModifier && (
                          <span 
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border border-orange-300 dark:border-orange-700 w-fit"
                            title={`This modifier will be replaced by Perfect Essence (any ${modifierType} is acceptable)`}
                          >
                            ⚠️ Will be replaced, any {modifierType} is acceptable
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            
            return null;
          })()}
          
          {/* Show all modifiers for first step */}
          {index === 0 && currentMods.length > 0 && (
            <div className="text-xs space-y-1 pt-1">
              <span className="text-muted-foreground font-medium">Initial Modifiers:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {currentMods.map((mod, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    {mod}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPath = (path: CraftingPath, index: number, isPrimary: boolean = false) => {
    const isExpanded = expandedPaths.has(index);

    return (
      <Card key={index} className={isPrimary ? 'border-2 border-primary' : ''}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {isPrimary && <span className="text-primary">★</span>}
                {path.label || `Path ${index + 1}`}
              </CardTitle>
              <CardDescription>
                {path.steps.length} steps • Success rate: {(path.successRate * 100).toFixed(1)}%
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => togglePath(index)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Path metrics */}
          <div className="flex gap-4 pt-2 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{path.steps.length} steps</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>{path.estimatedCost?.toFixed(1) || 'N/A'} chaos</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span className={getQualityColor(path.quality || 75)}>
                {path.quality?.toFixed(0) || 75}% quality
              </span>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-2">
            {path.steps.map((step, stepIndex) => renderStep(step, stepIndex, path.steps))}
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle>Crafting Results</CardTitle>
          <CardDescription>
            {result.alternatives && result.alternatives.length > 0
              ? `Found ${result.alternatives.length + 1} possible crafting paths`
              : 'Single crafting path found'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="space-y-1 transition-all duration-300 hover:scale-105">
              <p className="text-sm text-muted-foreground">Average Cost</p>
              <p className="text-2xl font-bold">
                {result.averageCost?.toFixed(1) || 'N/A'}{' '}
                <span className="text-sm font-normal text-muted-foreground">chaos</span>
              </p>
            </div>
            <div className="space-y-1 transition-all duration-300 hover:scale-105">
              <p className="text-sm text-muted-foreground">Est. Attempts</p>
              <p className="text-2xl font-bold">{result.estimatedAttempts || 'N/A'}</p>
            </div>
            <div className="space-y-1 transition-all duration-300 hover:scale-105">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold">
                {((result.path.successRate || 0) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paths tabs if alternatives exist */}
      {result.alternatives && result.alternatives.length > 0 ? (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Paths</TabsTrigger>
            <TabsTrigger value="primary">Primary Path</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {renderPath(result.path, 0, true)}
            {result.alternatives.map((path, index) => renderPath(path, index + 1))}
          </TabsContent>

          <TabsContent value="primary" className="mt-4">
            {renderPath(result.path, 0, true)}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-3">{renderPath(result.path, 0, true)}</div>
      )}
    </div>
  );
}
