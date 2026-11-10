# Engine API Examples

> **This is no longer an HTTP API.** POE2 HTC used to expose `POST http://localhost:8080/api/crafting`
> from a Java backend. That backend has been retired — crafting now runs as a **pure-TypeScript
> engine you call in-process**. This page shows how to call it: the browser **facade**
> (`src/lib/engine.ts`) for the app, and the underlying **`packages/engine` / `packages/optimizer`**
> for scripts and tests.

---

## 1. The browser facade — `src/lib/engine.ts`

This is what the UI uses. It fetches the shipped patch snapshot (`data/patches/0.5.0/*.json`) once,
indexes it, and exposes a small UI-shaped API. Everything runs client-side; there is no network call.

### Load the engine, list bases and mods

```ts
import { loadEngine, listBases, listMods } from '@/lib/engine';

const eng = await loadEngine();          // memoized — fetches + indexes the patch data once

const bases = listBases(eng.data);       // → [{ id: 'Bows', name: 'Bows', category: 'weapon' }, …]

const pools = listMods(eng.data, 'Bows');
// pools.prefixes / pools.suffixes: EngineMod[] with best-first tiers, e.g.
//   { id, text: '#% increased Physical Damage', type: 'prefix', family, source: 'normal',
//     tiers: [{ display: 1, name: 'T1', ilvl: 82, label: 'T1 · … · ilvl 82 · 165–179' }, …] }
```

### Optimize a craft (from a white base)

Pick target mods and the tier you want (`tierDisplay` is 1-based, `1` = best; the worst tier means
"any tier"). `optimize` returns the **cost ↔ success Pareto frontier**.

```ts
import { optimize, type TargetInput } from '@/lib/engine';

const targets: TargetInput[] = [
  { modId: 'Bows/LocalPhysicalDamagePercent', tierDisplay: 1 },  // T1 prefix
  { modId: 'Bows/LocalIncreasedAttackSpeed',    tierDisplay: 2 },  // T2 suffix
];

const result = optimize(eng, 'Bows', /* item level */ 82, targets);

for (const plan of result.frontier) {
  console.log(
    `${(plan.probability * 100).toFixed(3)}% success per attempt`,
    `· ${plan.perAttempt.toFixed(1)} ex per attempt`,
  );
  for (const step of plan.steps) {
    console.log(`  ${step.n}. ${step.label} → ${step.target}  (${(step.prob * 100).toFixed(2)}%)`);
  }
}
```

`EngineResult` shape:

```ts
interface EngineResult {
  frontier: EnginePlan[];   // plans where none is both cheaper AND likelier
  plansEvaluated: number;
  truncated?: boolean;      // a search cap stopped it early: more Search effort may find more
}

interface EnginePlan {
  probability: number;      // success of one attempt, f64 in [0,1]
  expected: number;         // restart-on-first-miss total — the app no longer shows it (TODO 16)
  perAttempt: number;       // cost of one attempt
  expectedAttempts: number;
  steps: EngineStep[];      // { n, currency, orb?, label, target, prob }
}
```

### The true expected cost (the MDP)

The number the app leads with. It plays the craft optimally — recovering in place after a bad roll,
choosing orb strengths and omens per state — so it is never above the step routes' totals.

```ts
import { optimizeItemMarkov, type ExistingItem } from '@/lib/engine';

// From a white base: a Normal item with nothing on it, and what another base costs, so starting over is
// one of the policy's moves.
const white: ExistingItem = { baseId: 'Bows', level: 82, rarity: 'normal', prefixes: [], suffixes: [] };
const m = optimizeItemMarkov(eng, white, targets, { restartCost: 0.5 });

if (m.applicable && m.feasible) {
  // `bound` is 'exact', or 'upper' / 'lower' when the solve stopped early — read it, never `converged`,
  // and render with `formatBoundedCost`.
  console.log(m.expectedCost, m.bound);
} else {
  console.log(m.reason);
}
```

From an item you hold, pass it instead of `white` and leave `restartCost` out (the policy then keeps the
item). `m.nodes` / `m.edges` are the policy graph the app draws.

### "I already have this item"

Two calls cover the from-item flows:

```ts
import { currencyActions, optimizeItem, type ExistingItem } from '@/lib/engine';

const item: ExistingItem = {
  baseId: 'Bows',
  level: 82,
  rarity: 'rare',                     // 'magic' | 'rare'
  prefixes: [{ modId: 'Bows/LocalPhysicalDamagePercent', tierDisplay: 2 }],
  suffixes: [{ modId: 'Bows/LocalIncreasedAttackSpeed',    tierDisplay: 3 }],
};

// Option 1 — per-USE odds: "what does each currency do to this item, right now?"
// (Honest single-orb probabilities; NOT a total budget, since chaos/annul change the item on a miss.)
// Returns a CurrencyAction[] — each with { currency, label, detail, prob, cost, feasible, reason? }.
const actions = currencyActions(eng, item, {
  addModId: 'Bows/LocalIncreasedPhysicalDamagePercentAndAccuracyRating', // a mod you'd hope to add
  removeModId: 'Bows/LocalIncreasedAttackSpeed',          // a mod chaos/annul would target
});

// Option 2 — the from-item planner: multi-step plans to reach a target, starting from THIS item
// (reset-to-your-item cost model — see docs/validation.md). For the true cost, see optimizeItemMarkov below.
const plan = optimizeItem(eng, item, targets);   // returns the same EngineResult shape as optimize()
```

---

## 2. The engine package — `packages/engine`

Pure TypeScript, no I/O, no DOM. Use it directly in Node scripts and tests. Unlike the facade (which
`fetch`es JSON), load data from disk with `loadPatch`.

```ts
import { loadPatch, whiteItem, evaluatePlan, transmuteProbability } from 'packages/engine/src/index.ts';

const data = loadPatch('data/patches/0.5.0');

// A single currency outcome — exact probability, f64 in [0,1]:
const p = transmuteProbability(data, data.bases.get('Bows')!, 'Bows/LocalPhysicalDamagePercent', { level: 82 });

// Evaluate a hand-written plan (a sequence of steps) from a white item:
const plan = evaluatePlan(data, data.bases.get('Bows')!, 82, [
  { currency: 'transmute', add: 'Bows/LocalPhysicalDamagePercent' },
  { currency: 'augment',   add: 'Bows/LocalIncreasedAttackSpeed' },
]);
console.log(plan.probability, plan.steps.map((s) => s.prob));
```

Key exports (see `packages/engine/src/index.ts`):

- **Probability (exact):** `transmuteProbability`, `augmentationProbability`, `regalProbability`,
  `exaltProbability`, `annulProbability`, `chaosProbability`, `alchemyProbability`,
  `essenceForcedProbability`, `perfectEssenceProbability`, `desecrationProbability`, …
- **Item state:** `whiteItem`, `withAffix`, `prefixCount`, `suffixCount`, `MAX_AFFIXES_PER_SIDE`.
- **Pools:** `resolveMod`, `modTierWeight`, `poolTotalWeight`, `itemFamilies`, `familyAvailable`.
- **Plans:** `evaluatePlan`, `evaluatePlanFrom` (evaluate from any `ItemState`, not just white).
- **Data:** `loadPatch`, `indexPatch`.

All of these honor family exclusion, item-level gates, currency tier floors (base/greater/perfect →
0/35/50), and Exaltation omens (Sinistral = prefix, Dextral = suffix).

---

## 3. The optimizer package — `packages/optimizer`

Search + cost on top of the engine.

```ts
import { optimizePareto } from 'packages/optimizer/src/index.ts';
import { indexPrices } from 'packages/optimizer/src/cost.ts';
import { loadPatch } from 'packages/engine/src/index.ts';
import pricesJson from 'data/patches/0.5.0/prices.json' assert { type: 'json' };

const data = loadPatch('data/patches/0.5.0');
const prices = indexPrices(pricesJson);

const res = optimizePareto(data, prices, data.bases.get('Bows')!, [
  { modId: 'Bows/LocalPhysicalDamagePercent', minTierIndex: /* engine index, 0 = worst; 7 is T1 of its 8 tiers */ 7 },
], { level: 82 });

// res.frontier — ParetoPlan[] (cost + probability + the resolved plan/steps)
```

- `optimizePareto(data, prices, base, targets, opts)` — the from-white Pareto frontier.
- `optimizeFromItem(...)` — the from-item variant (wrapped by the facade's `optimizeItem`).
- `markovFromItem(data, prices, item, targets, opts)` — the true expected cost (wrapped by the facade's
  `optimizeItemMarkov`). How it works: [ALGORITHM.md](ALGORITHM.md).
- `simulatePerStepRates(...)` — seeded Monte-Carlo validator for a plan (validation only).
- `planExpectedCost` / `stepCost` — the expected-cost model in exalt-equivalents.

> Note the two tier conventions: the **facade** takes `tierDisplay` (1-based, 1 = best), while the
> **optimizer** takes `minTierIndex` (engine order, 0 = worst). The facade converts between them
> (`toTierTargets` in `src/lib/engine.ts`).

---

## Finding modifier ids

Mod ids are `"<BaseId>/<ModKey>"`, e.g. `Bows/LocalPhysicalDamagePercent`. They live in the shipped data:

- `data/patches/0.5.0/mods.json` — every mod, its `text`, `family`, `type`, `source`, and tiers.
- `data/patches/0.5.0/base_items.json` — each base's prefix/suffix pools (lists of mod ids).

Or, at runtime, call `listMods(data, baseId)` and read `.id` / `.text` off each `EngineMod`. The
`0.5.0` snapshot uses CamelCase ids (`IncreasedMana`); the frozen `0.5` differential snapshot uses
SCREAMING_SNAKE ids (`MAXIMUM_MANA`) — the app and its tests are id-agnostic (they list ids from the
loaded data), so match whichever patch a given test loads.
