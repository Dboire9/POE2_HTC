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

// "str_int" -> "Str/Int · Armour + ES" (defence hint helps players who think in defence type).
function variantLabel(base: EngineBase): string {
  const parts = variantSuffix(base).split('_').filter(Boolean);
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
      list.sort((a, b) => {
        const r = VARIANT_RANK.indexOf(variantSuffix(a)) - VARIANT_RANK.indexOf(variantSuffix(b));
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
          <select className={`${selectCls} min-w-44`} value={value} onChange={(e) => onChange(e.target.value)}>
            {variants.map((b) => <option key={b.id} value={b.id}>{variantLabel(b)}</option>)}
          </select>
        </label>
      )}
    </>
  );
};

export default BaseSelect;
