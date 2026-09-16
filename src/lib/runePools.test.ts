import { describe, it, expect } from 'vitest';
import { loadPatch, loadShippedPatch } from '../../packages/engine/src/loadPatch.ts';
import { loadPrices } from '../../packages/optimizer/src/loadPrices.ts';
import { withRunes, usesAssumedPool } from '../../packages/engine/src/runes.ts';
import { listMods, isRollable, optimize } from './engine.ts';

/**
 * THE SIX "Can roll <X> modifiers" RUNES, and the pool each one adds.
 *
 * Every one of these 128 game modifiers is tagged for its pool and `default: 0`, so it can never roll
 * normally and does roll once the rune puts its tag on the item. That is the whole mechanic, and the
 * design follows from it: a rune-pool mod's engine `source` is `'normal'` — it is an ordinary rollable
 * modifier once the rune is in — and a `rune` marker carries the half the UI needs. Nothing in the
 * engine has a rune branch; `withRunes` folds the chosen pool into `pools.normal` and every planner
 * reads that one base.
 *
 * Read against the SHIPPED snapshot as well as the file, because these mods have to reach the browser:
 * the picker offers them and the solver rolls them, so a projection that dropped `rune` would leave
 * the app unable to tell a rune modifier from an ordinary one.
 */
const data = loadPatch('data/patches/0.5.0');
const shipped = loadShippedPatch('data/patches/0.5.0');
const runeMods = [...data.mods.values()].filter((m) => m.rune !== undefined);
const poolOf = (baseId: string, runeId: string) => data.bases.get(baseId)!.pools.rune?.[runeId];

describe('rune pools — the data', () => {
  it('builds a pool for each of the six runes', () => {
    expect(new Set(runeMods.map((m) => m.rune))).toEqual(new Set([
      'thruds-might', 'uhtreds-sidereus', 'kolrs-hunt', 'katlas-gloom', 'voranas-carnage', 'medveds-tending',
    ]));
    expect(runeMods.length).toBeGreaterThan(400);
  });

  /**
   * The weight is the one number here nobody measured. RePoE reports 1 for all 128 — the same
   * placeholder poe2db gives the desecrated pool — and taken literally it would make a rune's own
   * modifiers the rarest thing on the item, which cannot be right for a pool whose purpose is to be
   * rolled. Pinned so a refresh that silently restored the 1 fails here instead of in a plan.
   */
  it('gives every tier the assumed weight, not the placeholder', () => {
    const weights = new Set(runeMods.flatMap((m) => m.tiers.map((t) => t.weight)));
    expect(weights).toEqual(new Set([1000]));
  });

  /** An ordinary ROLLABLE modifier to the engine — which is why no planner needed changing. */
  it('keeps the engine source normal, and splits only the UI one', () => {
    for (const m of runeMods) expect(m.source, m.id).toBe('normal');
    expect(isRollable('rune')).toBe(true);
    expect(isRollable('normal')).toBe(true);
    expect(isRollable('desecrated')).toBe(false);
  });

  it('ships the rune marker to the browser', () => {
    const one = shipped.mods.get(runeMods[0]!.id);
    expect(one?.rune).toBe(runeMods[0]!.rune);
  });
});

describe('rune pools — which bases get what', () => {
  /**
   * The exclusions are encoded NEGATIVELY: a restricted mod lists the bases it must NOT roll on at
   * weight 0 BEFORE its pool tag at weight 1, so the first match wins and blocks it. Read backwards,
   * every one of these assertions inverts.
   */
  it('keeps the caster-only Destruction modifier off a Quarterstaff', () => {
    const bow = poolOf('Bows', 'thruds-might')!;
    const qs = poolOf('Quarterstaves', 'thruds-might')!;
    const fams = (p: { prefixes: readonly string[]; suffixes: readonly string[] }) =>
      new Set([...p.prefixes, ...p.suffixes].map((id) => data.mods.get(id)!.family));
    const onlyOnBows = [...fams(bow)].filter((f) => !fams(qs).has(f));
    // `DestructionInfluenceManaModifierEffect` names sword, axe, mace, spear, claw, dagger, flail,
    // crossbow, warstaff and talisman at weight 0 — a Quarterstaff matches `warstaff` first.
    expect(onlyOnBows).toHaveLength(1);
  });

  /**
   * Soul's 12 restricted modifiers each land on exactly ONE body-armour variant, and on the one their
   * own name describes. That self-check is what proved the negative encoding was read the right way
   * round: backwards, `…HybridArmour` would appear on the five variants it actually excludes.
   */
  it('limits a Soul defence modifier to the attribute variant it names', () => {
    // All six variants share ONE exclusion family, so they share a mod id too — what differs is the
    // defence each one grants, which is the only thing that can tell them apart and the only thing
    // worth asserting. Each variant gets the defence its own attributes provide.
    const defence = (baseId: string): string => data.mods.get(`${baseId}/Rune_soul_BaseLocalDefencesAndLife`)!.text!;
    expect(defence('Body_Armours_str')).toContain('increased Armour');
    expect(defence('Body_Armours_dex')).toContain('increased Evasion Rating');
    expect(defence('Body_Armours_int')).toContain('increased Energy Shield');
    expect(defence('Body_Armours_str_dex')).toContain('increased Armour and Evasion');
    // The half that fails if the negative encoding is read backwards: a strength armour would then
    // carry the five defences it actually excludes instead of the one it allows.
    expect(defence('Body_Armours_str')).not.toContain('Evasion');
    expect(defence('Body_Armours_int')).not.toContain('Armour');
    // Every body armour still takes the same COUNT — the unrestricted mods plus its own two.
    const size = (baseId: string) => {
      const p = poolOf(baseId, 'medveds-tending')!;
      return p.prefixes.length + p.suffixes.length;
    };
    expect(size('Body_Armours_str')).toBe(size('Body_Armours_dex'));
  });

  /**
   * Gloves take TWO pool runes, and that is where the id scheme earned its keep. Kolr's Hunt's
   * Mark-effect PREFIX and Katla's Gloom's curse-magnitude SUFFIX are different modifiers sharing
   * RePoE's `CurseEffectiveness` group — correctly, since a Mark is a curse. Named `Rune_<family>`
   * alone they collided and the second was dropped with only a warning: six real modifiers, gone.
   */
  it('keeps both runes’ modifiers when two pools share an exclusion family', () => {
    const ids = [...data.mods.keys()].filter((id) => id.startsWith('Gloves_dex/Rune_') && id.endsWith('CurseEffectiveness'));
    expect(ids.sort()).toEqual([
      'Gloves_dex/Rune_decay_CurseEffectiveness',
      'Gloves_dex/Rune_marksman_CurseEffectiveness',
    ]);
    // …and they still exclude each other, which is what makes the item legal rather than the ids tidy.
    const [a, b] = ids.map((id) => data.mods.get(id)!);
    expect(a!.family).toBe(b!.family);
  });
});

describe('rune pools — reaching the craft', () => {
  /** `withRunes` is the ONLY place a rune changes anything: the pool it folds in is the pool every
   *  planner rolls from, so the picker and the solve cannot disagree about what is available. */
  it('folds the chosen pool into the rollable one, and nothing otherwise', () => {
    const base = data.bases.get('Gloves_dex')!;
    const bare = withRunes(base, []);
    expect(bare).toBe(base); // identity: no rune, no new object
    const withKolr = withRunes(base, ['kolrs-hunt']);
    const added = withKolr.pools.normal.prefixes.length + withKolr.pools.normal.suffixes.length
      - base.pools.normal.prefixes.length - base.pools.normal.suffixes.length;
    const pool = poolOf('Gloves_dex', 'kolrs-hunt')!;
    expect(added).toBe(pool.prefixes.length + pool.suffixes.length);
  });

  it('adds both pools when both runes are socketed', () => {
    const base = data.bases.get('Gloves_dex')!;
    const both = withRunes(base, ['kolrs-hunt', 'katlas-gloom']);
    const k = poolOf('Gloves_dex', 'kolrs-hunt')!;
    const g = poolOf('Gloves_dex', 'katlas-gloom')!;
    const added = both.pools.normal.prefixes.length + both.pools.normal.suffixes.length
      - base.pools.normal.prefixes.length - base.pools.normal.suffixes.length;
    expect(added).toBe(k.prefixes.length + k.suffixes.length + g.prefixes.length + g.suffixes.length);
  });

  /** A rune that does not fit the base has no pool on it, so ticking it changes nothing rather than
   *  throwing — a share link from another base carries exactly that case. */
  it('ignores a rune that does not fit the base', () => {
    const base = data.bases.get('Gloves_dex')!;
    expect(withRunes(base, ['medveds-tending'])).toBe(base);
  });

  /**
   * The honesty half. A pool rune's weights are assumed, and weight sits in the DENOMINATOR of every
   * weighted draw — so socketing one qualifies the WHOLE solve, not merely the steps that land one of
   * its modifiers. That is why the signal is the socketed runes rather than anything in the plan, and
   * why `assumedFrom` exists: before it, a craft with a pool rune and no Desecration anywhere in it
   * was still told "This plan uses a Desecration without a boss omen".
   */
  it('counts a pool rune as an assumption, and a limit rune as none', () => {
    expect(usesAssumedPool(['kolrs-hunt'])).toBe(true);
    // Astrid's and Serle's add no modifiers, so they add no assumed weight either.
    expect(usesAssumedPool(['astrids-creativity'])).toBe(false);
    expect(usesAssumedPool(['serles-triumph'])).toBe(false);
    expect(usesAssumedPool([])).toBe(false);
  });

  it('carries that caveat onto a craft planned with one socketed', () => {
    const eng = { data, prices: loadPrices('data/patches/0.5.0') };
    const modId = poolOf('Gloves_dex', 'kolrs-hunt')!.prefixes[0]!;
    const res = optimize(eng, 'Gloves_dex', 82,
      [{ modId, tierDisplay: data.mods.get(modId)!.tiers.length }], { runes: ['kolrs-hunt'] });
    expect(res.assumedOdds).toBe(true);
    // `both` is legitimate here rather than a failure: a Desecration draws from the combined pool, so
    // the planner may offer one, and then two assumptions really are in play.
    expect(['rune-pool', 'both']).toContain(res.assumedFrom);
  });

  it('offers a rune’s modifiers to the picker only while its rune is ticked', () => {
    const without = listMods(data, 'Gloves_dex');
    const with_ = listMods(data, 'Gloves_dex', ['kolrs-hunt']);
    expect(without.prefixes.some((m) => m.source === 'rune')).toBe(false);
    expect(without.suffixes.some((m) => m.source === 'rune')).toBe(false);
    const offered = [...with_.prefixes, ...with_.suffixes].filter((m) => m.source === 'rune');
    expect(offered.length).toBeGreaterThan(0);
    for (const m of offered) expect(m.rune).toBe('kolrs-hunt');
  });
});
