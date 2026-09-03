// Hand-written because `tools/` is plain ESM JavaScript with no build step, and `src/lib/modText.test.ts`
// imports this rule so the generator and the shipped data are pinned to the SAME implementation —
// which is the whole point of extracting it. Without a declaration that import is an implicit `any`
// and `noImplicitAny` rejects it.

/** A tier as `mods.json` stores it: only the roll ranges matter here. */
export interface RollTier {
  readonly ranges?: readonly (readonly number[])[];
}

/** Restore a `#` placeholder that a fixed worst-tier roll left as a literal. See the .mjs for why. */
export function templateFixedRoll<T extends string | null>(text: T, tiers: readonly RollTier[]): T;
