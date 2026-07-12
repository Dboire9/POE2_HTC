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
    if (exclude?.has(mod.family)) continue;
    total += modTierWeight(mod, floor, cap);
  }
  return total;
}

/** Families currently present on the item (used for family-exclusion). An empty family means the mod
 * has no exclusion group, so it's never tracked — otherwise unrelated blank-family mods would collide. */
export function itemFamilies(data: PatchData, item: ItemState): Set<string> {
  const fams = new Set<string>();
  for (const p of [...item.prefixes, ...item.suffixes]) {
    const fam = resolveMod(data, p.modId).family;
    if (fam) fams.add(fam);
  }
  return fams;
}

/** True if `mod` may still be added to `item` (its family isn't already present). A mod with no family
 * (empty) has no exclusion group and is always available. */
export function familyAvailable(data: PatchData, item: ItemState, mod: Mod): boolean {
  return mod.family === '' || !itemFamilies(data, item).has(mod.family);
}
