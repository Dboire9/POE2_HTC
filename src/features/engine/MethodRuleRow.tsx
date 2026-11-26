import React from 'react';
import type { Condition, MethodRule, MoveSpec } from '../../lib/engineTypes';
import {
  BONES, COMPARES, ECHOES_LABEL, RARITIES, SLOT_STATES, bossOptions, defaultCondition, defaultMove, echoesOffered,
  gradeOptions, moveKindOf, moveKindOptions, omenOf, omenOptions, subjectOf, subjectOptions, withOmen,
  type MethodCraftInfo, type OptionGroup,
} from '../../lib/methodRules';
import { cn } from '../../lib/utils';
import { FOCUS_RING, selectCls } from './ui';

// One row of a method: its tests ("if … and …") and its move ("then play …"), as native selects — the
// Plan tab's own controls (LabTargets.tsx). Every select is named for screen readers by the words beside
// it, with the rule's number, so "Rule 2, then play" is reachable by voice as it reads.

const sel = cn(selectCls, 'max-w-full');
const iconBtn = cn('px-1 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed', FOCUS_RING);
/** Counts a test compares with: a side holds at most a few modifiers, both sides together a few more. */
const COUNTS = [0, 1, 2, 3, 4, 5, 6];

const Groups: React.FC<{ groups: readonly OptionGroup[] }> = ({ groups }) => (
  <>
    {groups.map((g) => (
      <optgroup key={g.label} label={g.label}>
        {g.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </optgroup>
    ))}
  </>
);

/** One test: what it reads, then how it reads. */
const ConditionEditor: React.FC<{
  c: Condition; info: MethodCraftInfo; name: string; onChange: (c: Condition) => void;
}> = ({ c, info, name, onChange }) => {
  const rest = (() => {
    switch (c.kind) {
      case 'slot':
        return (
          <select className={sel} aria-label={`${name}: is it on the item`} value={c.is}
            onChange={(e) => onChange({ ...c, is: e.target.value as typeof c.is })}>
            {SLOT_STATES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        );
      case 'junk': case 'open':
        return (
          <>
            <select className={sel} aria-label={`${name}: compared`} value={c.op}
              onChange={(e) => onChange({ ...c, op: e.target.value as typeof c.op })}>
              {COMPARES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select className={sel} aria-label={`${name}: how many`} value={c.n}
              onChange={(e) => onChange({ ...c, n: Number(e.target.value) })}>
              {[...new Set([...COUNTS, c.n])].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </>
        );
      case 'rarity':
        return (
          <select className={sel} aria-label={`${name}: rarity is`} value={c.is}
            onChange={(e) => onChange({ ...c, is: e.target.value as typeof c.is })}>
            {RARITIES.map((o) => <option key={o.value} value={o.value}>is {o.label}</option>)}
          </select>
        );
      case 'bone':
        return (
          <select className={sel} aria-label={`${name}: which`} value={c.is}
            onChange={(e) => onChange({ ...c, is: e.target.value as typeof c.is })}>
            {BONES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        );
    }
  })();
  return (
    <>
      <select className={sel} aria-label={`${name}: what it reads`} value={subjectOf(c)}
        onChange={(e) => onChange(defaultCondition(e.target.value))}>
        <Groups groups={subjectOptions(info)} />
      </select>
      {rest}
    </>
  );
};

/** A move: which currency, then its strength (or bone), its side omen, and a Desecration's other omens. */
export const MoveEditor: React.FC<{
  m: MoveSpec; info: MethodCraftInfo; name: string; onChange: (m: MoveSpec) => void;
}> = ({ m, info, name, onChange }) => {
  const grades = gradeOptions(m, info);
  const omens = omenOptions(m, info);
  const bosses = bossOptions(m, info);
  return (
    <>
      <select className={sel} aria-label={name} value={moveKindOf(m)} onChange={(e) => onChange(defaultMove(e.target.value, info))}>
        <Groups groups={moveKindOptions(info, m)} />
      </select>
      {grades.length > 0 && (
        <select
          className={sel} aria-label={`${name}: ${m.currency === 'desecrate' ? 'bone' : 'strength'}`}
          value={m.currency === 'desecrate' ? (m.ancient ? 'ancient' : 'preserved') : 'strength' in m ? m.strength : ''}
          onChange={(e) => {
            const v = e.target.value;
            if (m.currency === 'desecrate') {
              const { ancient: _a, ...plain } = m;
              onChange(v === 'ancient' ? { ...plain, ancient: true } : plain);
            } else if ('strength' in m) onChange({ ...m, strength: v as typeof m.strength });
          }}
        >
          {grades.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}
      {omens.length > 1 && (
        <select className={sel} aria-label={`${name}: omen`} value={omenOf(m)} onChange={(e) => onChange(withOmen(m, e.target.value))}>
          {omens.map((o) => <option key={o.value} value={o.value}>{o.value === '' ? o.label : `with ${o.label}`}</option>)}
        </select>
      )}
      {m.currency === 'desecrate' && bosses.length > 1 && (
        <select className={sel} aria-label={`${name}: boss omen`} value={m.boss ?? ''}
          onChange={(e) => {
            const { boss: _b, ...plain } = m;
            onChange(e.target.value === '' ? plain : { ...plain, boss: e.target.value as NonNullable<typeof m.boss> });
          }}>
          {bosses.map((o) => <option key={o.value} value={o.value}>{o.value === '' ? o.label : `with ${o.label}`}</option>)}
        </select>
      )}
      {m.currency === 'desecrate' && echoesOffered(m, info) && (
        <label className="inline-flex items-center gap-1.5 text-xs">
          <input
            type="checkbox" checked={m.echoes === true}
            onChange={(e) => {
              const { echoes: _e, ...plain } = m;
              onChange(e.target.checked ? { ...plain, echoes: true } : plain);
            }}
          />
          <span>with {ECHOES_LABEL}</span>
        </label>
      )}
    </>
  );
};

/** One rule of a method. `flagged`: the last check stopped on this rule. */
const MethodRuleRow: React.FC<{
  index: number; count: number; rule: MethodRule; info: MethodCraftInfo; flagged: boolean;
  onChange: (r: MethodRule) => void; onRemove: () => void; onMove: (by: -1 | 1) => void;
}> = ({ index, count, rule, info, flagged, onChange, onRemove, onMove }) => {
  const n = index + 1;
  const setTest = (j: number, c: Condition): void => onChange({ ...rule, when: rule.when.map((x, k) => (k === j ? c : x)) });
  return (
    <li className={cn('space-y-1.5 rounded-md border border-border p-2', flagged && 'border-destructive ring-1 ring-destructive')}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold">Rule {n}</span>
        {flagged && <span className="text-xs font-medium text-destructive">The check stopped on this rule</span>}
        <span className="ml-auto flex items-center gap-0.5">
          <button type="button" className={iconBtn} onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move rule ${n} up`} title="Move up">
            <span aria-hidden="true">↑</span>
          </button>
          <button type="button" className={iconBtn} onClick={() => onMove(1)} disabled={index === count - 1} aria-label={`Move rule ${n} down`} title="Move down">
            <span aria-hidden="true">↓</span>
          </button>
          <button type="button" className={cn(iconBtn, 'hover:text-destructive')} onClick={onRemove} aria-label={`Remove rule ${n}`} title="Remove">
            <span aria-hidden="true">✕</span>
          </button>
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-sm">
        {rule.when.length === 0 && <span className="text-muted-foreground">Always</span>}
        {rule.when.map((c, j) => {
          const word = j === 0 ? 'If' : 'and';
          return (
            <span key={j} className="flex max-w-full flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">{word}</span>
              <ConditionEditor c={c} info={info} name={`Rule ${n}, ${word} test ${j + 1}`} onChange={(x) => setTest(j, x)} />
              <button
                type="button" className={cn(iconBtn, 'hover:text-destructive')}
                onClick={() => onChange({ ...rule, when: rule.when.filter((_, k) => k !== j) })}
                aria-label={`Remove test ${j + 1} from rule ${n}`} title="Remove this test"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </span>
          );
        })}
        <button
          type="button"
          className={cn('rounded border border-dashed border-border px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground', FOCUS_RING)}
          onClick={() => onChange({ ...rule, when: [...rule.when, defaultCondition('rarity')] })}
          aria-label={`Add a test to rule ${n}`}
        >
          + Add a test
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-sm">
        <span className="text-xs text-muted-foreground">then play</span>
        <MoveEditor m={rule.move} info={info} name={`Rule ${n}, then play`} onChange={(move) => onChange({ ...rule, move })} />
      </div>
    </li>
  );
};

export default MethodRuleRow;
