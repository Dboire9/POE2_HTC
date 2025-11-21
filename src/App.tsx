import React from 'react';
import { ItemsProvider } from './contexts/ItemsContext';
import { Toaster } from './components/ui/toaster';
import ItemSelector from './features/items/ItemSelector';

// T018, T019: Integrate ItemsProvider and ItemSelector into App.tsx
export default function App() {
  return (
    <ItemsProvider>
      <div className="min-h-screen text-foreground bg-background">
        <header className="border-b border-border bg-gradient-to-r from-[oklch(0.20_0_0)] to-[oklch(0.24_0_0)]">
          <div className="container flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-4">
              <img src="/screenshots/logo.jpg" alt="POE2" className="h-8 w-8 opacity-90" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">POE2 Crafting Tool</h1>
                <p className="text-sm text-muted-foreground">Path of Exile 2 Item Crafting Simulator</p>
              </div>
            </div>
            
            <div className="hidden md:flex flex-col items-end gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <a 
                  href="https://github.com/Dboire9" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <span className="text-[10px] uppercase tracking-wider opacity-70">Backend & Algorithm</span>
                  <span className="font-medium">Dboire</span>
                </a>
                <span className="opacity-30">•</span>
                <a 
                  href="https://github.com/fZpHr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <span className="text-[10px] uppercase tracking-wider opacity-70">Frontend & Integration</span>
                  <span className="font-medium">fZpHr</span>
                </a>
              </div>
              <a 
                href="https://github.com/Dboire9/POE2_HTC" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 transition-all"
              >
                <span className="text-[10px] font-mono font-semibold leading-none">v0.2-dev</span>
                <span className="opacity-30 leading-none">|</span>
                <span className="text-[10px] leading-none">⭐ Star & Contribute</span>
              </a>
            </div>
          </div>
        </header>

        <main className="container py-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Phase 3: User Story 1 - Item Selection */}
            <div className="space-y-6">
              <ItemSelector />
            </div>

            {/* TODO: Phase 4 - Modifier Selection will be added here */}
            {/* TODO: Phase 5 - Simulation will be added here */}
          </div>
        </main>
      </div>
      <Toaster />
    </ItemsProvider>
  );
}
