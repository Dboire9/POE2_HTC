import React from 'react';
import { ItemsProvider } from './contexts/ItemsContext';
import { ModifiersProvider } from './contexts/ModifiersContext';
import { SimulationProvider } from './contexts/SimulationContext';
import { Toaster } from './components/ui/toaster';
import { UpdateNotification } from './components/UpdateNotification';
import ItemSelector from './features/items/ItemSelector';
import ModifierSelector from './features/modifiers/ModifierSelector';
import SimulationTrigger from './features/simulation/SimulationTrigger';
import SimulationProgress from './features/simulation/SimulationProgress';
import SimulationSummary from './features/simulation/SimulationSummary';
import ResultsDisplay from './features/simulation/ResultsDisplay';
import CurrencyExclusionPanel from './features/simulation/CurrencyExclusionPanel';
import { useSimulation } from './contexts/SimulationContext';

// Import version from package.json
const version = '0.9.3';

// Helper function to open external links
const openExternalLink = (url: string) => {
  console.log('openExternalLink called with:', url);
  console.log('window.electronAPI:', window.electronAPI);
  
  if (window.electronAPI?.openExternal) {
    console.log('Using electronAPI.openExternal');
    window.electronAPI.openExternal(url).then((result) => {
      console.log('openExternal result:', result);
    }).catch((error) => {
      console.error('openExternal error:', error);
    });
  } else {
    console.log('Using window.open fallback');
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

// T018, T019: Integrate ItemsProvider and ItemSelector into App.tsx
// T035, T036, T037: Integrate ModifiersProvider, ModifierSelector, and Toaster
// T053, T054: Integrate SimulationProvider and simulation components

// Inner component that has access to simulation context
const AppContent: React.FC = () => {
  const { excludedCurrencies, setExcludedCurrencies, minTier, setMinTier } = useSimulation();

  return (
    <div className="min-h-screen text-foreground bg-background">
      <header className="border-b border-border bg-gradient-to-r from-[oklch(0.20_0_0)] to-[oklch(0.24_0_0)]">
        <div className="container flex items-center justify-between gap-2 sm:gap-4 py-3 px-3 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">POE2HTC</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Path of Exile 2 Item Crafting Pathfinder</p>
            </div>
          </div>
          
          <div className="hidden md:flex flex-col items-end gap-2 text-xs text-muted-foreground">
            <button
              onClick={() => openExternalLink('https://github.com/Dboire9')}
              className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer bg-transparent border-none"
            >
              <span className="text-[10px] uppercase tracking-wider opacity-70">Created by</span>
              <span className="font-medium">Dboire</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openExternalLink('https://discord.gg/RvxCWyFF3D')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-500/50 transition-all cursor-pointer"
                title="Join our Discord community"
              >
                <span className="text-[10px] leading-none">💬 Join Discord</span>
              </button>
              <button
                onClick={() => openExternalLink('https://github.com/Dboire9/POE2_HTC/issues/new')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 transition-all cursor-pointer"
                title="Report a bug on GitHub"
              >
                <span className="text-[10px] leading-none">🐛 Report Bug</span>
              </button>
              <button
                onClick={() => openExternalLink('https://buymeacoffee.com/dboire')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 hover:border-yellow-500/50 transition-all cursor-pointer"
                title="Support the project"
              >
                <span className="text-[10px] leading-none">☕ Support</span>
              </button>
              <button
                onClick={() => openExternalLink('https://github.com/Dboire9/POE2_HTC')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 transition-all cursor-pointer"
              >
                <span className="text-[10px] font-mono font-semibold leading-none">v{version}</span>
                <span className="opacity-30 leading-none">|</span>
                <span className="text-[10px] leading-none">⭐ Star & Contribute</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-3 sm:py-4 px-3 sm:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
          {/* Phase 3: User Story 1 - Item Selection */}
          <div className="lg:col-span-4 space-y-3">
            <ItemSelector />
            <CurrencyExclusionPanel
              excludedCurrencies={excludedCurrencies}
              onExcludedCurrenciesChange={setExcludedCurrencies}
              minTier={0}
              onMinTierChange={() => {}}
            />
          </div>

          {/* Phase 4: User Story 2 - Modifier Selection */}
          <div className="lg:col-span-8 space-y-3" data-section="modifiers">
            <ModifierSelector />
          </div>

          {/* Phase 5: User Story 3 - Simulation */}
          <div className="lg:col-span-8 lg:col-start-5 space-y-3">
            <SimulationTrigger />
            <SimulationProgress />
            <SimulationSummary />
            <ResultsDisplay />
          </div>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ItemsProvider>
      <ModifiersProvider>
        <SimulationProvider>
          <AppContent />
          <Toaster />
          <UpdateNotification />
        </SimulationProvider>
      </ModifiersProvider>
    </ItemsProvider>
  );
}
