# POE2_HTC — Path of Exile 2 crafting planner

A React web app (poe2htc.com). A player picks an item base and the modifiers they want; the app prices
the cheapest way to craft it — step routes with their odds, and the true expected cost of playing the
craft optimally (an MDP). It also plans from an item the player already holds, reads streamers' gear and
prices Precursor Tablets. Everything runs in the browser on a pure-TypeScript engine; the only server
code is one function, `api/feedback.ts`.

> **This file is the canonical project instructions**, version-controlled here; `../CLAUDE.md` is a stub
> pointing at it. It holds the rules, one line each. **The reasons — the bug, the measurement, the design
> that was built and reverted — are in `docs/engineering-notes.md`, by area. Read that area's section
> before changing code in it** (the table at the end says which).

## Layout

- `src/` — React 19 + Vite + Tailwind. One view, `EngineLab` (`src/features/engine/`), with four tabs:
  **Plan from scratch** (from a white base), **I have an item**, **Tablets** (`src/features/tablets/`) and
  **Streamer gear** (beta). `src/lib/engine.ts` is the browser facade over the engine. `EngineLab` is the
  shell and holds the Plan tab's state through `useLabCraft` (it never unmounts, so the Lab keeps its
  result across tab switches); the Item tab is `ItemActions` + `useItemCraft`. Every tab loads the engine
  with `useEngine` and runs solves with `useSolveRunner`; both gear tabs draw a true cost in `TrueCostCard`,
  which also hosts what a craft can cost (`CostSpread.tsx`, "Play it out"), the Plan tab's Craft to sell
  and Craft along (`CraftAlong.tsx`: the solved plan read one move at a time). The profit tools — verdict,
  run plan, breakdown, risk chart, price box — live in `src/features/profit/`, shared with the Tablets tab.
- `packages/engine` — the game rules: pools, weights, probabilities, item state. Pure TS, no I/O, no DOM.
- `packages/optimizer` — the planners. Step routes: `optimize.ts` (from white), `fromItem.ts`,
  `alternatives.ts`. True expected cost: `markovFromItem.ts` and the other `markov*.ts`. Pricing: `cost.ts`.
- **Every solve runs in a Web Worker**: `src/lib/solve.ts` (pure request → result; test here) →
  `engine.worker.ts` (thin adapter) → `engineClient.ts` (cancel = terminate + respawn). The main thread
  keeps its own copy of the data for the mod lists it filters as you type — keep that duplication.
- `data/patches/0.5.0/` — the shipped game data (RePoE + poe2db, cross-checked exact against Craft of
  Exile) and `prices.json` (poe.ninja, refreshed daily by a bot). `data/patches/0.5/` is the frozen
  Java-era anchor for the differential tests and nothing else. `data/tablets/` — tablet weights, the
  curated watch list, tablet trade ids. `data/trade/` — gear trade ids. `data/streamers/` — streamer gear.
- `tools/refresh/` — the data pipeline (`run.sh` → `refresh.mjs` → `apply_*.mjs`; `prices.mjs`).
  `tools/streamers/` — the streamer gear job. `scripts/` — measurement harnesses (`coe-*`, `policy-vs-mc`).
- `docs/` — for players: `USER_GUIDE.md`, `CHANGELOG.md`, `WHATS-NEW.md`. For contributors:
  `engineering-notes.md` (why), `validation.md` (every measurement and divergence), `copy-audit.md`
  (every claim the UI makes and what enforces it), `DEVELOPMENT.md`. Backlog: `TODO.md`.

## Commands

- `npm run dev` · `npm run build` (the static site, into `dist/`) · `npm run preview`
- `npm run update-data` (game data, via `tools/refresh/run.sh`) · `npm run update-prices` (poe.ninja) ·
  `npm run update-streamers`
- `npm run test:engine` / `npm run test:optimizer` — scoped test runs.

## Verify — every step, by exit code

```bash
npm run lint && npm run type-check && npm run type-check:engine && npm run type-check:optimizer \
  && npm test -- --run && npm run build && npm run test:e2e
```

- **Judge each step by its exit code.** Never pipe a step through `| tail` or `| head` inside a chain —
  the pipe returns the last command's status, and a lint failure reached CI that way. Gate a commit on
  the chain with `&&`. Report a failure with its output.
- **Three type-checks, not one**: the package tsconfigs enable `exactOptionalPropertyTypes`; the root
  one does not.
- **Never clear lint with a blanket `--fix`** — it once deleted parameter defaults `markovSymmetry.ts`
  depends on. Use a targeted `eslint-disable-next-line` with its reason.
- `test:e2e` is the only run in a real browser (Playwright/Chromium against `dist/`; run
  `npx playwright install chromium` once). If it was skipped, say so.
- Some solve tests take minutes on a loaded machine (their timeouts are 300 s): a timeout there is load
  until a re-run says otherwise.
- Visual checks happen in the maintainer's browser (the beta preview sits behind Vercel's login): say
  what changed on screen instead of claiming a visual pass.

## Branches and shipping

- **Work lands on `beta`; production is `main`.** Commit, push `beta`, check CI. **`main` moves only when
  the maintainer says so** — then fast-forward it to `beta`. Vercel builds every branch, so `beta` has its
  own preview.
- **Never force-push.** The daily price bot merges straight to `main`, so `main` is often ahead of `beta`:
  merge `main` into `beta`, then push. A direct push to `main` prints `remote: Bypassed rule
  violations` — expected.
- Check CI through the public API: `https://api.github.com/repos/Dboire9/POE2_HTC/commits/<sha>/check-runs`
  (and `…/status` for Vercel). Unauthenticated calls are limited to 60 an hour — poll 45 s or more apart.
- `git add -A` sweeps in everything on disk: read `git diff --cached` before committing.
- A commit message says what changed for the player. Releases: tag `vX.Y.Z` on `main`;
  `build-release.yml` publishes the release page from `docs/CHANGELOG.md`.
- Branches `C` (abandoned C/WASM engine) and `static` hold history found nowhere else — never delete
  either without asking.

## Writing: UI copy, docs, comments, commit messages

- **Never state a game rule you haven't traced to the code or data that enforces it — and never call
  something a planner limit without tracing that either.** If you can't settle it, say it neutrally.
  Both have shipped: a legal filler → annul → desecrate route called impossible, and a real game rule
  presented as a planner limit. Every such claim has a row in `docs/copy-audit.md`; add one with yours.
- **A route says "most likely lands X", never "add X"** — the player chooses the orb, never the outcome.
- **A number the app can't know exactly says so on screen**: an assumed weight, an inferred price, a
  bound instead of an exact cost. Silence reads as a claim of exactness.
- **No personal names in anything committed** — docs, comments, data files, UI copy, commit messages. A
  decision is "the maintainer's call", a report is "a player's", or give just the date. Data a
  third party shared is credited by name where it is shown (Morce Faster's tablet odds; Exiled Exchange 2's
  trade ids; poe.ninja, RePoE, poe2db, Craft of Exile).
- Dates are absolute (`2026-09-24`), never "yesterday" or "last week".

## Code rules

- **Data lives in JSON, never in source.** A wrong probability is fixed in the data or its generator
  (`tools/refresh/`), never in engine logic. A number that is a judgement rather than data (an assumed
  weight) sits in its generator with its source written beside it, and the app discloses it.
  `weights_overrides.json` is an empty stub nothing reads.
- **PoE2 semantics only**: no scouring, no alteration spam. Chaos removes one modifier and adds one.
  Family exclusion and item-level gates apply everywhere; fractured modifiers are never removed.
- **Analytic first**: exact weight-pool math; Monte Carlo only to validate.
- Strict TypeScript, no `any` in `packages/`. Probabilities are f64 in [0,1], formatted at the UI edge.
  Costs are exalt-equivalents, formatted only by `src/lib/currency.ts` (`pickUnit`: one unit per view).
- **A step has one price.** Every planner prices through `stepCost` / `currencyKey` /
  `cheapestEssenceLevel` (`cost.ts`). Pricing a step two ways is how the D8 desecration bug survived.
- **A missing price is 0 — a free orb that wins every plan.** Gate any new currency, omen or rune on
  having a price, and show an unpriced one with no price, never "0 ex".
- **Read `bound`, never infer it from `converged`.** A from-item solve truncates upward (≥), a from-white
  one downward (≤); `formatBoundedCost` is the only renderer. Tables are drawn only when
  `bound === 'exact'`.
- **Ask the engine, not a constant**: capacity `limitsOf(base)` (never 3/3/1), the essence count
  `isEssenceMod`, exclusion `familiesOf`, a base's prices `pricesForBase`.
- **A share link (`?s=`) is untrusted input.** It decodes through `WireIn`, one `clamp*` per field; a bad
  link decodes to `null` and never throws.
- **The site redeploys daily** (the price refresh renames every hashed asset), so an open tab goes stale:
  a new lazy fetch or chunk routes its failure through `failureOf` / `servesNewerBuild`.
- **Solvers report progress only when the displayed value changes** — a `postMessage` per sweep once
  turned a 24 s solve into a ten-minute wait.
- **Reset where the user acts, not in an effect**: `changeBase` on the picker, never
  `useOnChange(baseId)` — imports and share links move the base too, and were wiped by it.
- Price boxes are `type="text"` read by `parsePrice` (Chrome's number box turns "0,5" into 5). Every
  `localStorage` read and write sits in try/catch.
- An `aria-label` replaces the visible label, so it must contain the visible words.
- `vercel.json` takes no comments (its schema rejects unknown keys). The CSP is a response header there,
  never a `<meta>` tag.
- **Prices come from poe.ninja**, never poe2db. **The trade site is links only**: `tradeUrl` builds a
  search the player opens; nothing fetches pathofexile.com (GGG ToS §7(c)/(f)).
- **Secrets**: the app's Sentry DSN (`VITE_SENTRY_DSN`) is public by design. The feedback inbox's
  (`FEEDBACK_SENTRY_DSN`) is server-only — never `VITE_`, never in the repo or `.env`.
- **Keep files under ~1,000 lines.** `markovFromItem.ts` (~1,700) is already past it: new solver code goes
  in a module of its own and only its wiring goes there. A new panel on the gear tabs goes in
  `TrueCostCard` or its own component, never back into the tab shells.

## Tests

- **Mutation-check every regression test**: undo the fix and watch it fail. Several tests here passed
  against the bug they were written for, with a plausible reason attached.
- **An exact-cost assertion reads `loadFrozenPrices()`**, never the shipped sheet, which changes daily.
  Everything else reads what ships — the price bot runs the whole suite as its guard.
- **Code the browser runs is tested on `loadShippedPatch`** — the shipped mods file has no `tiers[].stats`.
- **Never regenerate a golden fixture to turn a test green** (`__fixtures__/*-java.json`,
  `pre-throwaway-frontiers.json`, `pre-sibling-markov.json`) — only for a change meant to move those
  crafts, and say so.
- A synthetic fixture prices every currency the policy might reach (missing = free).
- React: `waitFor` after a click; never assert on a mock in the same tick.
- An MDP test that walks `r.nodes` guards the policy's path, not the state space.
- Timing: interleave the runs and take medians — single runs spread ~40%. Monte Carlo against V: read
  the sign across seeds, never the z of one.
- `e2e/` asserts that a cost appears, never its value.

## Decided — don't re-propose or rebuild

Each was built or weighed, measured and turned down; the notes say why.

- Splitting `mods.json` into solver and display files (TODO 13): the worker reads both halves, and two
  files are bigger on the wire.
- A load-time `weights_overrides.json`: never built; nothing reads the stub.
- A Whittling on/off toggle, or any currency excluded by default.
- The Omen of Greater Exaltation as an MDP action, or a Chaos strength axis in the MDP: slower, and no
  answer moved (re-measure only if prices move a lot).
- `heuristicSeed` on by default (1.7x slower on big crafts), or a looser VI tolerance (answers move).
- Converging big routes in `routeFrom` (TODO 22): nothing drawn changes. A worker "session" for routes:
  a cancel terminates it.
- Re-sorting a table while a price is typed into it.
- Charms and Jewels as craftable bases: their caps are untraced and Jewels roll differently.
- A desktop (Electron) build: Chromium blocks module Workers from `file://`.
- Features Exiled Exchange 2 already covers (e.g. "paste a tablet: sell or bin?").
- An Annulment Orb in a tablet plan, or a tablet finished Magic: tablets always run with four modifiers.
- BotID Deep Analysis: it needs a CSP change first.

## Where the reasons are — `docs/engineering-notes.md`

| Before touching… | read the section |
|---|---|
| omens, orb strengths, Whittling, Greater Exaltation (`probability.ts`) | Game mechanics: orbs and omens |
| Desecration, bones, boss omens, the carved flag | Game mechanics: desecration and bones |
| Essences, Perfect Essences, throwaway steps | Game mechanics: essences |
| item limits, crafted modifiers, runes | Game mechanics: what an item can hold |
| `tools/refresh/`, `shipMods.ts`, `vite.config.ts`, tablet data, display units | Data pipeline and what ships |
| pastes, profiles, `resolveMods`, the Streamer gear tab | Reading real items |
| `markov*.ts` — the model, its speed, how results are read | The MDP solver |
| `optimize.ts`, `fromItem.ts`, `alternatives.ts`, `leverDp.ts` | The step planners |
| `prices.json`, `prices.mjs`, `cost.ts`, the price bot | Prices |
| `src/` panels, Search effort, trade links | The app |
| `src/features/tablets/`, `src/lib/tablet*.ts` | Tablets |
| `vercel.json`, the CSP, Sentry, `api/feedback.ts`, the daily deploy, `e2e/` | Deploy, monitoring and security |
| `markovReplay.ts`, `scripts/policy-vs-mc.mts`, timings | Testing and measuring |

**Keeping this useful**: learn something the hard way → the rule goes here in one line, the story in the
notes under its area. When a rule stops being true, delete it — a stale rule is worse than none.
