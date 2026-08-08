import { describe, it, expect } from 'vitest';
import {
  listBases, listMods, listPerfectEssences, listDesecrated, optimize, optimizeItem, optimizeItemMarkov,
  currencyActions, recommendedIndex, alternatives, alternativesForItem, type EngineMod, type ExistingItem,
} from './engine.ts';
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

// The app fetches the 0.5.0 snapshot at runtime; here we build that same snapshot via the node loaders
// and confirm the newly-shipped essence pool is reachable through the optimizer (not just present in data).
describe('engine facade — essence targeting on the shipped 0.5.0 data', () => {
  const eng050 = { data: loadPatch('data/patches/0.5.0'), prices: loadPrices('data/patches/0.5.0') };

  it('surfaces 0.5.0 essence mods and reaches one via a deterministic (P=1) essence step', () => {
    const { prefixes, suffixes } = listMods(eng050.data, 'Wands');
    const essence = [...prefixes, ...suffixes].find((m) => m.source === 'essence');
    expect(essence, 'Wands has an essence mod in 0.5.0').toBeDefined();
    // A rollable mod on the OPPOSITE side so both fit; the essence needs a Magic base to convert.
    const rollable = (essence!.type === 'prefix' ? suffixes : prefixes).find((m) => m.source === 'normal')!;
    const r = optimize(eng050, 'Wands', 82, [
      { modId: rollable.id, tierDisplay: rollable.tiers.length },   // any tier
      { modId: essence!.id, tierDisplay: essence!.tiers.length },   // lowest essence level → feasible at ilvl 82
    ]);
    expect(r.frontier.length).toBeGreaterThan(0);
    const essStep = r.frontier[0]!.steps.find((s) => s.currency === 'essence');
    expect(essStep).toBeDefined();
    expect(essStep!.prob).toBe(1);
    expect(essStep!.label.toLowerCase()).toContain('essence');
  });
});

// Perfect essences: offered only in the from-item flow (a Perfect Essence adds its guaranteed mod on a
// Rare while removing one random mod). Verify the facade lists them and the planner reaches one.
describe('engine facade — perfect essences in the from-item planner (0.5.0)', () => {
  const eng050 = { data: loadPatch('data/patches/0.5.0'), prices: loadPrices('data/patches/0.5.0') };

  it('listPerfectEssences surfaces perfect-essence mods (source "perfect", single tier)', () => {
    const perfects = listPerfectEssences(eng050.data, 'Wands');
    expect(perfects.length).toBeGreaterThan(0);
    expect(perfects.every((m) => m.source === 'perfect' && m.tiers.length === 1)).toBe(true);
    // they must NOT leak into the from-white picker (listMods stays normal + regular essence).
    const white = listMods(eng050.data, 'Wands');
    expect([...white.prefixes, ...white.suffixes].some((m) => m.source === 'perfect')).toBe(false);
  });

  it('reaches a perfect-essence target by sacrificing a junk mod (perfect-essence step)', () => {
    const pe = listPerfectEssences(eng050.data, 'Wands')[0]!;
    // a junk normal prefix on a different family so the add is legal before the removal
    const junk = listMods(eng050.data, 'Wands').prefixes.find((m) => m.source === 'normal' && m.family !== pe.family)!;
    const item: ExistingItem = {
      baseId: 'Wands', level: 82, rarity: 'rare',
      prefixes: [{ modId: junk.id, tierDisplay: 1 }], suffixes: [],
    };
    const r = optimizeItem(eng050, item, [{ modId: pe.id, tierDisplay: 1 }]);
    expect(r.frontier.length).toBeGreaterThan(0);
    const step = r.frontier[0]!.steps.find((s) => s.currency === 'perfect-essence');
    expect(step, 'the plan uses a perfect essence').toBeDefined();
    expect(step!.label.toLowerCase()).toContain('perfect essence');
    expect(step!.target).toMatch(/random/); // "+<add>  −<removed> (random)"
  });

  it('rejects a perfect target when the Rare has no junk to sacrifice', () => {
    const pe = listPerfectEssences(eng050.data, 'Wands')[0]!;
    const keep = listMods(eng050.data, 'Wands').prefixes.find((m) => m.source === 'normal' && m.family !== pe.family)!;
    const item: ExistingItem = {
      baseId: 'Wands', level: 82, rarity: 'rare',
      prefixes: [{ modId: keep.id, tierDisplay: 1 }], suffixes: [],
    };
    // target keeps the existing mod AND wants the perfect one → no spare mod to feed the essence.
    expect(() => optimizeItem(eng050, item, [{ modId: keep.id, tierDisplay: 1 }, { modId: pe.id, tierDisplay: 1 }]))
      .toThrow(/Perfect Essence/i);
  });
});

// Desecrated mods: modelled on an item you already hold (they occupy a slot + family), removable for
// certain by an Omen of Light annul, and keep-able in a plan — but never crafted onto the item here.
describe('engine facade — desecrated mods on an item (0.5.0)', () => {
  const eng050 = { data: loadPatch('data/patches/0.5.0'), prices: loadPrices('data/patches/0.5.0') };
  const des = listDesecrated(eng050.data, 'Wands');
  const D = des[0]!; // a desecrated mod
  const norm = listMods(eng050.data, 'Wands');
  // a normal mod on the OPPOSITE side, different family, so the two sit together legally
  const N = (D.type === 'prefix' ? norm.suffixes : norm.prefixes).find((m) => m.source === 'normal' && m.family !== D.family)!;
  const item = (): ExistingItem => ({
    baseId: 'Wands', level: 82, rarity: 'rare',
    prefixes: D.type === 'prefix' ? [{ modId: D.id, tierDisplay: 1 }] : [{ modId: N.id, tierDisplay: 1 }],
    suffixes: D.type === 'prefix' ? [{ modId: N.id, tierDisplay: 1 }] : [{ modId: D.id, tierDisplay: 1 }],
  });

  it('listDesecrated surfaces the desecrated pool (source "desecrated", single tier), kept out of from-white', () => {
    expect(des.length).toBeGreaterThan(0);
    expect(des.every((m) => m.source === 'desecrated' && m.tiers.length === 1)).toBe(true);
    const white = listMods(eng050.data, 'Wands');
    expect([...white.prefixes, ...white.suffixes].some((m) => m.source === 'desecrated')).toBe(false);
    expect(listPerfectEssences(eng050.data, 'Wands').some((m) => m.source === 'desecrated')).toBe(false);
  });

  it('offers Annulment + Omen of Light (P=1) to remove a desecrated sacrifice, beside the random annul', () => {
    const acts = currencyActions(eng050, item(), { removeModId: D.id });
    const plain = acts.find((a) => a.currency === 'annul' && !/Light/.test(a.label))!;
    const light = acts.find((a) => a.currency === 'annul' && /Light/.test(a.label))!;
    expect(plain.prob).toBeCloseTo(1 / 2, 9);          // 2 mods on the item → random annul is 1/2
    expect(light).toBeDefined();
    expect(light.prob).toBeCloseTo(1, 9);              // Omen of Light → the desecrated mod for certain
    expect(light.cost).toBeGreaterThan(plain.cost);    // the omen carries a surcharge
    expect(light.detail).toMatch(/certain/i);
  });

  it('does NOT offer Omen of Light when the sacrifice is a normal mod', () => {
    const acts = currencyActions(eng050, item(), { removeModId: N.id });
    expect(acts.some((a) => /Light/.test(a.label))).toBe(false);
  });

  it('a plan KEEPS a desecrated mod already on the item (P=1, no steps)', () => {
    const r = optimizeItem(eng050, item(), [
      { modId: D.id, tierDisplay: 1 }, { modId: N.id, tierDisplay: 99 }, // keep both; N at any tier
    ]);
    const best = r.frontier[r.frontier.length - 1]!;
    expect(best.probability).toBeCloseTo(1, 9);
    expect(best.steps.length).toBe(0);
  });

  it('crafts a desecrated target onto an item via a Desecration + its boss omen', () => {
    // A rare with one normal prefix; add a desecrated PREFIX by desecrating into the open prefix slot.
    const dp = listDesecrated(eng050.data, 'Wands').find((m) => m.type === 'prefix')!;
    const np = norm.prefixes.find((m) => m.source === 'normal' && m.family !== dp.family)!;
    const start: ExistingItem = { baseId: 'Wands', level: 82, rarity: 'rare', prefixes: [{ modId: np.id, tierDisplay: 1 }], suffixes: [] };
    const r = optimizeItem(eng050, start, [{ modId: np.id, tierDisplay: 1 }, { modId: dp.id, tierDisplay: 1 }]);
    expect(r.frontier.length).toBeGreaterThan(0);
    const desStep = r.frontier[r.frontier.length - 1]!.steps.find((s) => s.currency === 'desecrate');
    expect(desStep, 'the plan uses a Desecration').toBeDefined();
    expect(desStep!.label).toMatch(/Desecration \+ Omen of the (Blackblooded|Liege|Sovereign)/);
    expect(desStep!.target).toBe(dp.text);
  });

  it('rejects two desecrated targets — an item holds at most one', () => {
    const two = listDesecrated(eng050.data, 'Wands').filter((m) => m.type === 'suffix').slice(0, 2);
    expect(two.length).toBe(2);
    const np = norm.prefixes.find((m) => m.source === 'normal')!;
    expect(() => optimize(eng050, 'Wands', 82, [
      { modId: np.id, tierDisplay: np.tiers.length },
      { modId: two[0]!.id, tierDisplay: 1 }, { modId: two[1]!.id, tierDisplay: 1 },
    ])).toThrow(/at most one desecrated mod/i);
  });

  it('crafts a desecrated mod from white: build a Rare with 3 rollables, then Desecrate', () => {
    const dp = listDesecrated(eng050.data, 'Wands').find((m) => m.type === 'suffix')!;
    // 2 normal prefixes of DISTINCT families + 1 normal suffix reach Rare (transmute→augment→regal),
    // then Desecrate the suffix. (Distinct families so the target isn't self-excluding.)
    const seenFam = new Set<string>();
    const np = norm.prefixes.filter((m) => m.source === 'normal' && !seenFam.has(m.family) && seenFam.add(m.family)).slice(0, 2);
    const ns = norm.suffixes.find((m) => m.source === 'normal' && m.family !== dp.family)!;
    const r = optimize(eng050, 'Wands', 82, [
      { modId: np[0]!.id, tierDisplay: np[0]!.tiers.length }, { modId: np[1]!.id, tierDisplay: np[1]!.tiers.length },
      { modId: ns.id, tierDisplay: ns.tiers.length }, { modId: dp.id, tierDisplay: 1 },
    ]);
    expect(r.frontier.length).toBeGreaterThan(0);
    const best = r.frontier[r.frontier.length - 1]!;
    const desAt = best.steps.findIndex((s) => s.currency === 'desecrate');
    const regalAt = best.steps.findIndex((s) => s.currency === 'regal');
    expect(desAt).toBeGreaterThan(regalAt); // desecration only after the item is Rare
    expect(regalAt).toBeGreaterThanOrEqual(0);
  });
});

describe('recommendedIndex — best-value (cheapest practical) pick', () => {
  const plan = (expected: number, expectedAttempts: number) =>
    ({ expected, probability: 1 / expectedAttempts, perAttempt: expected / expectedAttempts, expectedAttempts, steps: [] });

  it('skips a cheap-but-grindy plan for the cheapest practical one', () => {
    // cheapest = 2500 attempts (a grind), then a 7-attempt plan, then a 1.6-attempt plan.
    const frontier = [plan(3, 2500), plan(9.5, 7), plan(31, 1.6)];
    expect(recommendedIndex(frontier)).toBe(1); // the 7-attempt plan — cheapest that's practical
  });
  it('recommends the cheapest when it is already practical', () => {
    expect(recommendedIndex([plan(5, 8), plan(20, 1.5)])).toBe(0);
  });
  it('falls back to the surest when no plan is practical', () => {
    expect(recommendedIndex([plan(3, 5000), plan(9, 200)])).toBe(1);
  });
  it('empty frontier → -1', () => {
    expect(recommendedIndex([])).toBe(-1);
  });
});

describe('engine facade — fractured mods flow through to the odds', () => {
  it('a fractured mod is excluded from Annulment removal (the other mod is removed for certain)', () => {
    const item: ExistingItem = {
      baseId: 'Wands', level: 82, rarity: 'rare',
      prefixes: [{ modId: MANA, tierDisplay: 1, fractured: true }],
      suffixes: [{ modId: 'Wands/INTELLIGENCE', tierDisplay: 1 }],
    };
    // Mana fractured ⇒ Intelligence is the only removable mod ⇒ annul hits it with P=1 (was 1/2).
    const annulInt = currencyActions(eng, item, { removeModId: 'Wands/INTELLIGENCE' }).find((a) => a.currency === 'annul')!;
    expect(annulInt.prob).toBeCloseTo(1, 12);
    // Annulling the fractured mod itself is impossible.
    const annulMana = currencyActions(eng, item, { removeModId: MANA }).find((a) => a.currency === 'annul')!;
    expect(annulMana.prob).toBe(0);
  });

  it('from-scratch fractured routing: a plan keeps the carved mod and rolls the rest around it', () => {
    // Mirror EngineLab: fracture Mana on the base, target = Mana + Intelligence. Starts from a Rare with
    // Mana (locked) and exalts Intelligence; nothing removes Mana.
    const item: ExistingItem = {
      baseId: 'Wands', level: 82, rarity: 'rare',
      prefixes: [{ modId: MANA, tierDisplay: 99, fractured: true }], suffixes: [],
    };
    const r = optimizeItem(eng, item, [{ modId: MANA, tierDisplay: 99 }, { modId: 'Wands/INTELLIGENCE', tierDisplay: 99 }]);
    expect(r.frontier.length).toBeGreaterThan(0);
    const removesMana = r.frontier.some((p) => p.steps.some((s) => /removes .*Mana|−.*Mana/.test(s.target)));
    expect(removesMana).toBe(false);
    expect(r.frontier.some((p) => p.steps.some((s) => s.currency === 'exalt'))).toBe(true);
  });

  it('a fractured mod coexists with a DESECRATED target (both want a Rare — no conflict)', () => {
    // Unlike essence, desecration acts on a Rare, which is exactly what a fractured base is. Fracture a
    // normal prefix, target it + a desecrated suffix → the plan keeps the carved mod and Desecrates.
    const desS = listDesecrated(eng.data, 'Wands').find((m) => m.type === 'suffix')!;
    const carved: ExistingItem = {
      baseId: 'Wands', level: 82, rarity: 'rare',
      prefixes: [{ modId: MANA, tierDisplay: 1, fractured: true }], suffixes: [],
    };
    const r = optimizeItem(eng, carved, [{ modId: MANA, tierDisplay: 1 }, { modId: desS.id, tierDisplay: 1 }]);
    expect(r.frontier.length).toBeGreaterThan(0);
    const desStep = r.frontier[r.frontier.length - 1]!.steps.find((s) => s.currency === 'desecrate');
    expect(desStep, 'the plan Desecrates the desecrated target').toBeDefined();
    // …and nothing removes the fractured mod.
    expect(r.frontier.some((p) => p.steps.some((s) => /removes .*Mana|−.*Mana/.test(s.target)))).toBe(false);
  });

  it('a fractured (from-item) craft with an essence-only target fails with a clear reason', () => {
    // The reported bug: fracturing routes through the from-item planner (Rare start), but a regular
    // essence needs a Magic item — so the essence mod can't be applied. The message must say so, not
    // give a generic "can't be put on Wands".
    const carved: ExistingItem = {
      baseId: 'Wands', level: 82, rarity: 'rare',
      prefixes: [{ modId: MANA, tierDisplay: 1, fractured: true }], suffixes: [],
    };
    expect(() => optimizeItem(eng, carved, [{ modId: MANA, tierDisplay: 1 }, { modId: ESS, tierDisplay: 1 }]))
      .toThrow(/regular essence needs a Magic item/i);
    // …and the same essence target IS craftable from white (the flow that has a Magic stage).
    const white = optimize(eng, 'Wands', 82, [{ modId: MANA, tierDisplay: 99 }, { modId: ESS, tierDisplay: 1 }]);
    expect(white.frontier.length).toBeGreaterThan(0);
  });
});

// Budget alternatives: "I have N ex — what's the closest thing I can actually finish?" Uses the 0.5.0
// snapshot the app ships, so the mod ids match what the UI would hand the facade.
describe('engine facade — budget alternatives (0.5.0)', () => {
  const eng050 = { data: loadPatch('data/patches/0.5.0'), prices: loadPrices('data/patches/0.5.0') };
  const GEM = 'Wands/GlobalIncreaseSpellSkillGemLevelWeapon'; // suffix, 500 total weight
  const MANA050 = 'Wands/IncreasedMana';
  const SPELL = 'Wands/WeaponSpellDamage';
  const hard = [
    { modId: GEM, tierDisplay: 1 }, { modId: MANA050, tierDisplay: 1 }, { modId: SPELL, tierDisplay: 1 },
  ];

  it('row 0 is exactly the target you asked for, with its (dismal) odds', () => {
    const r = alternatives(eng050, 'Wands', 82, hard, 30);
    const row0 = r.rows[0]!;
    expect(row0.isTarget).toBe(true);
    expect(row0.dropped + row0.swapped).toBe(0);
    expect(row0.valueRetained).toBeCloseTo(1, 9);
    expect(row0.inBudget).toBeLessThan(0.05); // a T1/T1/T1 wand is not a 30ex craft
    expect(row0.slots.every((s) => s.kind === 'kept' && s.tierDisplay === 1)).toBe(true);
  });

  it('finds a near-certain near-miss and reports the odds rising down the list', () => {
    const r = alternatives(eng050, 'Wands', 82, hard, 30);
    expect(r.rows.length).toBeGreaterThan(2);
    for (let i = 1; i < r.rows.length; i++) {
      expect(r.rows[i]!.inBudget).toBeGreaterThan(r.rows[i - 1]!.inBudget);
    }
    const best = r.rows[r.rows.length - 1]!;
    expect(best.inBudget).toBeGreaterThan(0.9);
    expect(best.plan.steps.length).toBeGreaterThan(0);
  });

  it('labels each slot for the UI: kept tiers, a swap’s origin, a dropped mod', () => {
    const r = alternatives(eng050, 'Wands', 82, hard, 30);
    for (const row of r.rows) {
      for (const s of row.slots) {
        expect(s.text.length).toBeGreaterThan(0);
        if (s.kind === 'dropped') {
          expect(s.tierDisplay).toBeUndefined();
          expect(s.fromText).toBe(s.text); // the mod you give up
        } else {
          expect(s.tierDisplay).toBeGreaterThanOrEqual(1);
          expect(s.tierLabel).toMatch(/^T\d/);
          // only a CHANGED slot says what you originally wanted
          if (s.kind === 'kept') expect(s.fromText).toBeUndefined();
          else expect(s.fromText!.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('a commensurable price sheet gives exact odds, not a bracket', () => {
    const r = alternatives(eng050, 'Wands', 82, hard, 30);
    for (const row of r.rows) {
      expect(row.exact).toBe(true);
      expect(row.inBudgetMax).toBeCloseTo(row.inBudget, 12);
    }
  });

  it('a pinned target is never relaxed, swapped or dropped', () => {
    const r = alternatives(eng050, 'Wands', 82, [
      { modId: GEM, tierDisplay: 1, pinned: true }, { modId: MANA050, tierDisplay: 1 }, { modId: SPELL, tierDisplay: 1 },
    ], 30);
    for (const row of r.rows) {
      expect(row.slots[0]).toMatchObject({ kind: 'kept', tierDisplay: 1 });
    }
    // …and the rest still move, so the pin is a real constraint and not a dead search.
    expect(r.rows.some((row) => row.slots.slice(1).some((s) => s.kind !== 'kept' || s.tierDisplay !== 1))).toBe(true);
  });

  it('a bigger budget never lowers the odds of the same item', () => {
    const lean = alternatives(eng050, 'Wands', 82, hard, 30).rows[0]!;
    const rich = alternatives(eng050, 'Wands', 82, hard, 3000).rows[0]!;
    expect(rich.inBudget).toBeGreaterThanOrEqual(lean.inBudget);
  });

  it('from an item: a fractured mod is pinned even though the caller didn’t pin it', () => {
    const item: ExistingItem = {
      baseId: 'Wands', level: 82, rarity: 'rare',
      prefixes: [{ modId: MANA050, tierDisplay: 1, fractured: true }], suffixes: [],
    };
    const r = alternativesForItem(eng050, item, [
      { modId: MANA050, tierDisplay: 1 }, { modId: GEM, tierDisplay: 1 },
    ], 30);
    expect(r.rows.length).toBeGreaterThan(0);
    for (const row of r.rows) {
      expect(row.slots[0]).toMatchObject({ kind: 'kept', tierDisplay: 1 });
    }
  });

  it('reports its search accounting so the UI can be honest about caps', () => {
    const r = alternatives(eng050, 'Wands', 82, hard, 30);
    expect(r.nodesEvaluated).toBeGreaterThan(0);
    expect(typeof r.truncated).toBe('boolean');
    expect(['full', 'base+strongest', 'strongest-only']).toContain(r.currencyDepth);
  });
});

// The from-item MDP (true expected cost + policy graph). Uses the 0.5.0 snapshot the app ships.
describe('engine facade — optimizeItemMarkov (0.5.0)', () => {
  const eng050 = { data: loadPatch('data/patches/0.5.0'), prices: loadPrices('data/patches/0.5.0') };
  const MANA = 'Wands/IncreasedMana'; const INT = 'Wands/Intelligence'; const SPELL = 'Wands/WeaponSpellDamage';
  const start: ExistingItem = {
    baseId: 'Wands', level: 82, rarity: 'rare',
    prefixes: [{ modId: MANA, tierDisplay: 99 }], suffixes: [{ modId: INT, tierDisplay: 99 }],
  };

  it('returns the true expected cost + a policy graph with start, goal, and a brick edge', () => {
    const r = optimizeItemMarkov(eng050, start, [{ modId: MANA, tierDisplay: 99 }, { modId: SPELL, tierDisplay: 99 }]);
    expect(r.applicable).toBe(true);
    expect(r.feasible).toBe(true);
    expect(r.expectedCost).toBeGreaterThan(0);
    const startNode = r.nodes.find((nd) => nd.isStart)!;
    expect(startNode.present).toContain('+# to maximum Mana');
    expect(startNode.action).toBeTruthy(); // a human action label
    expect(r.nodes.some((nd) => nd.isGoal && nd.expectedCost === 0)).toBe(true);
    expect(r.edges.some((e) => e.regress)).toBe(true); // a back-arrow exists
    // The MDP's honest cost exceeds the linear model's optimistic "cheapest" (free-restart) estimate.
    const linear = optimizeItem(eng050, start, [{ modId: MANA, tierDisplay: 99 }, { modId: SPELL, tierDisplay: 99 }]);
    expect(r.expectedCost).toBeGreaterThan(linear.frontier[0]!.expected);
  });

  it('is not applicable when a target needs an essence/desecrated mod (caller uses the frontier)', () => {
    const pe = listPerfectEssences(eng050.data, 'Wands')[0]!;
    const r = optimizeItemMarkov(eng050, start, [{ modId: MANA, tierDisplay: 99 }, { modId: pe.id, tierDisplay: 1 }]);
    expect(r.applicable).toBe(false);
    expect(r.reason).toMatch(/rollable mods only/i);
  });
});
