import React, { useMemo } from 'react';
import type { EngineBase } from '../../lib/engine';

// Two-level base picker: a CATEGORY menu (Helmets, Body Armours, Wands, …) plus a VARIANT menu that
// appears only when the category has attribute variants (the armour/shield Str/Dex/Int splits). Weapons
// and jewellery are a single base, so they show just the category menu. Drop-in for a flat base <select>:
// controlled by `value` (the base id) + `onChange(baseId)`.

const selectCls =
  'h-9 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring';
const labelCls = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground';

// "Body_Armours" -> "Body Armours"; "OneHand_Maces" -> "One Hand Maces".
function categoryLabel(category: string): string {
  return category.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
}

// The attribute suffix of a base id, e.g. Helmets_str_int (category Helmets) -> "str_int" ("" if none).
function variantSuffix(base: EngineBase): string {
  return base.id.startsWith(base.category) ? base.id.slice(base.category.length).replace(/^_/, '') : '';
}

const ATTR: Record<string, string> = { str: 'Str', dex: 'Dex', int: 'Int' };
const DEFENCE: Record<string, string> = { str: 'Armour', dex: 'Evasion', int: 'ES' };
// Show single attributes first (Str/Dex/Int), then the hybrids, in a stable, intuitive order.
const VARIANT_RANK = ['str', 'dex', 'int', 'str_dex', 'str_int', 'dex_int'];

/**
 * The second axis a category can split on: a wand or staff base locked to ONE spell element.
 *
 * A Frigid Wand rolls cold spell mods and no others — the base carries `no_fire_spell_mods` and the
 * rest, and the 10 gated mod groups are simply absent from its pool. Ranked with the unrestricted
 * base first, because that is what most bases are (9 of 18 wands) and what the id `Wands` has always
 * meant.
 */
const ELEMENT_RANK = ['', 'fire', 'cold', 'lightning', 'physical', 'chaos'];
const ELEMENT: Record<string, string> = {
  fire: 'Fire', cold: 'Cold', lightning: 'Lightning', physical: 'Physical', chaos: 'Chaos',
};

/**
 * Which game bases a row covers, shortened for a dropdown.
 *
 * The data carries every one — "Acrid Wand, Attuned Wand, Critical Wand, …" for the unrestricted row —
 * because a player picks by the name on the item in their stash, and a row that only said "Any
 * element" would leave them guessing which of their wands that is. Eight names do not fit in a
 * `<select>`, so two are shown and the rest counted; the full list rides in the `title`.
 */
function shortNames(name: string): string {
  const all = name.split(', ').filter(Boolean);
  if (all.length <= 2) return all.join(', ');
  return `${all.slice(0, 2).join(', ')} +${all.length - 2}`;
}

// "str_int" -> "Str/Int · Armour + ES" (defence hint helps players who think in defence type).
// "cold"    -> "Cold · Frigid Wand".  "" in an element-split category -> "Any element · Acrid, … +6".
function variantLabel(base: EngineBase, elementSplit: boolean): string {
  const suffix = variantSuffix(base);
  if (elementSplit) {
    const head = suffix === '' ? 'Any element' : `${ELEMENT[suffix] ?? suffix} only`;
    return base.name && base.name !== base.id ? `${head} · ${shortNames(base.name)}` : head;
  }
  const parts = suffix.split('_').filter(Boolean);
  if (parts.length === 0) return base.name;
  const attrs = parts.map((p) => ATTR[p] ?? p).join('/');
  const defs = parts.map((p) => DEFENCE[p]).filter(Boolean).join(' + ');
  return defs ? `${attrs} · ${defs}` : attrs;
}

export interface BaseSelectProps {
  readonly bases: readonly EngineBase[];
  readonly value: string;
  readonly onChange: (baseId: string) => void;
}

export const BaseSelect: React.FC<BaseSelectProps> = ({ bases, value, onChange }) => {
  const byCategory = useMemo(() => {
    const m = new Map<string, EngineBase[]>();
    for (const b of bases) (m.get(b.category) ?? m.set(b.category, []).get(b.category)!).push(b);
    for (const list of m.values()) {
      // A category splits on ONE axis — attributes or spell element, never both — so which ranking to
      // sort by is decided by which suffixes are actually present rather than by a list of categories
      // kept in step by hand.
      const byElement = list.some((b) => ELEMENT[variantSuffix(b)] !== undefined);
      const rank = byElement ? ELEMENT_RANK : VARIANT_RANK;
      list.sort((a, b) => {
        const r = rank.indexOf(variantSuffix(a)) - rank.indexOf(variantSuffix(b));
        return r !== 0 ? r : a.name.localeCompare(b.name);
      });
    }
    return m;
  }, [bases]);

  const categories = useMemo(
    () => [...byCategory.keys()].sort((a, b) => categoryLabel(a).localeCompare(categoryLabel(b))),
    [byCategory],
  );

  const current = bases.find((b) => b.id === value);
  const category = current?.category ?? '';
  const variants = byCategory.get(category) ?? [];
  const elementSplit = variants.some((b) => ELEMENT[variantSuffix(b)] !== undefined);

  const selectCategory = (cat: string) => onChange((byCategory.get(cat) ?? [])[0]?.id ?? '');

  return (
    <>
      <label className="flex flex-col gap-1">
        <span className={labelCls}>Base</span>
        <select className={`${selectCls} min-w-44`} value={category} onChange={(e) => selectCategory(e.target.value)}>
          {categories.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
        </select>
      </label>
      {variants.length > 1 && (
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Variant</span>
          <select
            className={`${selectCls} min-w-44`} value={value}
            onChange={(e) => onChange(e.target.value)}
            title={current && current.name !== current.id ? current.name : undefined}
          >
            {variants.map((b) => (
              <option key={b.id} value={b.id} title={b.name !== b.id ? b.name : undefined}>
                {variantLabel(b, elementSplit)}
              </option>
            ))}
          </select>
        </label>
      )}
    </>
  );
};

export default BaseSelect;
