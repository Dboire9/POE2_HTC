import { defineConfig, devices } from '@playwright/test';

/**
 * Browser smoke tests. Five of them, deliberately.
 *
 * The unit suite is 1,264 tests and all of them run under jsdom, which has no layout engine, no Web
 * Worker, no real `fetch` and no CSP enforcement. Every solve in this app happens in a Worker, behind
 * a CSP, after a 3.1 MB preload — so the entire class of failure that ships as "the page loads and
 * nothing happens" was invisible to the whole suite.
 *
 * These do not check that a number is RIGHT; the unit suite does that, and does it far better than a
 * browser could. They check that a number APPEARS.
 *
 * Served from `dist/` by e2e/serve-dist.mjs rather than by `vite preview`, because preview does not
 * read vercel.json and therefore serves no CSP — a suite behind it would pass on exactly the deploy
 * that breaks. See that file.
 */
export default defineConfig({
  testDir: './e2e',
  // A cold solve is genuinely slow: the preload, then the Worker, then policy iteration.
  timeout: 90_000,
  expect: { timeout: 30_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node e2e/serve-dist.mjs',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
