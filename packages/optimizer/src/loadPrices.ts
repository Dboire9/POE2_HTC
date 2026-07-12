// Node-only price-sheet loader. Kept out of cost.ts (which is pure) so the browser/worker can import
// the cost model and indexPrices without pulling node:fs into the bundle.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { indexPrices, type Prices } from './cost.ts';

interface PricesFile { patch: string; prices: Record<string, number>; omens?: Record<string, number>; }

/** Load prices from `data/patches/<patch>/prices.json` (Node only). */
export function loadPrices(patchDir: string): Prices {
  return indexPrices(JSON.parse(readFileSync(join(patchDir, 'prices.json'), 'utf8')) as PricesFile);
}
