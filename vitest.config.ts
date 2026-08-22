import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    // Vitest's 5s default is too tight for this suite. Several tests do real work rather than
    // mocking it — 100k-run Monte-Carlo policy simulations, value iteration over the full MDP
    // lattice, budget CDFs over real 0.5.0 data — and legitimately take 2-4s locally. CI runners
    // are slower still, which is exactly how `a bigger budget never lowers the odds of the same
    // item` (2.7s here) blew the 5s default on GitHub Actions. 30s leaves headroom for a slow
    // runner while still failing a genuine hang rather than waiting forever.
    testTimeout: 30_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
