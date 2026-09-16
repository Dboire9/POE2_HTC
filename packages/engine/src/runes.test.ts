import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { ALDUR_RUNE_BY_ELEMENT, RUNES, RUNE_BY_ID, aldurEats, runePriceKey, runesFor } from './runes.ts';
import { loadPatch } from './loadPatch.ts';

const data = loadPatch('data/patches/0.5.0');
const byCategory = (category: string) => {
  const b = [...data.bases.values()].find((x) => x.category === category);
  if (!b) throw new Error(`no base in category ${category}`);
  return b;
};

describe('the rune table', () => {
  it('names every rune once, under poe.ninja’s own id', () => {
    expect(new Set(RUNES.map((r) => r.id)).size).toBe(RUNES.length);
    for (const r of RUNES) {
      expect(r.id).toMatch(/^[a-z0-9-]+$/);
      expect(r.name.length).toBeGreaterThan(0);
      expect(RUNE_BY_ID.get(r.id)).toBe(r);
    }
  });

  it('prices each one under a key that cannot collide with a currency', () => {
    expect(runePriceKey('astrids-creativity')).toBe('rune:astrids-creativity');
  });

  it('fits each rune to the bases the game gives it', () => {
    const gloves = runesFor(byCategory('Gloves')).map((r) => r.id);
    expect(gloves).toContain('kolrs-hunt');   // Marksman
    expect(gloves).toContain('katlas-gloom'); // Decay
    expect(gloves).not.toContain('uhtreds-sidereus'); // Boots only
    expect(gloves).not.toContain('passion-of-aldur'); // weapons only

    // "All Equipment" in the data — the two that change the limits fit everything.
    for (const category of ['Gloves', 'Boots', 'Wands', 'Rings']) {
      const ids = runesFor(byCategory(category)).map((r) => r.id);
      expect(ids).toContain('astrids-creativity');
      expect(ids).toContain('serles-triumph');
    }

    const wand = runesFor(byCategory('Wands')).map((r) => r.id);
    expect(wand).toContain('thruds-might'); // Destruction, "Martial Or Caster Weapon"
    expect(runesFor(byCategory('Rings')).map((r) => r.id)).not.toContain('thruds-might');
  });

  /**
   * Each element comes from the rune's OWN stat text in the game data — `RuneConvertLightning` reads
   * "Transforms all Fire and Cold modifiers on the item into equivalent Lightning modifiers" — where
   * before the scan only fire was traced and the other three were left out rather than guessed.
   */
  it('names an Aldur rune for each element, and what it eats', () => {
    expect([...ALDUR_RUNE_BY_ELEMENT]).toEqual([
      ['fire', 'passion-of-aldur'],
      ['lightning', 'ire-of-aldur'],
      ['cold', 'breath-of-aldur'],
      ['chaos', 'betrayal-of-aldur'],
    ]);
    expect(aldurEats('passion-of-aldur')).toEqual(['cold', 'lightning']);
    expect(aldurEats('betrayal-of-aldur')).toEqual(['fire', 'cold', 'lightning']);
    expect(aldurEats('kolrs-hunt')).toEqual([]); // not a converting rune
  });
});

describe('the sheet and the script', () => {
  const sheet = JSON.parse(readFileSync('data/patches/0.5.0/prices.json', 'utf8')) as {
    prices: Record<string, number>;
  };

  /**
   * `stepCost` charges 0 for a key the sheet lacks, so an unpriced rune reads as FREE and dominates
   * every frontier it can reach. The Aldur four have been priced for months; the Ancient Runes arrive
   * with the next refresh, which is why nothing may CHARGE for one until its key is there.
   */
  it('prices every Aldur rune', () => {
    for (const rune of ALDUR_RUNE_BY_ELEMENT.values()) {
      expect(sheet.prices[runePriceKey(rune)]).toBeGreaterThan(0);
    }
  });

  /**
   * `prices.mjs` runs under plain `node`, which cannot import this table, so it spells the ids out.
   * This is what stops the copy drifting: the script's list and the table are the same set, or the
   * refresh quietly stops pricing a rune the app charges for.
   */
  it('keeps the price script’s list equal to the table', () => {
    const script = readFileSync('tools/refresh/prices.mjs', 'utf8');
    const block = /const MODELLED_RUNES = new Set\(\[([\s\S]*?)\]\)/.exec(script)?.[1];
    expect(block, 'MODELLED_RUNES not found in prices.mjs').toBeDefined();
    const inScript = [...(block ?? '').matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1]);
    expect([...inScript].sort()).toEqual(RUNES.map((r) => r.id).sort());
  });
});
