import React from 'react';
import { Toaster } from './components/ui/toaster';
import EngineLab from './features/engine/EngineLab';

// App version (shown in the header).
const version = '0.9.7';

// Open a link in a new tab. This used to route through an Electron bridge when one was present; the
// app ships as a web page only now, so there is just the one path.
const openExternalLink = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

export default function App() {
  return (
    <div className="min-h-screen text-foreground bg-background">
      <header className="border-b border-border bg-gradient-to-r from-[oklch(0.20_0_0)] to-[oklch(0.24_0_0)]">
        <div className="container flex items-center justify-between gap-2 sm:gap-4 py-3 px-3 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
                POE2HTC <span className="text-xs sm:text-sm text-yellow-500 font-semibold">BETA</span>
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Path of Exile 2 How to Craft</p>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-end gap-2 text-xs text-muted-foreground">
            <button
              onClick={() => openExternalLink('https://github.com/Dboire9')}
              className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer bg-transparent border-none"
            >
              <span className="text-xs uppercase tracking-wider opacity-70">Created by</span>
              <span className="font-medium text-sm">Dboire</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openExternalLink('https://discord.gg/RvxCWyFF3D')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-500/50 transition-all cursor-pointer"
                title="Join our Discord community"
              >
                <span className="text-xs leading-none">💬 Join Discord</span>
              </button>
              <button
                onClick={() => openExternalLink('https://github.com/Dboire9/POE2_HTC/issues/new')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 transition-all cursor-pointer"
                title="Report a bug on GitHub"
              >
                <span className="text-xs leading-none">🐛 Report Bug</span>
              </button>
              <button
                onClick={() => openExternalLink('https://buymeacoffee.com/dboire')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 hover:border-yellow-500/50 transition-all cursor-pointer"
                title="Support the project"
              >
                <span className="text-xs leading-none">☕ Support</span>
              </button>
              <button
                onClick={() => openExternalLink('https://github.com/Dboire9/POE2_HTC/releases/latest')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 transition-all cursor-pointer"
                title="Download desktop app for offline use"
              >
                <span className="text-xs leading-none">⬇️ Desktop App</span>
              </button>
              <button
                onClick={() => openExternalLink('https://github.com/Dboire9/POE2_HTC')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 transition-all cursor-pointer"
              >
                <span className="text-xs font-mono font-semibold leading-none">v{version}</span>
                <span className="opacity-30 leading-none">|</span>
                <span className="text-xs leading-none">⭐ Star & Contribute</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-3 sm:py-4 px-3 sm:px-4">
        <EngineLab />
      </main>

      <Toaster />
    </div>
  );
}
