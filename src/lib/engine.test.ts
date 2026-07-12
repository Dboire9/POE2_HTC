import { describe, it, expect } from 'vitest';
import { listBases, listMods, optimize, optimizeItem, currencyActions, type EngineMod, type ExistingItem } from './engine.ts';
import { loadPatch } from '../../packages/engine/src/loadPatch.ts';
import { loadPrices } from '../../packages/optimizer/src/loadPrices.ts';

// The facade's data loading uses fetch(?url) which needs a browser; here we build the same snapshot
// via the node loaders and exercise the pure mapping/optimize glue the UI depends on.
const eng = { data: loadPatch('data/patches/0.5'), prices: loadPrices('data/patches/0.5') };
const MANA = 'Wands/MAXIMUM_MANA';
const ESS = 'Wands/ESSENCE_INCREASED_CAST_SPEED'; // essence-only suffix (its tiers are essence levels)
const findMod = (list: readonly EngineMod[], id: string) => list.find((m) => m.id === id)!;

describe('engine facade — base & mod listing', () => {
  it('lists Wands among the bases', () => {
    expect(listBases(eng.data).some((b) => b.id === 'Wands')).toBe(true);
  });

  it('presents a mod’s tiers best-first (display 1 = highest ilvl)', () => {
    const mana = findMod(listMods(eng.data, 'Wands').prefixes, MANA);
    expect(mana.tiers[0]!.display).toBe(1);
    const ilvls = mana.tiers.map((t) => t.ilvl);
    // T1 (display 1) is the best = highest ilvl gate; displays ascend as tiers get worse.
    expect(mana.tiers[0]!.ilvl).toBe(Math.max(...ilvls));
    expect(mana.tiers[mana.tiers.length - 1]!.ilvl).toBe(Math.min(...ilvls));
  });

  it('surfaces essence-only mods (from the essence pool) tagged as such, tiers = essence levels', () => {
    const ess = findMod(listMods(eng.data, 'Wands').suffixes, ESS);
    expect(ess.source).toBe('essence');
    // tier labels are the essence level names (Lesser/…/Greater Essence of …), not "T1 · …".
    expect(ess.tiers.some((t) => /essence/i.test(t.name))).toBe(true);
  });
});

describe('engine facade — optimize', () => {
  it('returns an achievable, well-formed frontier for a single T1 target', () => {
    const r = optimize(eng, 'Wands', 82, [{ modId: MANA, tierDisplay: 1 }]);
    expect(r.frontier.length).toBeGreaterThan(0);
    const plan = r.frontier[0]!;
    expect(Number.isFinite(plan.expected)).toBe(true);
    expect(plan.probability).toBeGreaterThan(0);
    // steps render human text (mod text, not raw id) and a currency label.
    expect(plan.steps[0]!.target).toBe('+# to maximum Mana');
    expect(plan.steps[0]!.label).toMatch(/Transmut/);
  });

  it('targeting T1 is strictly harder (lower probability) than accepting any tier', () => {
    const mana = findMod(listMods(eng.data, 'Wands').prefixes, MANA);
    const anyTier = mana.tiers.length; // worst display ⇒ minTierIndex 0 ⇒ any tier
    const best = (r: ReturnType<typeof optimize>) => Math.max(...r.frontier.map((p) => p.probability));
    const t1 = optimize(eng, 'Wands', 82, [{ modId: MANA, tierDisplay: 1 }]);
    const any = optimize(eng, 'Wands', 82, [{ modId: MANA, tierDisplay: anyTier }]);
    expect(best(any)).toBeGreaterThan(best(t1));
  });

  it('an essence-only target is guaranteed by a deterministic (P=1) essence step at the chosen level', () => {
    const r = optimize(eng, 'Wands', 82, [
      { modId: MANA, tierDisplay: 1 },       // a rollable mod for the essence to land on
      { modId: ESS, tierDisplay: 1 },        // essence-only, best level (Greater)
    ]);
    expect(r.frontier.length).toBeGreaterThan(0);
    const essStep = r.frontier[0]!.steps.find((s) => s.currency === 'essence');
    expect(essStep).toBeDefined();
    expect(essStep!.prob).toBe(1);
    expect(essStep!.label.toLowerCase()).toContain('essence');
  });

  it('rejects two essence-only mods (a regular essence needs Magic and turns it Rare — one per craft)', () => {
    const secondEssence = 'Wands/ESSENCE_SPELL_CRIT_CHANCE';
    expect(() => optimize(eng, 'Wands', 82, [
      { modId: ESS, tierDisplay: 1 }, { modId: secondEssence, tierDisplay: 1 },
    ])).toThrow(/one essence-only/i);
  });

  it('rejects an essence-only-only target (needs a rollable mod to make the Magic base)', () => {
    expect(() => optimize(eng, 'Wands', 82, [{ modId: ESS, tierDisplay: 1 }])).toThrow(/rollable mod/i);
  });

  it('reports the currency-tier search depth (never silently truncated)', () => {
    const r = optimize(eng, 'Wands', 82, [{ modId: MANA, tierDisplay: 1 }]);
    expect(['full', 'base+strongest', 'strongest-only']).toContain(r.currencyDepth);
    expect(r.plansEvaluated).toBeGreaterThan(0);
  });
});

describe('engine facade — existing-item currency actions (Option 1)', () => {
  const SPELL = 'Wands/INCREASED_SPELL_DAMAGE'; // a wand prefix
  const rare = (prefixes: string[], suffixes: string[]): ExistingItem => ({
    baseId: 'Wands', level: 82, rarity: 'rare',
    prefixes: prefixes.map((modId) => ({ modId, tierDisplay: 1 })),
    suffixes: suffixes.map((modId) => ({ modId, tierDisplay: 1 })),
  });

  it('a rare with an open slot → an Exalted action with a real per-use probability', () => {
    const acts = currencyActions(eng, rare([MANA], []), { addModId: 'Wands/INTELLIGENCE' });
    const ex = acts.find((a) => a.currency === 'exalt')!;
    expect(ex.feasible).toBe(true);
    expect(ex.prob).toBeGreaterThan(0);
    expect(ex.prob).toBeLessThanOrEqual(1);
    expect(ex.detail).toMatch(/adds/);
  });

  it('a removeModId turns on the Chaos swap (removes the sacrifice, adds the target)', () => {
    const acts = currencyActions(eng, rare([MANA], ['Wands/INTELLIGENCE']), { addModId: SPELL, removeModId: 'Wands/INTELLIGENCE' });
    const chaos = acts.find((a) => a.currency === 'chaos')!;
    expect(chaos.feasible).toBe(true);
    expect(chaos.prob).toBeGreaterThan(0);
    expect(chaos.detail).toMatch(/removes .* adds/);
    expect(chaos.cost).toBeCloseTo(0.2, 12); // the single-orb price, not a total budget
  });

  it('Annulment odds are uniform over the mods on the item (2 mods → 1/2)', () => {
    const acts = currencyActions(eng, rare([MANA], ['Wands/INTELLIGENCE']), { removeModId: MANA });
    const annul = acts.find((a) => a.currency === 'annul')!;
    expect(annul.feasible).toBe(true);
    expect(annul.prob).toBeCloseTo(1 / 2, 12);
  });

  it('naming a mod that isn’t on the item is infeasible, with a reason', () => {
    const acts = currencyActions(eng, rare([MANA], []), { removeModId: 'Wands/INTELLIGENCE' });
    const annul = acts.find((a) => a.currency === 'annul')!;
    expect(annul.feasible).toBe(false);
    expect(annul.reason).toMatch(/isn.t on the item/);
  });

  it('a magic item offers Augmentation + Regal (not Exalted — that is rare-only)', () => {
    const magic: ExistingItem = { baseId: 'Wands', level: 82, rarity: 'magic', prefixes: [{ modId: MANA, tierDisplay: 1 }], suffixes: [] };
    const acts = currencyActions(eng, magic, { addModId: 'Wands/INTELLIGENCE' });
    expect(acts.some((a) => a.currency === 'augment')).toBe(true);
    expect(acts.some((a) => a.currency === 'regal')).toBe(true);
    expect(acts.some((a) => a.currency === 'exalt')).toBe(false);
  });
});

describe('engine facade — from-item planner (Option 2)', () => {
  const any = 99; // tierDisplay past the tier count ⇒ any tier (keeps the smoke test feasible)
  // A rare wand with Mana (P) + Intelligence & Cast Speed (S). Target keeps Mana+Int, swaps Cast Speed
  // for Increased Spell Damage (a prefix) — so Cast Speed is junk and Spell Damage is missing.
  const item: ExistingItem = {
    baseId: 'Wands', level: 82, rarity: 'rare',
    prefixes: [{ modId: MANA, tierDisplay: 1 }],
    suffixes: [{ modId: 'Wands/INTELLIGENCE', tierDisplay: 1 }, { modId: 'Wands/INCREASED_CAST_SPEED', tierDisplay: 1 }],
  };
  const targets = [
    { modId: MANA, tierDisplay: any }, { modId: 'Wands/INTELLIGENCE', tierDisplay: any },
    { modId: 'Wands/INCREASED_SPELL_DAMAGE', tierDisplay: any },
  ];

  it('returns a frontier that removes the junk and adds the missing mod', () => {
    const r = optimizeItem(eng, item, targets);
    expect(r.frontier.length).toBeGreaterThan(0);
    // Some plan removes Cast Speed (annul) or swaps it in one orb (chaos), and the step text says so.
    const removers = r.frontier.flatMap((p) => p.steps).filter((s) => s.currency === 'annul' || s.currency === 'chaos');
    expect(removers.length).toBeGreaterThan(0);
    expect(removers.some((s) => /removes|−/.test(s.target))).toBe(true);
  });

  it('a Magic item is rejected with a helpful message', () => {
    const magic: ExistingItem = { ...item, rarity: 'magic', suffixes: [{ modId: 'Wands/INTELLIGENCE', tierDisplay: 1 }] };
    expect(() => optimizeItem(eng, magic, targets)).toThrow(/Rare/i);
  });
});
