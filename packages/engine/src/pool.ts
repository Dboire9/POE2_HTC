import type { ItemState, Mod, PatchData, Tier } from './types.ts';

export function resolveMod(data: PatchData, id: string): Mod {
  const m = data.mods.get(id);
  if (!m) throw new Error(`unknown mod id: ${id}`);
  return m;
}

/**
 * Sum of tier weights of a mod within [floor, cap] ilvl, from tier index `minIndex` upward.
 * - `floor` = currency-strength minimum ilvl (base 0 / greater 35 / perfect 50).
 * - `cap`   = item level (a tier can only roll if its ilvl <= item level).
 * - `minIndex` = only count this tier and better ones (higher ilvl); default 0 = any tier.
 *
 * Mirrors ExaltAndRegalProbability.NormalCompute's weight accumulation.
 */
export function modTierWeight(mod: Mod, floor: number, cap: number, minIndex = 0): number {
  let w = 0;
  for (let i = minIndex; i < mod.tiers.length; i++) {
    const t: Tier = mod.tiers[i]!;
    if (t.ilvl >= floor && t.ilvl <= cap) w += t.weight;
  }
  return w;
}

/**
 * Total weight of a pool (list of mod ids) within [floor, cap] ilvl.
 * With `exclude`, mods whose family is already on the item are dropped — the real game can't roll a
 * family it already carries, so the denominator shrinks as the item fills (family exclusion, D6).
 * Omit `exclude` for the Java-parity denominator (Crafting_Item.get_Base_Affixes_Total_Weight_By_Tier,
 * which does NOT exclude).
 */
export function poolTotalWeight(
  data: PatchData, modIds: readonly string[], floor: number, cap: number, exclude?: ReadonlySet<string>,
): number {
  let total = 0;
  for (const id of modIds) {
    const mod = resolveMod(data, id);
    if (exclude && excluded(mod, exclude)) continue;
    total += modTierWeight(mod, floor, cap);
  }
  return total;
}

/**
 * EVERY exclusion group a mod belongs to. Usually one, but some mods legitimately span several — a
 * desecrated "+Str +Int" rolls in both the Strength and Intelligence groups and must be blocked by,
 * and block, mods in either. `families` carries the full list when there's more than one; `family`
 * stays the primary (it keys the poe2db weight join and is what the UI labels).
 *
 * An empty family means "no exclusion group" and yields none, so unrelated blank-family mods can
 * never collide.
 */
export const CRAFTED_SOURCES: ReadonlySet<Mod['source']> = new Set(['essence', 'perfect_essence']);

export function familiesOf(mod: Mod): readonly string[] {
  const own = mod.families && mod.families.length > 0 ? mod.families : mod.family ? [mod.family] : [];
  // A CRAFTED modifier — Essence, Perfect Essence or Alloy — excludes only other crafted modifiers.
  // Real items carry a rolled and a crafted modifier of one family side by side: Steelmage's jacket
  // holds +28% Lightning Resistance rolled beside +34% crafted, his sandals two Fire Resistances, and
  // xthefarmerx's ring another pair (poe.ninja, 2026-09-15; none of the three corrupted).
  //
  // Namespacing the GROUP is what makes that legal everywhere at once, because every exclusion in the
  // engine is decided through this function: pool denominators, the lattice's blocked bits, both
  // pickers. Two crafted mods of one family still collide — untraced, so it stays refused.
  return CRAFTED_SOURCES.has(mod.source) ? own.map((f) => `crafted:${f}`) : own;
}

/**
 * Does `mod` collide with a set of already-occupied families? True if ANY of its groups is taken.
 * This is the single place exclusion is decided — call it rather than testing `.family` directly,
 * or multi-family mods silently lose the groups beyond the first.
 */
export function excluded(mod: Mod, occupied: ReadonlySet<string>): boolean {
  return familiesOf(mod).some((f) => occupied.has(f));
}

/** Families currently present on the item (used for family-exclusion). A mod with no family has no
 * exclusion group and contributes none; a multi-family mod contributes all of its groups. */
export function itemFamilies(data: PatchData, item: ItemState): Set<string> {
  const fams = new Set<string>();
  for (const p of [...item.prefixes, ...item.suffixes]) {
    for (const f of familiesOf(resolveMod(data, p.modId))) fams.add(f);
  }
  return fams;
}

/** True if `mod` may still be added to `item` (none of its families is already present). A mod with
 * no family has no exclusion group and is always available. */
export function familyAvailable(data: PatchData, item: ItemState, mod: Mod): boolean {
  return !excluded(mod, itemFamilies(data, item));
}
