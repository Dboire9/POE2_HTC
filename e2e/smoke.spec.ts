import { test, expect, type ConsoleMessage, type Locator, type Page } from '@playwright/test';

/**
 * Five smoke tests. See playwright.config.ts for why they exist and what they deliberately do NOT
 * assert: never a cost VALUE. Those move with the price sheet — which now refreshes daily — and with
 * every solver improvement. A smoke test that pinned one would fail for reasons that are not defects,
 * which is exactly the mistake that broke the price-refresh automation on its first run.
 */

/** Console errors and uncaught exceptions, collected for the life of a page. */
function watchForErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m: ConsoleMessage) => {
    if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

/**
 * A CSP refusal surfaces as a console error naming the directive, so `watchForErrors` sees it — but
 * only if it is not filtered out as noise. Nothing here is filtered, on purpose: an app that runs its
 * solver in a Worker behind `worker-src 'self'` has no console errors it is entitled to.
 */
const cspish = (e: string) => /Content Security Policy|Refused to/i.test(e);

/** Wait until the engine data has loaded and the Lab is usable. */
async function waitForReady(page: Page) {
  await expect(page.getByRole('combobox', { name: /base/i }).first()).toBeEnabled({ timeout: 60_000 });
}

/**
 * Add the first offered mod, at whatever tier it defaults to.
 *
 * Scoped to a container because the Item tab shows TWO pickers — the item you hold and the target you
 * want — and both label their buttons "Add …". An unscoped `.first()` always hit the item builder, so
 * `Compute plan` stayed disabled on "Pick at least one target mod above" and the test failed on a
 * precondition rather than on anything it meant to check.
 */
async function addFirstMod(page: Page, within?: Locator) {
  const add = (within ?? page.locator('body')).getByRole('button', { name: /^Add / }).first();
  await expect(add).toBeVisible();
  await add.click();
}

test('1 — cold load: the page comes up with no console errors and no CSP refusals', async ({ page }) => {
  const errors = watchForErrors(page);
  const res = await page.goto('/');

  // The header the whole suite exists to exercise. `vite preview` would serve none.
  expect(res?.headers()['content-security-policy']).toContain("worker-src 'self'");

  await waitForReady(page);
  expect(errors.filter(cspish), 'CSP refusals').toEqual([]);
  expect(errors, 'console errors and uncaught exceptions').toEqual([]);
});

test('2 — lab compute: a craft solves in the Worker and renders a cost', async ({ page }) => {
  const errors = watchForErrors(page);
  await page.goto('/');
  await waitForReady(page);

  await addFirstMod(page);
  await page.getByRole('button', { name: 'Find plans' }).click();

  // The frontier renders a cost, and the plan count is a real number. Both are assertions that the
  // Worker ran at all: under a CSP that forbids it, this is where the app dies silently.
  await expect(page.getByText(/checked [\d,]+ plans?/)).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText('expected cost').first()).toBeVisible();

  const checked = await page.getByText(/checked [\d,]+ plans?/).first().innerText();
  expect(Number(checked.replace(/\D/g, ''))).toBeGreaterThan(0);

  expect(errors.filter(cspish), 'CSP refusals').toEqual([]);
});

test('3 — item compute: the from-item planner answers on a held item', async ({ page }) => {
  const errors = watchForErrors(page);
  await page.goto('/');
  await waitForReady(page);

  await page.getByRole('button', { name: 'I have an item' }).click();
  await expect(page.getByRole('button', { name: 'Full plan to a target' })).toBeVisible();
  await page.getByRole('button', { name: 'Full plan to a target' }).click();

  // Target one mod. The Item tab picks a target from a <select>, not from the "Add …" buttons the Lab
  // uses — those buttons here build the item you HOLD, which is why an unscoped click left
  // `Compute plan` disabled on "Pick at least one target mod above".
  const picker = page.getByRole('combobox', { name: /add a target mod/i });
  await expect(picker).toBeVisible();
  const firstEnabled = await picker
    .locator('option:not([disabled]):not([value=""])')
    .first()
    .getAttribute('value');
  expect(firstEnabled, 'at least one target mod is selectable').toBeTruthy();
  await picker.selectOption(firstEnabled!);

  const compute = page.getByRole('button', { name: 'Compute plan' });
  await expect(compute).toBeEnabled();
  await compute.click();

  await expect(
    page.getByText(/True expected cost|checked [\d,]+ plans?|Step-by-step routes/).first(),
  ).toBeVisible({ timeout: 60_000 });

  expect(errors.filter(cspish), 'CSP refusals').toEqual([]);
});

test('4 — share link: a workspace survives a round trip through the URL', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await waitForReady(page);

  await addFirstMod(page);
  const target = await page.getByRole('button', { name: /^Remove / }).first().getAttribute('aria-label');
  expect(target, 'a target was actually added').toBeTruthy();

  await page.getByRole('button', { name: 'Copy link' }).click();
  const url = await page.evaluate(() => navigator.clipboard.readText());
  expect(url).toContain('?s=');

  // A FRESH page, so nothing is carried by localStorage or component state — the link alone has to
  // reproduce the workspace. That is the property share links exist for.
  const fresh = await context.newPage();
  await fresh.goto(url);
  await waitForReady(fresh);
  await expect(fresh.getByRole('button', { name: target! })).toBeVisible({ timeout: 30_000 });
});

test('5 — mobile: the mod columns stack and nothing overflows sideways', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await waitForReady(page);
  await addFirstMod(page);
  await page.getByRole('button', { name: 'Find plans' }).click();
  await expect(page.getByText(/checked [\d,]+ plans?/)).toBeVisible({ timeout: 60_000 });

  // The `flex-col sm:flex-row` fix from 2026-08-22 has never been verified by anything: jsdom has no
  // layout engine, so it cannot tell a stacked column from a side-by-side one.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, 'horizontal overflow in px').toBeLessThanOrEqual(0);
});

test('6 — the user guide opens, renders, and fits a phone', async ({ page }) => {
  // The guide is 67 table rows of prose rendered from docs/USER_GUIDE.md, several of them wider than
  // a phone. It is by far the most likely thing in the app to break the no-horizontal-overflow rule,
  // and jsdom has no layout engine, so only a browser can tell.
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto('/');
  await waitForReady(page);

  await page.getByRole('button', { name: /New here/i }).click();
  await page.getByRole('button', { name: /Read the full guide/i }).click();

  // Content APPEARS — this suite never asserts a value, and the guide's text is the .md's business.
  await expect(page.getByRole('heading', { level: 1, name: /User Guide/i })).toBeVisible({ timeout: 30_000 });

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, 'horizontal overflow in px on the guide').toBeLessThanOrEqual(0);

  // Back to the app, with the lab still there — it was hidden, not torn down.
  await page.getByRole('button', { name: /Back to the app/i }).click();
  await expect(page.getByRole('button', { name: 'Find plans' })).toBeVisible();

  expect(errors, 'console errors while reading the guide').toEqual([]);
});
