import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { loadShippedPatch } from '../../../packages/engine/src/loadPatch.ts';
import { loadFrozenPrices } from '../../../packages/optimizer/src/frozenPrices.ts';
import { SolveCancelled } from '../../lib/engineClient';
import type { EngineMarkovResult, EngineMethodResult, Method, TargetInput } from '../../lib/engineTypes';
import { methodRequest, methodSig, readMethod, type LabRequest } from '../../lib/methodRules';
import { runSolve, type SolveRequest, type SolveResult } from '../../lib/solve';
import CheckMyMethod from './CheckMyMethod';

// The panel against a real solve on the frozen sheet; only the worker is stood in for, so each test says
// when its check answers and with what. What a check FINDS is methodCheck.test.ts's.

const mocks = vi.hoisted(() => ({ solve: vi.fn() }));
vi.mock('../../lib/engineClient', async (orig) => ({
  ...(await orig<typeof import('../../lib/engineClient')>()),
  solve: mocks.solve,
}));

const data = loadShippedPatch('data/patches/0.5.0');
const engine = { data, prices: loadFrozenPrices() };
const anyTier = (modId: string): TargetInput => ({ modId, tierDisplay: data.mods.get(modId)!.tiers.length });
const targets = [anyTier('Wands/IncreasedMana'), anyTier('Wands/WeaponSpellDamage'), anyTier('Wands/Intelligence')];
const req: LabRequest = { kind: 'lab', from: { baseId: 'Wands', level: 82 }, targets, baseCost: 1 };
const markov = (runSolve(engine, req) as { markov: EngineMarkovResult }).markov;
/** What the worker answers to "Start from the best plan" on this craft: the short rules, checked. */
const fromBest = runSolve(engine, methodRequest(req, 'best', markov));

/** The next check the panel sends: answer it, fail it, or watch it be cancelled. */
function nextCheck() {
  let answer!: (r: SolveResult) => void;
  let fail!: (e: unknown) => void;
  const promise = new Promise<SolveResult>((res, rej) => { answer = res; fail = rej; });
  const cancel = vi.fn(() => fail(new SolveCancelled()));
  mocks.solve.mockReturnValueOnce({ promise, cancel });
  return {
    answer: (method: EngineMethodResult, prefilled?: { method: Method; faithful: boolean }) =>
      answer({ kind: 'method', method, ...(prefilled ? { prefilled } : {}) }),
    fail, cancel,
  };
}
const sent = (): SolveRequest => mocks.solve.mock.calls.at(-1)![0] as SolveRequest;

const ok: EngineMethodResult = {
  ok: true, cost: 120, best: { cost: 100, bound: 'exact' }, gap: 20,
  where: [{
    rule: 'Rule 2', where: 'Magic · +# to maximum Mana', node: markov.nodes[0]!, yourMove: 'Chaos', bestMove: 'Regal',
    visits: 0.042, costsYou: 15,
  }],
  elsewhere: { states: 3, costsYou: 5 },
  replay: {
    runs: 1000, seen: [], meanCost: 121, stdErr: 1, movesPerCraft: {}, spendByMove: [],
    costPercentiles: Array.from({ length: 101 }, (_, p) => p * 2),
  },
  keepsOffers: true,
  notes: ['Where your method plays a Desecration, it is costed keeping the offered modifier the best plan would keep.'],
};

const props = { engine, markov, req, run: 1, busy: false, rates: undefined };
const open = async (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: /^Check my method your own rules/ }));
const rules = (): HTMLElement[] => screen.queryAllByText(/^Rule \d+$/);

beforeEach(() => {
  localStorage.clear();
  mocks.solve.mockReset();
});

describe('Check my method', () => {
  it('is folded until asked for, and opens onto an Otherwise that starts over', async () => {
    const user = userEvent.setup();
    render(<CheckMyMethod {...props} />);
    expect(screen.queryByRole('combobox', { name: 'Otherwise, play' })).toBeNull();
    await open(user);
    expect(screen.getByRole('combobox', { name: 'Otherwise, play' })).toHaveValue('restart');
    expect(rules()).toHaveLength(0);
  });

  it('starts from the best plan: the worker writes its rules, they fill in, checked at once on the solve’s craft', async () => {
    const user = userEvent.setup();
    const check = nextCheck();
    render(<CheckMyMethod {...props} />);
    await open(user);
    await user.click(screen.getByRole('button', { name: 'Start from the best plan' }));

    await waitFor(() => expect(mocks.solve).toHaveBeenCalledTimes(1));
    expect(sent()).toMatchObject({
      kind: 'method', from: req.from, targets, baseCost: 1, method: 'best',
      best: { routes: markov.routes, bound: markov.bound },
    });
    expect(screen.getByRole('status')).toHaveTextContent('Working…');
    expect(screen.getByRole('button', { name: 'Check my method' })).toBeDisabled();

    const pre = fromBest.prefilled!;
    check.answer(ok, { method: pre.method, faithful: true });
    await waitFor(() => expect(rules()).toHaveLength(pre.method.rules.length));
    // Saved for this craft as soon as it is written.
    expect(readMethod(methodSig(req))).toEqual(pre.method);
    expect(screen.getByText(/These rules play a move as good as the best plan’s at every item they reach/)).toBeInTheDocument();
    expect(screen.queryByText(/You have changed your method since this check/)).toBeNull();

    expect(await screen.findByText(/^Your method:/)).toHaveTextContent(
      'Your method: 120 ex · Best plan: 100 ex · It costs you 20 ex (20%) more per finished item.');
    const where = screen.getByRole('region', { name: 'Where it costs you' });
    expect(within(where).getByText(/^Rule 2:/)).toHaveTextContent('Rule 2: your move Chaos · the best move Regal');
    expect(within(where).getByText(/^Costs you/)).toHaveTextContent(
      'Costs you 15 ex per finished item — your method is here 0.042 times a craft, on average.');
    expect(within(where).getByText(/^Elsewhere/)).toHaveTextContent('Elsewhere: 3 more item states cost you 5 ex together.');
    // The spread counts the white base each craft starts from, as Play it out does: the median play-out
    // cost 100 ex, and the 1 ex base makes it 101.
    expect(screen.getByText(/^Half the crafts cost less than/)).toHaveTextContent(/^Half the crafts cost less than 101 ex\./);
    expect(screen.getByRole('region', { name: 'What a craft can cost with your method' })).toHaveTextContent(
      '1,000 crafts played out, following your method; each counts the 1 ex base it starts from.');
    expect(screen.getByText(/costed keeping the offered modifier the best plan would keep/)).toBeInTheDocument();
  });

  it('against a best plan that is only a bound, shows the method’s cost alone and says why', async () => {
    const user = userEvent.setup();
    const check = nextCheck();
    render(<CheckMyMethod {...props} />);
    await open(user);
    await user.click(screen.getByRole('button', { name: 'Check my method' }));
    const { gap: _g, ...rest } = ok;
    check.answer({ ...rest, best: { cost: 100, bound: 'upper' }, where: [] });
    expect(await screen.findByText(/^Your method:/)).toHaveTextContent('Your method: 120 ex per finished item.');
    expect(screen.getByText(/only a bound/)).toHaveTextContent(
      'The best plan here is only a bound (≤ 100 ex), so the gap between the two cannot be measured.');
    expect(screen.queryByRole('region', { name: 'Where it costs you' })).toBeNull();
  });

  it('a stop says where and why, marks the rule, and no cost — until the rules change', async () => {
    const user = userEvent.setup();
    const check = nextCheck();
    render(<CheckMyMethod {...props} />);
    await open(user);
    await user.click(screen.getByRole('button', { name: '+ Add a rule' }));
    await user.click(screen.getByRole('button', { name: '+ Add a rule' }));
    await user.click(screen.getByRole('button', { name: 'Check my method' }));
    const message = 'Rule 2 says Regal, but it works on a Magic item, and here the item is already Rare. The item there: Rare · nothing on it.';
    check.answer({ ok: false, stop: { kind: 'not-possible', rule: 'Rule 2', message } });

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.getByText('Your method could not be costed')).toBeInTheDocument();
    expect(screen.queryByText(/^Your method:/)).toBeNull();
    const flagged = screen.getByText('The check stopped on this rule');
    expect(flagged.closest('li')).toHaveTextContent(/^Rule 2/);

    await user.selectOptions(screen.getByRole('combobox', { name: 'Rule 2, then play' }), 'exalt');
    await waitFor(() => expect(screen.queryByText('The check stopped on this rule')).toBeNull());
    expect(screen.getByText(/You have changed your method since this check/)).toBeInTheDocument();
  });

  it('the best plan’s rules with a later rule changed to never finish: that rule is marked, not Rule 1', async () => {
    // A player's report (2026-11-26): the mark sat on Rule 1 whatever rule was changed.
    const user = userEvent.setup();
    const filled = nextCheck();
    render(<CheckMyMethod {...props} />);
    await open(user);
    await user.click(screen.getByRole('button', { name: 'Start from the best plan' }));
    const pre = fromBest.prefilled!;
    filled.answer(fromBest.method, pre);
    await waitFor(() => expect(rules()).toHaveLength(pre.method.rules.length));
    // This craft's Essence twin lets two of the plan's items read alike (methodCheck.test.ts), and it says so.
    expect(pre.faithful).toBe(false);
    expect(screen.getByText(/These rules follow the best plan only in part/)).toBeInTheDocument();

    const r = pre.method.rules.findIndex((x) => x.move.currency === 'essence');
    expect(r).toBeGreaterThan(0);
    await user.selectOptions(screen.getByRole('combobox', { name: `Rule ${r + 1}, then play` }), 'annul');
    const check = nextCheck();
    await user.click(screen.getByRole('button', { name: 'Check my method' }));
    await waitFor(() => expect(mocks.solve).toHaveBeenCalledTimes(2));
    const changed = (sent() as Extract<SolveRequest, { kind: 'method' }>).method as Method;
    expect(changed.rules.map((x) => x.move.currency)).toEqual(pre.method.rules.map((x, k) => (k === r ? 'annul' : x.move.currency)));
    // The worker's own answer to that method.
    check.answer(runSolve(engine, methodRequest(req, changed, markov)).method);

    expect(await screen.findByText(/^Your method never finishes: Rule \d+ plays Annul/)).toBeInTheDocument();
    const flagged = screen.getByText('The check stopped on this rule');
    expect(flagged.closest('li')).toHaveTextContent(new RegExp(`^Rule ${r + 1}`));
    expect(screen.getAllByText('The check stopped on this rule')).toHaveLength(1);
  });

  it('waits while the Plan tab’s own solve runs, so it never cuts that solve short', async () => {
    const user = userEvent.setup();
    render(<CheckMyMethod {...props} busy />);
    await open(user);
    expect(screen.getByRole('button', { name: 'Check my method' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Start from the best plan' })).toBeDisabled();
    expect(screen.getByText('The check waits for the plan being worked out above.')).toBeInTheDocument();
    expect(mocks.solve).not.toHaveBeenCalled();
  });

  it('a check superseded by a new solve says nothing, and its result never lands on the new one', async () => {
    const user = userEvent.setup();
    const first = nextCheck();
    const { rerender } = render(<CheckMyMethod {...props} />);
    await open(user);
    await user.click(screen.getByRole('button', { name: 'Check my method' }));
    await waitFor(() => expect(mocks.solve).toHaveBeenCalledTimes(1));
    // The Plan tab computes again: the worker drops the check.
    first.fail(new SolveCancelled());
    await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
    expect(screen.queryByText(/The check failed/)).toBeNull();

    const second = nextCheck();
    await user.click(screen.getByRole('button', { name: 'Check my method' }));
    second.answer(ok);
    expect(await screen.findByText(/^Your method:/)).toBeInTheDocument();
    // A new solve on screen: the check was of the old one.
    rerender(<CheckMyMethod {...props} run={2} />);
    await waitFor(() => expect(screen.queryByText(/^Your method:/)).toBeNull());
  });

  it('leaving mid-check stops that check — and once it has answered, stops nothing', async () => {
    const user = userEvent.setup();
    const check = nextCheck();
    const { unmount } = render(<CheckMyMethod {...props} />);
    await open(user);
    await user.click(screen.getByRole('button', { name: 'Check my method' }));
    await waitFor(() => expect(mocks.solve).toHaveBeenCalledTimes(1));
    unmount();
    expect(check.cancel).toHaveBeenCalledTimes(1);

    const done = nextCheck();
    const again = render(<CheckMyMethod {...props} />);
    await open(user);
    await user.click(screen.getByRole('button', { name: 'Check my method' }));
    done.answer(ok);
    await screen.findByText(/^Your method:/);
    again.unmount();
    // The worker may be running the Plan tab's next solve by now; a stale cancel would stop it.
    expect(done.cancel).not.toHaveBeenCalled();
  });

  it('adds, moves and removes rules, and keeps them for this craft only', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<CheckMyMethod {...props} />);
    await open(user);
    await user.click(screen.getByRole('button', { name: '+ Add a rule' }));
    await user.click(screen.getByRole('button', { name: '+ Add a rule' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Rule 1, then play' }), 'annul');
    await user.click(screen.getByRole('button', { name: 'Move rule 1 down' }));
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Rule 2, then play' })).toHaveValue('annul'));
    expect(screen.getByRole('combobox', { name: 'Rule 1, then play' })).toHaveValue('chaos');
    expect(screen.getByRole('button', { name: 'Move rule 1 up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move rule 2 down' })).toBeDisabled();

    // A test on a slot, named by its target; then a second test, then the first removed.
    await user.selectOptions(screen.getByRole('combobox', { name: 'Rule 2, If test 1: what it reads' }), 'slot:1');
    expect(screen.getByRole('combobox', { name: 'Rule 2, If test 1: what it reads' })).toHaveDisplayValue('#% increased Spell Damage');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Rule 2, If test 1: is it on the item' }), 'missing');
    await user.click(screen.getByRole('button', { name: 'Add a test to rule 2' }));
    expect(screen.getByRole('combobox', { name: 'Rule 2, and test 2: what it reads' })).toHaveValue('rarity');
    await user.click(screen.getByRole('button', { name: 'Remove test 1 from rule 2' }));
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Rule 2, If test 1: what it reads' })).toHaveValue('rarity'));

    await user.click(screen.getByRole('button', { name: 'Remove rule 1' }));
    await waitFor(() => expect(rules()).toHaveLength(1));
    expect(screen.getByRole('combobox', { name: 'Rule 1, then play' })).toHaveValue('annul');

    // The same craft again — another visit — finds its rules; another craft starts empty.
    unmount();
    const back = render(<CheckMyMethod {...props} />);
    await open(user);
    expect(screen.getByRole('combobox', { name: 'Rule 1, then play' })).toHaveValue('annul');
    back.unmount();
    render(<CheckMyMethod {...props} req={{ ...req, targets: targets.slice(0, 2) }} />);
    await open(user);
    expect(rules()).toHaveLength(0);
  });

  it('offers only moves the player has, and the omens and strengths they have', async () => {
    const user = userEvent.setup();
    const excluded = ['regal', 'regal_greater', 'regal_perfect', 'exalt_perfect', 'OmenofSinistralExaltation'];
    render(<CheckMyMethod {...props} req={{ ...req, excluded }} />);
    await open(user);
    await user.click(screen.getByRole('button', { name: '+ Add a rule' }));
    const move = screen.getByRole('combobox', { name: 'Rule 1, then play' });
    const offered = within(move).getAllByRole('option').map((o) => o.textContent);
    expect(offered).toContain('Exalted Orb');
    expect(offered).toContain('Essence for #% increased Spell Damage');
    expect(offered).not.toContain('Regal Orb');
    await user.selectOptions(move, 'exalt');
    const strengths = within(screen.getByRole('combobox', { name: 'Rule 1, then play: strength' })).getAllByRole('option');
    expect(strengths.map((o) => o.textContent)).toEqual(['Basic', 'Greater']);
    const omens = within(screen.getByRole('combobox', { name: 'Rule 1, then play: omen' })).getAllByRole('option');
    expect(omens.map((o) => o.textContent)).toEqual(['no side omen', 'with Omen of Dextral Exaltation']);
  });
});
