# POE2_HTC — guidance for AI assistants

Path of Exile 2 crafting optimizer. React 19 + Vite + Tailwind front end, shipped as a static web app;
the crafting engine is **pure TypeScript running client-side**. There is no server, no Java, no Maven —
the original Java backend was retired.

## Layout

- `src/` — the app. One view, the Engine Lab (`src/features/engine/`), talking to the engine through
  the browser facade `src/lib/engine.ts`.
- `packages/engine/` — the crafting engine: pure, no I/O, no DOM. Probability math lives here.
- `packages/optimizer/` — cost model and search on top of it, including the from-item MDP
  (`markovFromItem.ts` + `markovState.ts` + `markovActions.ts`).
- `data/patches/<patch>/*.json` — versioned game data. The app ships `0.5.0`.

## Commands

```
npm test           # vitest, ~660 tests
npm run type-check # tsc --noEmit
npm run build      # vite build
npm run dev        # dev server
npm run build
```

There is no lint script.

## Rules that matter here

- **Data lives in JSON, never in source.** Hardcoded mod data is the thing this project exists to have
  removed. Read `data/patches/<patch>/`.
- **Never "fix" a probability by editing engine logic** when the weight data is what's wrong.
- **Differential tests are an anchor, not a formality.** `packages/engine/src/__fixtures__/*-java.json`
  are frozen goldens from the retired Java engine. Keep them green; a divergence means investigate, not
  average.
- **`data/patches/0.5` is frozen** — it exists only as that anchor. Never regenerate it. The app ships
  `0.5.0`.
- **Analytic first.** Exact weight-pool math; Monte Carlo only to validate, never in the hot path.
- Strict TypeScript. No `any` in `packages/engine` or `packages/optimizer`. Probabilities are f64 in
  [0,1] internally; format as percentages only at the UI edge. Prices in exalt-equivalents.
- Log validation findings and divergences in `docs/validation.md`.

See `CLAUDE.md` and `docs/DEVELOPMENT.md` for the fuller picture.
