import { it } from 'vitest';
import { appendFileSync, writeFileSync } from 'node:fs';
import { loadPatch } from '../../engine/src/loadPatch.ts';
import { loadPrices } from './loadPrices.ts';
import { optimizePareto } from './optimize.ts';
import { alternativesFromWhite } from './alternatives.ts';
const OUT = '/tmp/claude-0/-home-dorian-Poe2Craft/fdc9d5e5-0604-43db-aa56-93b1c998a4e9/scratchpad/eff.out';
const data = loadPatch('data/patches/0.5.0');
const prices = loadPrices('data/patches/0.5.0');
it('effort probe', () => {
  writeFileSync(OUT, '');
  const base = data.bases.get('Wands')!;
  const used = new Set<string>();
  const take = (ids: readonly string[], n: number) => {
    const o: string[] = [];
    for (const id of ids) { const m = data.mods.get(id); if (!m || m.source !== 'normal' || used.has(m.family)) continue; used.add(m.family); o.push(id); if (o.length === n) break; }
    return o;
  };
  const six = [...take(base.pools.normal.prefixes, 3), ...take(base.pools.normal.suffixes, 3)]
    .map((modId) => ({ modId, minTierIndex: 2 }));
  for (const maxPlans of [25_000, 100_000, 400_000]) {
    const t0 = Date.now();
    const r = optimizePareto(data, prices, base, six, { level: 82, maxPlans });
    appendFileSync(OUT, `pareto maxPlans=${maxPlans}: ${Date.now() - t0}ms depth=${r.currencyDepth} evaluated=${r.plansEvaluated}\n`);
  }
  for (const maxNodes of [100, 200, 600]) {
    const t0 = Date.now();
    const r = alternativesFromWhite(data, prices, base, six, 100, { level: 82, maxNodes });
    appendFileSync(OUT, `alts maxNodes=${maxNodes}: ${Date.now() - t0}ms nodes=${r.nodesEvaluated} truncated=${r.truncated} rows=${r.frontier.length}\n`);
  }
}, 1_800_000);
