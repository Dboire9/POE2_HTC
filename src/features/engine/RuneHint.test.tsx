import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import RuneHint from './RuneHint';
import { loadShippedPatch } from '../../../packages/engine/src/loadPatch.ts';
import type { Rates } from '../../lib/currency';

// The browser's copy of the patch: this hint runs in the app, where `tiers[].stats` is never downloaded.
// Against the full file it passed while the app showed no hint at all.
const data = loadShippedPatch('data/patches/0.5.0');
const RATES: Rates = { chaos: 15.55, divine: 190 };
const PRICED = { 'rune:passion-of-aldur': 12.13 };
const FIRE = 'Staves/DamageGainedAsFire';
const COLD = 'Staves/DamageGainedAsCold';

afterEach(cleanup);

/** The hint is one sentence built from several interpolations, so React splits it across text nodes
 *  and a per-node query would miss phrases that plainly render. Read what the panel actually says. */
const show = (modIds: string[], prices: Record<string, number> | undefined = PRICED): string =>
  render(<RuneHint data={data} baseId="Staves" modIds={modIds} prices={prices} rates={RATES} />)
    .container.textContent ?? '';

describe('the rune hint', () => {
  it('says nothing until two of them are chosen', () => {
    expect(show([FIRE])).toBe('');
  });

  it('says nothing for targets it has no route for', () => {
    expect(show(['Staves/Intelligence', 'Staves/WeaponSpellDamage'])).toBe('');
  });

  it('names the rune, the result and the price once two are chosen', () => {
    const text = show([FIRE, COLD]);
    expect(text).toMatch(/passion-of-aldur/);
    expect(text).toMatch(/2× fire/);
    expect(text).toMatch(/12\.1 ex/);
  });

  /**
   * Both costs beyond the price, stated because neither is in the plan's arithmetic: the rune is
   * SOCKETED rather than spent, and it converts every one of them — so a sibling the player meant to
   * keep does not survive. A price with those omitted would read as the whole cost.
   */
  it('states the socket it spends and the conversion it forces', () => {
    const text = show([FIRE, COLD]);
    expect(text).toMatch(/rune socket/);
    expect(text).toMatch(/EVERY/);
  });

  /**
   * `stepCost` charges 0 for a key the sheet lacks, so an absent price is a FREE rune everywhere else
   * in this app. Here it must simply go unmentioned — quoting "0 ex" would be the same lie in words.
   */
  it('quotes no price at all when the sheet has none, rather than quoting zero', () => {
    const text = show([FIRE, COLD], {});
    expect(text).toMatch(/passion-of-aldur/);
    expect(text).not.toMatch(/ex\b/);
  });

  it('says nothing on a base that cannot roll them', () => {
    const { container } = render(
      <RuneHint data={data} baseId="Rings" modIds={['Rings/AllResistances', 'Rings/ChaosResistance']}
        prices={PRICED} rates={RATES} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing for a base id that does not exist', () => {
    const { container } = render(
      <RuneHint data={data} baseId="NotABase" modIds={[FIRE, COLD]} prices={PRICED} rates={RATES} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
