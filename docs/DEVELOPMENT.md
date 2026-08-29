# Development Guide - POE2 How To Craft

> **Architecture note:** POE2 HTC used to be a React frontend talking to a Java/Maven REST backend
> over `localhost:8080`. That backend has been **retired** — the app is now a single
> **pure-TypeScript engine that runs client-side** (in the browser). There is no
> server to start, no Java, no Maven. This guide describes the current architecture.

## Table of Contents

1. [Project Architecture](#project-architecture)
2. [Development Setup](#development-setup)
3. [The Engine (`packages/engine`)](#the-engine-packagesengine)
4. [The Optimizer (`packages/optimizer`)](#the-optimizer-packagesoptimizer)
5. [The App (`src/`)](#the-app-src)
6. [Data (`data/patches/`)](#data-datapatches)
7. [Building and Packaging](#building-and-packaging)
8. [Testing](#testing)
9. [Code Style and Conventions](#code-style-and-conventions)
10. [Troubleshooting](#troubleshooting)

---

## Project Architecture

### Technology Stack

- **React 19** + **TypeScript 5.6** — UI
- **Vite 7** — build tool and dev server
- **TailwindCSS** + **shadcn/ui** (Radix) — styling and components
- **Vitest 4** — test runner (unit + differential + Monte-Carlo validation)
- **Sentry** + **Vercel Analytics** — telemetry

There is no backend runtime. The crafting logic is plain TypeScript compiled into the same bundle as
the UI.

### Layers

```
┌──────────────────────────────────────────────────────────────┐
│  src/  — React app (Vite)                                     │
│    App.tsx → features/engine/EngineLab.tsx (the only view)    │
│    lib/engine.ts — the browser facade over the engine         │
└───────────────────────────┬──────────────────────────────────┘
                            │ imports (plain function calls, no HTTP)
             ┌──────────────┴───────────────┐
             ▼                              ▼
┌──────────────────────────┐   ┌───────────────────────────────┐
│  packages/engine  (pure) │   │  packages/optimizer           │
│  weight-pool probability │◄──│  Pareto (cost ↔ success)      │
│  per currency; apply/    │   │  search + expected-cost model │
│  evaluate a plan         │   │  + Monte-Carlo self-check     │
└────────────┬─────────────┘   └───────────────────────────────┘
             │ reads
             ▼
┌──────────────────────────────────────────────────────────────┐
│  data/patches/<patch>/*.json  — mods, base_items, prices,     │
│  weights_overrides, currencies, essences  (app ships 0.5.0)   │
└──────────────────────────────────────────────────────────────┘
```

`packages/engine` has **no I/O and no DOM dependency** — it takes indexed patch data in and returns
probabilities/plan results out. `packages/optimizer` layers cost and search on top. `src/lib/engine.ts`
is the only place that fetches JSON and wires those packages to the UI.

### Project Structure

```
POE2_HTC/
├── src/                              # React app (Vite)
│   ├── App.tsx                       # Root — header + <EngineLab/>
│   ├── main.tsx                      # React entry point
│   ├── features/engine/              # The Engine Lab (the only view)
│   │   ├── EngineLab.tsx             # plan | item mode toggle
│   │   ├── ItemActions.tsx           # "I have an item" — per-currency odds + from-item planner
│   │   └── FrontierView.tsx          # renders a cost/success Pareto frontier
│   ├── lib/engine.ts                 # Browser facade: loadEngine, listBases, listMods,
│   │                                 #   optimize, currencyActions, optimizeItem
│   ├── components/                   # shadcn/ui kit + UpdateNotification, Toaster
│   └── test/setup.ts                 # vitest setup (jsdom matchers)
│
├── packages/
│   ├── engine/src/                   # Pure-TS crafting engine (no I/O, no DOM)
│   │   ├── types.ts                  # Mod, Tier, ItemBase, ItemState, CurrencyTier, …
│   │   ├── loadPatch.ts / indexPatch.ts  # parse + index data/patches JSON
│   │   ├── pool.ts / item.ts         # affix pools, family exclusion, item state
│   │   ├── probability.ts            # exact per-currency probability math
│   │   ├── plan.ts                   # evaluatePlan / evaluatePlanFrom (a sequence of steps)
│   │   ├── __fixtures__/*-java.json  # frozen golden fixtures (differential anchor)
│   │   └── *.test.ts                 # unit + differential tests
│   └── optimizer/src/                # Cost + search on top of the engine
│       ├── optimize.ts               # optimizePareto, optimizePlan, sequence generation
│       ├── fromItem.ts               # optimizeFromItem — transform an item you already hold
│       ├── alternatives.ts           # budget-constrained near-miss targets
│       ├── combinatorics.ts          # permutations / combinations helpers
│       ├── markovFromItem.ts         # the from-item MDP: orchestration + value iteration
│       ├── markovState.ts            #   …what a crafting state IS (present/blocked/junk)
│       ├── markovActions.ts          #   …what you can DO from one, and where it lands
│       ├── cost.ts                   # expected-cost model (restart-on-failure)
│       ├── loadPrices.ts             # index prices.json
│       ├── simulate.ts               # Monte-Carlo validator
│       ├── validate.ts               # plan/target validation
│       └── *.test.ts
│
├── data/patches/                     # Versioned game data (JSON)
│   ├── 0.5.0/                        # SHIPPED — poe2db, cross-checked vs Craft of Exile
│   └── 0.5/                          # Java-era snapshot — kept ONLY as the differential anchor
│
├── tools/refresh/                    # `npm run update-data` — refresh 0.5.0 from poe2db
├── scripts/coe-*.mts                 # Craft of Exile cross-validation harness
├── docs/                             # This documentation
├── package.json                      # scripts + deps (no pom.xml — Maven is gone)
├── vite.config.ts / vitest.config.ts
└── tsconfig*.json
```

---

## Development Setup

### Prerequisites

- **Node.js 20+** (LTS recommended)
- **npm 9+**
- **Git**

That's the whole list. No JDK, no Maven — the backend they were for is gone.

### Installation

```bash
git clone https://github.com/Dboire9/POE2_HTC.git
cd POE2_HTC
npm install --legacy-peer-deps
```

**Why `--legacy-peer-deps`?** React 19 trips some libraries' peer-dependency ranges; the flag lets
the install proceed. Everything works despite the warnings. It's also recorded in `.npmrc`, so a
plain `npm install` (or `npm ci`) behaves the same — the flag above is belt-and-braces.

**`package-lock.json` is committed.** Prefer `npm ci`, which installs exactly that tree: it's what
CI runs, so your machine and CI resolve identically, and a clean `npm audit` can't quietly drift on
the next install.

### Running

```bash
# Web app with hot reload — http://localhost:5173
npm run dev

# Type-check the whole project without emitting
npm run type-check

# Tests (watch mode)
npm test
```

---

## The Engine (`packages/engine`)

Pure TypeScript, no I/O, no DOM. Given indexed patch data and an item state, it computes the **exact**
probability of each currency outcome and of a whole plan.

- **Data in:** `loadPatch(dir)` (Node/test) or `indexPatch(mods, bases)` (from already-fetched JSON)
  build a `PatchData` (maps of mods and bases with pools resolved).
- **Item state:** `ItemState` (`item.ts`) — base, item level, and the placed prefixes/suffixes.
  `whiteItem(base, level)` starts empty; `withAffix(...)` places a mod.
- **Probability (`probability.ts`):** one function per mechanic, each returning an exact `f64` in
  `[0,1]` — `transmuteProbability`, `augmentationProbability`, `regalProbability`,
  `exaltProbability`, `annulProbability`, `chaosProbability`, `alchemyProbability`,
  `essenceForcedProbability`, `perfectEssenceProbability`, `desecrationProbability`, … These honor
  family exclusion, item-level gates, currency tier floors (base/greater/perfect → 0/35/50), and
  Exaltation omens (Sinistral = prefix, Dextral = suffix).
- **Plans (`plan.ts`):** a plan is a list of `PlanStep`s. `evaluatePlan(data, base, level, steps)`
  and `evaluatePlanFrom(data, startState, steps)` walk the steps, multiplying per-step probabilities
  and threading item state through, returning per-step and overall success.

### Adding or changing a currency mechanic

1. Add the exact math in `probability.ts` (and its options type), returning a probability in `[0,1]`.
2. Teach `plan.ts` how that step transitions item state (`applyStep`) and gates (`stepProbability`).
3. Add a **unit test** on a tiny synthetic pool (3–5 fake mods) with a **hand-computed** expected
   probability — this is the project's core testing discipline.
4. If it corresponds to a Java-era mechanic, keep the differential fixture test green (see Testing).

**Never encode mod data in source.** All weights/tiers/pools come from `data/patches/`. If a
probability looks wrong, the fix is almost always in the data (or `weights_overrides.json`), not the
engine.

---

## The Optimizer (`packages/optimizer`)

Layers cost and search on top of the engine.

- **`optimizePareto(data, prices, base, targets, opts)`** — the main entry for crafting **from a
  white base**. Generates candidate sequences to reach the target mods/tiers and returns the
  **Pareto frontier**: the plans where no other plan is both cheaper and likelier.
- **`fromItem.ts`** — `optimizeFromItem`, the same idea starting from an item you already hold
  (reached as `optimizeItem` in the facade): every mod not in the target is junk to remove, every
  target not present must be added.
- **`alternatives.ts`** — "you can't afford the exact target; what's the closest thing you can?"
  Trades closeness against P(finish within budget).
- **`cost.ts`** — the expected-cost model. Currencies that can fail and force a restart use the
  restart-on-first-failure expectation `E = (Σ cₖ·S_{k-1}) / Sₙ`; prices come from `prices.json` in
  exalt-equivalents. `combinatorics.ts` holds the ordering helpers the searches share.
- **`simulate.ts`** — a seeded Monte-Carlo simulator (`mulberry32`) used **only to validate** the
  analytic numbers, never in the hot path.
- **`validate.ts`** — rejects malformed targets (0 or >6 mods, >3 per side, off-pool mods, etc.).

### The from-item MDP (`markovFromItem.ts` + `markovState.ts` + `markovActions.ts`)

A **different model**, not another search variant, and worth understanding before touching it. The
planners above use a restart cost model: on a miss they assume you go back to your starting item, for
free. That's a fiction — a real annul removes a *uniformly-random* mod, so a miss leaves you in a
**worse** state you have to dig out of in place, and reproducing an expensive item is never free.

The MDP models that actual stochastic process: states are item configurations, transitions come from
the real pool weights, and value iteration solves for the minimum **expected cost** together with an
**optimal policy** — what to use in each state, including how to recover from a bricked one. It
"pushes forward" and never restarts. The result also carries the reachable policy graph the UI draws.

The three modules split by concern: `markovState.ts` owns what a state *is* (which targets are
present, which are blocked by an off-tier roll, how much junk sits on each side) and how it's keyed;
`markovActions.ts` owns what you can *do* from a state, what it costs, and the resulting distribution
over next states; `markovFromItem.ts` is orchestration — resolve targets, enumerate the lattice, run
value iteration, walk the policy into a graph. The facade reaches it via `optimizeItemMarkov`, which
falls back to the linear frontier for targets the MDP doesn't model.

See [validation.md](validation.md) for the scope, the documented approximations, and the validation
history — this section deliberately doesn't duplicate them.

### Optimizer self-check

A recommended plan's analytic success % and expected cost must match a 100k-run Monte-Carlo of the
same plan within tolerance (see `optimize.test.ts` / `validate.test.ts`). Keep that green.

---

## The App (`src/`)

The UI is a single view, the **Engine Lab** (`src/features/engine/`), talking to the engine through
the facade `src/lib/engine.ts`:

- `loadEngine()` — fetches the shipped patch JSON (`data/patches/0.5.0/*.json?url`) once and indexes it.
- `listBases(data)` / `listMods(data, baseId)` — populate the pickers.
- `optimize(eng, baseId, level, targets)` — from-white Pareto frontier for chosen mods/tiers.
- `currencyActions(eng, item, …)` — "I have this item; what does each currency do, at what per-use odds?"
- `optimizeItem(eng, item, targets)` — the from-item planner (reset-to-your-item cost model).

`EngineLab.tsx` toggles between the from-white **plan** mode and the **item** mode
(`ItemActions.tsx`); both render results through `FrontierView.tsx`.

---

## Data (`data/patches/`)

Game data lives in versioned JSON, never in source. See [data-layer.md](data-layer.md) for the full
description. In short:

- **`0.5.0/`** is what the app ships — poe2db-sourced, cross-checked exact against Craft of Exile.
- **`0.5/`** is the frozen Java-era snapshot, retained **only** as the engine's differential anchor.
- Refresh 0.5.0 from poe2db with `npm run update-data` (pipeline under `tools/refresh/`).
- `weights_overrides.json` (community-verified) always wins over base weights. Data edits need a
  source comment.

---

## Building and Packaging

```bash
# Web build → dist/
npm run build

```

`dist/` is the whole deliverable — a static site. There is no desktop packaging step, and no JRE or
`backend.jar` to ship.

### Error reporting (Sentry)

**Sentry is OFF unless `VITE_SENTRY_DSN` is set AT BUILD TIME**, and the production build runs on
Vercel — so a local `.env` does not reach the deployed site. Set it in **Vercel → Settings →
Environment Variables**, then **redeploy**; setting it after a deploy changes nothing until the next
build.

[`.env.example`](../.env.example) is the canonical explanation of the variable (including why a DSN is
not a secret). What belongs here is how to *check* it, because the failure mode is silent — Vite inlines
`import.meta.env.*` as a literal, so with the variable unset the init in `src/lib/sentry.ts` is provably
dead and Rollup deletes it. The build succeeds, the site works, and nothing reports anywhere.

Two things make that visible:

- `npm run build` prints a warning when the variable is unset (`warnIfUnmonitored`, `vite.config.ts`).
- The bundle changes shape. Measured 2026-08-29:

  | build | entry chunk | Sentry chunk |
  |---|---|---|
  | no DSN | 374.07 kB (gzip 113.75) | — |
  | DSN set | 375.83 kB (gzip 114.60) | 479.24 kB (gzip 158.85), separate |

  The entry chunk barely moves because the SDK is a **dynamic** import; a static one took it to 202 kB
  gzip. If you ever see Sentry inside the entry chunk, that import got flattened.

**Source maps ship, and are served publicly.** Without them a Sentry issue reads
`index-R5rPqtGC.js:1:284729` inside a function called `Xe`. `build.sourcemap` is `true`, which costs
~2.2 MB of deploy size and **nothing** in page weight — a browser fetches a `.map` only with devtools
open. Public is fine because this repo is public and AGPL-3.0, so a map reveals nothing GitHub does not.
If it ever goes private, switch to `'hidden'` plus `@sentry/vite-plugin` and upload them instead; that
needs a `SENTRY_AUTH_TOKEN`, which unlike a DSN **is** a real secret.

**Worker errors are reported from the main thread, and the worker carries no SDK.** The solver runs in
a Web Worker — where all the hard code lives — and a crash there used to be a progress bar that simply
stopped. Rather than pay 158 kB gzip to put the SDK on a thread that exists to stay light (and is
respawned on every cancel), `engine.worker.ts` sends the stack across its existing error channel and
`engineClient.ts` reports it, tagged `origin: worker-solve` or `worker-fatal`. Nothing extra is
downloaded.

**Measure a bundle in the configuration it actually ships in.** A build with no DSN has Sentry compiled
out, so profiling one and concluding "Sentry is only 6.9% of the bundle" measures the leftovers rather
than the SDK — which is exactly the mistake corrected in TODO 6.

### Release process

1. Bump `version` in `package.json` (there is no `pom.xml`).
2. Update [`docs/CHANGELOG.md`](CHANGELOG.md).
3. `npm run type-check && npm test && npm run build`.
4. Tag and push (`git tag vX.Y.Z && git push origin vX.Y.Z`); CI builds and publishes the release.

---

## Testing

Everything runs under **Vitest**:

```bash
npm test                 # watch mode
npm run test:engine      # vitest run packages/engine
npm run test:optimizer   # vitest run packages/optimizer
npm run test:coverage
```

Test categories:

- **Unit tests** — one per currency rule on a tiny synthetic pool (3–5 fake mods) with a
  hand-computed expected probability. This is the backbone; prefer it over integration tests.
- **Differential tests** (`*.differential.test.ts`) — the ported mechanics are anchored to frozen
  golden fixtures in `packages/engine/src/__fixtures__/*-java.json` (originally generated by the old
  Java engine, now frozen — **no live Java is involved**). Keep them green; a divergence means
  investigate, don't average.
- **Monte-Carlo validation** — chaos/alchemy/existing-item flows (which have no Java counterpart) and
  the optimizer's recommended plans are validated by simulation and cross-checked against
  craftofexile.com. Log divergences in [validation.md](validation.md).
- **Data-integrity guardrail** (`dataIntegrity.test.ts`) — invariants over every shipped patch
  (orphan refs, dupes, tier/ilvl/weight sanity, type-vs-side, family exclusion), with a per-patch
  baseline so any new violation fails.

---

## Code Style and Conventions

- **Strict TypeScript**, no `any` in `packages/engine` or `packages/optimizer`
  (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess` are on).
- Probabilities are `f64` in `[0,1]` **internally**; format as `%` only at the UI edge.
- Prices are in **exalt-equivalents**.
- Components: PascalCase; hooks: `useX` camelCase; constants: `UPPER_SNAKE_CASE`.
- Functional React components, Tailwind for styling (avoid inline styles).
- Data edits are surgical raw-text edits to the JSON (preserve integer-vs-decimal ranges); they carry
  a source comment, and `weights_overrides.json` beats base weights — never "fix" a probability by
  editing engine logic when the weight data is the problem.

---

## Troubleshooting

**`npm install` fails with peer-dependency errors**
```bash
npm install --legacy-peer-deps
```

**Vite dev server won't start (port in use)**
```bash
lsof -i :5173        # macOS/Linux
netstat -ano | findstr :5173   # Windows
npm run dev -- --port 3000
```

**A probability looks wrong**
Check the data first — `data/patches/<patch>/mods.json` and `weights_overrides.json` — and the
family/ilvl gates, before suspecting the engine. Cross-check against
[craftofexile.com/?game=poe2](https://craftofexile.com/?game=poe2) and the `scripts/coe-*` harness.

**Tests fail with "module not found"**
```bash
rm -rf node_modules/.vite && npm install --legacy-peer-deps
```

**TypeScript errors in the IDE but the build is fine**
Restart the TS server (VS Code: `Cmd/Ctrl+Shift+P → "TypeScript: Restart TS Server"`), then
`npm run type-check`.

---

## Additional Resources

- [Algorithm Deep Dive](ALGORITHM.md) — how the analytic + Pareto engine works
- [Data layer](data-layer.md) — the versioned JSON data and refresh pipeline
- [Engine API examples](API_EXAMPLES.md) — calling the engine/optimizer/facade from code
- [Contributing](CONTRIBUTING.md) — contribution workflow
- [Validation log](validation.md) — Craft of Exile cross-checks and Monte-Carlo results
