/**
 * Main App Component - Refactored with CraftingProvider and Three-Column Layout
 */

import { useEffect } from 'react';
import { CraftingProvider } from './contexts/CraftingContext';
import { useCraftingSimulator } from './hooks/useCraftingSimulator';
import { useCraftingProgress } from './hooks/useCraftingProgress';
import { api } from './services/api';
import { ItemSelector } from './components/ItemSelector';
import { ModifierSelector } from './components/ModifierSelector';
import { EnhancedResults } from './components/EnhancedResults';
import { ErrorBanner } from './components/ErrorBanner';
import { ErrorDisplay } from './components/ErrorDisplay';
import { ProgressBar } from './components/ProgressBar';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';

function AppContent() {
  const { state, calculate, cancel } = useCraftingSimulator();
  
  // Enable progress tracking
  useCraftingProgress();
  
  // Destructure state for cleaner access
  const {
    selectedItem,
    availableModifiers,
    selectedModifiers,
    isCalculating,
    progress,
    result,
    error,
    canCalculate,
    setSelectedItem,
    setAvailableModifiers,
    addModifier,
    removeModifier,
    updateModifierTier,
    setError,
  } = state;
  
  console.log('[App] isCalculating:', isCalculating, 'progress:', progress, 'result:', result);

  // Load modifiers when item changes
  useEffect(() => {
    if (!selectedItem) {
      setAvailableModifiers([]);
      return;
    }

    const loadModifiers = async () => {
      try {
        const data = await api.getModifiers(selectedItem.id);
        setAvailableModifiers(data);
      } catch (err) {
        console.error('Failed to load modifiers:', err);
      }
    };
    loadModifiers();
  }, [selectedItem, setAvailableModifiers]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-gradient-to-r from-[oklch(0.20_0_0)] to-[oklch(0.24_0_0)]">
        <div className="container mx-auto flex items-center justify-between gap-4 py-4 px-4">
          <div className="flex items-center gap-4">
            <img src="/screenshots/logo.jpg" alt="POE2" className="h-8 w-8 opacity-90" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                POE2 Crafting Tool
              </h1>
              <p className="text-sm text-muted-foreground">
                Path of Exile 2 Item Crafting Simulator
              </p>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-end gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-mono">v1.0.0</span>
            </div>
            <span>Java Backend + React Frontend</span>
          </div>
        </div>
      </header>

      {/* Main Content - Three Column Layout */}
      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column - Configuration (3 columns) */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Item Selection</CardTitle>
                <CardDescription>Choose the item type to craft</CardDescription>
              </CardHeader>
              <CardContent>
                <ItemSelector
                  selectedItem={selectedItem}
                  onItemChange={setSelectedItem}
                  disabled={isCalculating}
                />
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Modifiers & Calculate (6 columns) */}
          <div className="lg:col-span-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Modifier Selection</CardTitle>
                <CardDescription>
                  Select desired modifiers and their minimum tiers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ModifierSelector
                  availableModifiers={availableModifiers}
                  selectedModifiers={selectedModifiers}
                  onAddModifier={addModifier}
                  onRemoveModifier={removeModifier}
                  onUpdateTier={updateModifierTier}
                  disabled={!selectedItem || isCalculating}
                  selectedItem={selectedItem}
                />
              </CardContent>
            </Card>

            {/* Calculate Button or Progress Bar */}
            {(() => {
              console.log('[App Render] isCalculating:', isCalculating, 'progress:', progress);
              return (isCalculating || progress) ? (
                progress ? (
                  <ProgressBar progress={progress} onCancel={cancel} />
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                          <span className="text-lg font-medium">Calculating optimal crafting path...</span>
                        </div>
                        <p className="text-sm text-muted-foreground">This may take 10-30 seconds for complex items</p>
                        <Button onClick={cancel} variant="outline" size="sm">
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                      {/* Error Display - Use new ErrorDisplay component if error exists */}
                      {error && <ErrorDisplay error={error} onDismiss={() => setError(null)} />}

                      <Button
                        onClick={calculate}
                        disabled={!canCalculate}
                        className="w-full"
                        size="lg"
                      >
                        Calculate Crafting Path
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Results */}
            {result && (
              <div>
                <EnhancedResults result={result} />
              </div>
            )}
          </div>

          {/* Right Column - Info Panel (3 columns) */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Guide</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div>
                  <h4 className="font-semibold mb-1">1. Select Item</h4>
                  <p className="text-muted-foreground">Choose the base item type to craft</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">2. Choose Strategy</h4>
                  <p className="text-muted-foreground">
                    Pick optimization goal and allowed currencies
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">3. Select Modifiers</h4>
                  <p className="text-muted-foreground">Pick desired mods and minimum tiers</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">4. Calculate</h4>
                  <p className="text-muted-foreground">
                    Run simulation to find optimal crafting paths
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Selected Configuration</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div>
                  <p className="font-semibold">Item</p>
                  <p className="text-muted-foreground">
                    {selectedItem?.name || 'None selected'}
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Modifiers</p>
                  <p className="text-muted-foreground">
                    {selectedModifiers.prefixes.length + selectedModifiers.suffixes.length} selected
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>POE2 Crafting Tool • Open Source • Made with ❤️ for the POE2 community</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <CraftingProvider>
      <AppContent />
    </CraftingProvider>
  );
}
