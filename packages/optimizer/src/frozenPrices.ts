// Node-only, test-facing: the frozen price sheet. Beside loadPrices.ts because it is the same kind of
// thing — a loader the bundle never sees.

import { join } from 'node:path';
import { loadPrices } from './loadPrices.ts';
import type { Prices } from './cost.ts';

/**

 * The shipped sheet as it stood on 2026-08-22, snapshotted 2026-09-01 and never refreshed.
 *
 * **Use this in any test that asserts an EXACT number derived from prices.** Those tests pin the
 * model's arithmetic — that lattice reduction is cost-invariant to fifteen figures, that the unit
 * ladder picks the unit a player can read, that the budget bracket is tighter than the prices are
 * known — and not one of them is a claim about the market. Reading the live sheet made them fail
 * whenever poe.ninja moved, which since the refresh was automated is potentially every day: the
 * 2026-09-01 refresh moved 18 currency prices and broke 8 assertions across 3 files, none of which
 * described a defect.
 *
 * It is deliberately the sheet those expected numbers were DERIVED from rather than the newest one.
 * Freezing a newer sheet and updating the expectations to match would re-baseline them to whatever
 * came out — which is the very thing a pinned number exists to prevent.
 *
 * **Keep reading the LIVE sheet** where the sheet itself is the subject: `priceResolution.test.ts`
 * and `costConsistency.test.ts` exist to check that what ships resolves and stays consistent, and
 * they are what the refresh workflow runs as its guard. Freezing those would be freezing the guard.
 */
export const FROZEN_PATCH_DIR = join(import.meta.dirname, '__fixtures__', 'frozen-patch');

export const loadFrozenPrices = (): Prices => loadPrices(FROZEN_PATCH_DIR);
