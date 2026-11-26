import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../../components/ui/button';
import type { Engine, EngineMarkovResult } from '../../lib/engine';
import type { EngineMethodResult, Method, MethodRule, MoveSpec } from '../../lib/engineTypes';
import type { Rates } from '../../lib/currency';
import {
  emptyMethod, methodCraftInfo, methodRequest, methodSig, newRule, readMethod, writeMethod, type LabRequest,
} from '../../lib/methodRules';
import { cn } from '../../lib/utils';
import MethodResult from './MethodResult';
import MethodRuleRow, { MoveEditor } from './MethodRuleRow';
import SolveProgress from './SolveProgress';
import { useSolveRunner } from './useSolveRunner';

/** A check that came back, with what it was a check of: the solve on screen, and the rules as they were. */
interface Checked {
  readonly run: number;
  readonly method: string;
  readonly result: EngineMethodResult;
}

/** "Rule 3" → 2, "Otherwise" → 'otherwise': the row a stop names. */
const rowOf = (rule: string | undefined): number | 'otherwise' | undefined => {
  if (rule === 'Otherwise') return 'otherwise';
  const n = rule?.match(/^Rule (\d+)$/)?.[1];
  return n === undefined ? undefined : Number(n) - 1;
};

/**
 * "Check my method" — the player's own way of crafting, written as rules, costed exactly against the
 * best plan above it (packages/optimizer/src/markovMethod.ts, through the `kind: 'method'` request).
 * Folded until asked for. The Plan tab only, on the trade market's prices: a check prices moves, and the
 * found sheet's numbers are no price.
 *
 * ONE SOLVE AT A TIME. The worker runs one solve and a new one terminates the one in flight
 * (engineClient.ts), and its `cancel` stops WHATEVER is in flight. So: the check waits while the Plan
 * tab's own solve runs (`busy`) — it would otherwise kill that solve's result — and a Compute or Play it
 * out pressed while a check runs simply supersedes the check, whose runner swallows the cancel. A check
 * belongs to the solve on screen (`run`, the Plan tab's `markovRun`): a new solve hides it, and the panel
 * is keyed by the craft (`methodSig`), so another craft starts from its own saved rules. Leaving the tab
 * mid-check stops that check, and only that check.
 */
const CheckMyMethod: React.FC<{
  engine: Engine;
  markov: EngineMarkovResult;
  /** The request behind the result on screen — the check rebuilds exactly its craft. */
  req: LabRequest;
  /** Which solve is on screen (`markovRun`): a check of an older one is not shown. */
  run: number;
  /** The Plan tab's own solve is running: the check waits for it. */
  busy: boolean;
  rates: Rates | undefined;
  budget?: number | undefined;
  sale?: number | undefined;
}> = ({ engine, markov, req, run, busy, rates, budget, sale }) => {
  const info = useMemo(() => methodCraftInfo(engine.data, req, markov.routes), [engine, req, markov.routes]);
  const sig = methodSig(req);
  const [open, setOpen] = useState(false);
  const [method, setMethodState] = useState<Method>(() => readMethod(sig) ?? emptyMethod(info));
  const [prefilled, setPrefilled] = useState<{ readonly faithful: boolean } | null>(null);
  const [checked, setChecked] = useState<Checked | null>(null);
  const [error, setError] = useState<string | null>(null);
  const runner = useSolveRunner();

  // Leaving the tab mid-check stops the check. Only the check: the runner's `cancel` does nothing once
  // its own run has settled — answered, or superseded by the Plan tab's next solve (useSolveRunner).
  const cancelRef = useRef(runner.cancel);
  useEffect(() => { cancelRef.current = runner.cancel; });
  useEffect(() => () => cancelRef.current(), []);

  const setMethod = (m: Method): void => {
    setMethodState(m);
    writeMethod(sig, m);
  };
  const setRules = (rules: readonly MethodRule[]): void => {
    setMethod({ ...method, rules });
    setPrefilled(null);
  };

  /** Check `m` — or, for 'best', have the worker write the best plan as rules, fill them in and check them. */
  const check = (m: Method | 'best'): void => {
    setError(null);
    const asked = m === 'best' ? method : m;
    runner.run(methodRequest(req, m, markov), {
      onResult: (res) => {
        if (res.kind !== 'method') return;
        if (res.prefilled) {
          setMethod(res.prefilled.method);
          setPrefilled({ faithful: res.prefilled.faithful });
        }
        setChecked({ run, method: JSON.stringify(res.prefilled?.method ?? asked), result: res.method });
      },
      onError: (e, appUpdated) => setError(appUpdated
        ? 'The site was updated since this tab was opened. Reload the page to check your method.'
        : `The check failed: ${e instanceof Error ? e.message : String(e)}`),
    });
  };

  const startFromBest = (): void => check('best');

  const shown = checked && checked.run === run ? checked : null;
  const stale = shown !== null && shown.method !== JSON.stringify(method);
  const stopAt = shown && !stale && !shown.result.ok ? rowOf(shown.result.stop.rule) : undefined;
  const waiting = busy || runner.computing;

  const moveRule = (i: number, by: -1 | 1): void => {
    const j = i + by;
    if (j < 0 || j >= method.rules.length) return;
    const next = [...method.rules];
    [next[i], next[j]] = [next[j]!, next[i]!];
    setRules(next);
  };

  return (
    <section aria-label="Check my method" className="rounded-md border border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Check my method</span>{' '}
        <span className="text-xs text-muted-foreground">
          your own rules, costed against the best plan <span aria-hidden="true">{open ? '▾' : '▸'}</span>
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-border px-3 pb-3 pt-2 text-sm">
          <p className="text-[11px] text-muted-foreground">
            Write how you craft as rules, read top to bottom: at each item the first rule whose tests all hold
            says the move, and <strong>Otherwise</strong> plays where none does. A test reads a modifier you
            want as a whole slot — any of its alternatives. The check costs your rules exactly on this craft,
            at the prices above, and shows where they lose against the best plan.
          </p>

          {method.rules.length > 0 && (
            <ol className="space-y-2">
              {method.rules.map((rule, i) => (
                <MethodRuleRow
                  key={i} index={i} count={method.rules.length} rule={rule} info={info} flagged={stopAt === i}
                  onChange={(r) => setRules(method.rules.map((x, k) => (k === i ? r : x)))}
                  onRemove={() => setRules(method.rules.filter((_, k) => k !== i))}
                  onMove={(by) => moveRule(i, by)}
                />
              ))}
            </ol>
          )}
          <div className={cn('space-y-1.5 rounded-md border border-dashed border-border p-2', stopAt === 'otherwise' && 'border-solid border-destructive ring-1 ring-destructive')}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold">Otherwise</span>
              {stopAt === 'otherwise' && <span className="text-xs font-medium text-destructive">The check stopped on this rule</span>}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">play</span>
              <MoveEditor
                m={method.otherwise} info={info} name="Otherwise, play"
                onChange={(otherwise: MoveSpec) => { setMethod({ ...method, otherwise }); setPrefilled(null); }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setRules([...method.rules, newRule(info)])}>+ Add a rule</Button>
            {markov.routes && (
              <Button size="sm" variant="outline" onClick={startFromBest} disabled={waiting}>Start from the best plan</Button>
            )}
            {method.rules.length > 0 && (
              <Button size="sm" variant="ghost" onClick={() => setRules([])}>Remove every rule</Button>
            )}
            <Button size="sm" onClick={() => check(method)} disabled={waiting}>Check my method</Button>
          </div>
          {prefilled && (
            <p className="text-[11px] text-muted-foreground">
              {prefilled.faithful
                ? 'These rules play a move as good as the best plan’s at every item they reach, so they cost what it costs. Each rule keeps only the tests needed to tell those items apart.'
                : 'These rules follow the best plan only in part: some of its items read alike to every rule, so the earlier rule plays at both.'}
            </p>
          )}
          {busy && !runner.computing && (
            <p className="text-[11px] text-muted-foreground">The check waits for the plan being worked out above.</p>
          )}
          {runner.computing && <SolveProgress progress={runner.progress} onCancel={runner.cancel} />}
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div aria-live="polite">
            {shown && (
              <MethodResult
                result={shown.result} first={markov.restartCost ?? 0} rates={rates} budget={budget} sale={sale} stale={stale}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default CheckMyMethod;
