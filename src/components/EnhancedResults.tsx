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

  const getCurrencyIcon = (currencyName: string): string => {
    const icons: Record<string, string> = {
      TransmutationOrb: '🔷',
      AugmentationOrb: '🔶',
      RegalOrb: '🟣',
      ExaltedOrb: '🟡',
      AnnulmentOrb: '⚫',
      AlchemyOrb: '🟤',
      ChaosOrb: '🔴',
      Essence_currency: '💎',
      Desecrated_currency: '☠️',
    };
    return icons[currencyName] || '⚪';
  };

  const getQualityColor = (quality: number): string => {
    if (quality >= 90) return 'text-green-600 dark:text-green-400';
    if (quality >= 70) return 'text-blue-600 dark:text-blue-400';
    if (quality >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const renderStep = (step: CraftingStep, index: number) => {
    const probabilityColor =
      step.probability >= 0.5
        ? 'text-green-600 dark:text-green-400'
        : step.probability >= 0.2
          ? 'text-yellow-600 dark:text-yellow-400'
          : 'text-red-600 dark:text-red-400';

    return (
      <div
        key={index}
        className="flex items-start gap-3 p-3 rounded-md bg-muted/50 border border-border"
      >
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-background border-2 border-border font-semibold text-sm">
          {index + 1}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getCurrencyIcon(step.currencyName)}</span>
            <span className="font-medium">{step.currencyName}</span>
            <span className={`text-sm font-mono ${probabilityColor}`}>
              {(step.probability * 100).toFixed(1)}%
            </span>
          </div>
          {step.description && (
            <p className="text-sm text-muted-foreground">{step.description}</p>
          )}
          {step.resultingModifiers && step.resultingModifiers.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Modifiers: {step.resultingModifiers.join(', ')}
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
            {path.steps.map((step, stepIndex) => renderStep(step, stepIndex))}
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
