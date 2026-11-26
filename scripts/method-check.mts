// How long "Check my method" takes, stage by stage, on the craft a maintainer timed out on (2026-11-26):
// a white Wand at item level 82, five T1 targets — Chaos Damage, the Spell Damage + Mana hybrid, Spell
// Damage, Cast Speed, Critical Hit Chance for Spells — on the live sheet, at a Search effort.
//
//   npx tsx scripts/method-check.mts [effort] [five|three]
//
// It runs the Plan tab's solve as the UI sends it (`runSolve`, `kind: 'lab'`), then the two requests the
// panel sends (`methodRequest`): "Start from the best plan" (`method: 'best'`) and "Check my method" with
// a short hand-written method. Per request: the total, the time in each stage the panel names, and what
// came back. At Standard the five-mod craft answers with the plan without Desecration as a ceiling; at
// Exhaustive it settles exactly — the two cases the check has to read the best plan from.
//
// The gate: each request answers in under GATE_SECONDS, and "Start from the best plan" shortens to the end
// (`complete`). Before 2026-11-26 the first never answered (stopped after six minutes) at Exhaustive and
// answered "raise Search effort" after a 15-second solve at Standard.
import { loadShippedPatch } from '../packages/engine/src/loadPatch.ts';
import { loadPrices } from '../packages/optimizer/src/loadPrices.ts';
import { runSolve, type SolveProgress } from '../src/lib/solve.ts';
import { limitsFor } from '../src/lib/searchEffort.ts';
import { methodRequest, type LabRequest } from '../src/lib/methodRules.ts';
import type { Method, TargetInput } from '../src/lib/engineTypes.ts';

const GATE_SECONDS = 20;
const effort = process.argv[2] ?? 'standard';
const which = process.argv[3] ?? 'five';
const data = loadShippedPatch('data/patches/0.5.0');
const eng = { data, prices: loadPrices('data/patches/0.5.0') };
const T1 = (modId: string): TargetInput => ({ modId, tierDisplay: 1 });
const CRAFTS: Record<string, TargetInput[]> = {
  five: ['Wands/ChaosDamageWeaponPrefix', 'Wands/WeaponSpellDamageAndMana', 'Wands/WeaponSpellDamage',
    'Wands/IncreasedCastSpeed', 'Wands/SpellCriticalStrikeChance'].map(T1),
  three: ['Wands/WeaponSpellDamage', 'Wands/IncreasedCastSpeed', 'Wands/SpellCriticalStrikeChance'].map(T1),
};
/** Up the rarities, then Exalt while a side has room; start over when none does. */
const HAND: Method = {
  rules: [
    { when: [{ kind: 'rarity', is: 'normal' }], move: { currency: 'transmute', strength: 'base' } },
    { when: [{ kind: 'rarity', is: 'magic' }], move: { currency: 'regal', strength: 'base' } },
    { when: [{ kind: 'rarity', is: 'rare' }, { kind: 'open', side: 'prefix', op: '>=', n: 1 }], move: { currency: 'exalt', strength: 'base' } },
    { when: [{ kind: 'rarity', is: 'rare' }, { kind: 'open', side: 'suffix', op: '>=', n: 1 }], move: { currency: 'exalt', strength: 'base' } },
  ],
  otherwise: { currency: 'restart' },
};

const lab: LabRequest = { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets: CRAFTS[which]!, effort: limitsFor(effort) };
let t0 = performance.now();
const solved = runSolve(eng, lab);
const m = solved.markov;
console.log(`${which} at ${effort}: Plan tab solve ${((performance.now() - t0) / 1000).toFixed(1)} s — `
  + `${Math.round(m.expectedCost).toLocaleString('en-US')} ex, bound ${m.bound}${m.withoutBones ? ', the plan without Desecration' : ''}, `
  + `${m.routes?.keys.length ?? 'no'} states`);

let bad = 0;
for (const [name, method] of [['Start from the best plan', 'best'], ['Check my method (by hand)', HAND]] as const) {
  const stages: [string, number][] = [];
  t0 = performance.now();
  const got = runSolve(eng, methodRequest(lab, method, m), (p: SolveProgress) => {
    if (stages.at(-1)?.[0] !== p.phase) stages.push([p.phase, performance.now()]);
  });
  const end = performance.now();
  const total = (end - t0) / 1000;
  const each = stages.map(([ph, t], k) => `${ph} ${(((stages[k + 1]?.[1] ?? end) - t) / 1000).toFixed(2)} s`).join(' · ');
  const r = got.method;
  const said = r.ok ? `costs ${Math.round(r.cost).toLocaleString('en-US')} ex (best ${r.best.bound} ${Math.round(r.best.cost).toLocaleString('en-US')})`
    : `stops: ${r.stop.message.slice(0, 90)}`;
  const pre = got.prefilled;
  const rules = pre ? ` · ${pre.method.rules.length} rules, ${pre.faithful ? 'faithful' : 'in part'}${pre.complete ? '' : ', STOPPED EARLY'}` : '';
  const late = total > GATE_SECONDS || (pre !== undefined && !pre.complete);
  if (late) bad++;
  console.log(`  ${name.padEnd(26)} ${total.toFixed(2).padStart(6)} s  [${each}]  ${said}${rules}${late ? '  ← OVER' : ''}`);
}
console.log(bad === 0 ? 'GATE PASSED' : `GATE FAILED on ${bad}`);
process.exit(bad === 0 ? 0 : 1);
