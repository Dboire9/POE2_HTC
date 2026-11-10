// What the price sheet tells players about itself (priceProvenance.mjs): every price that is not live
// market data is named, and a sheet with any such price never calls itself fully live.

import { describe, it, expect } from 'vitest';
import { omenName, omenPageUrl, priceProvenance } from './priceProvenance.mjs';

describe('priceProvenance', () => {
  it('names omens that fell back to the hand-copied quotes, with the quote date', () => {
    const p = priceProvenance({
      inferredEssences: 0,
      fallbackOmens: ['OmenoftheBlackblooded', 'OmenoftheLiege'],
      omenQuotesAsOf: '2026-08-22',
    });
    // The case the old sheet got wrong: nothing inferred, so it would have claimed to be all live.
    expect(p.estimated).toBe(true);
    expect(p.caveat).toBe('All prices are live market data, except the Omen of the Blackblooded and Omen of '
      + 'the Liege (too thinly traded to price live, so priced from a quote copied by hand on 2026-08-22).');
  });

  it('names both kinds when both are present', () => {
    const p = priceProvenance({ inferredEssences: 50, fallbackOmens: ['OmenoftheSovereign'], omenQuotesAsOf: '2026-08-22' });
    expect(p.estimated).toBe(true);
    expect(p.caveat).toBe('All prices are live market data, except 50 essence variants nobody is currently trading '
      + '(inferred from the same essence\'s other levels), and the Omen of the Sovereign (too thinly traded to price '
      + 'live, so priced from a quote copied by hand on 2026-08-22).');
  });

  it('keeps the essence wording when only essences are inferred', () => {
    const p = priceProvenance({ inferredEssences: 1, fallbackOmens: [] });
    expect(p).toEqual({
      estimated: true,
      caveat: 'All prices are live market data, except 1 essence variant nobody is currently trading (inferred from the same essence\'s other levels).',
    });
  });

  it('claims nothing when every price is live', () => {
    expect(priceProvenance({ inferredEssences: 0, fallbackOmens: [] })).toEqual({ estimated: false });
  });
});

describe('omen names and the transcription page', () => {
  it('spells omen keys the way the game does', () => {
    expect(omenName('OmenoftheBlackblooded')).toBe('Omen of the Blackblooded');
    expect(omenName('OmenofSinistralAnnulment')).toBe('Omen of Sinistral Annulment');
    expect(omenName('OmenofLight')).toBe('Omen of Light');
  });

  it('points at the league being priced, not a stored one', () => {
    expect(omenPageUrl('Forbidden Rites')).toBe('https://poe.ninja/poe2/economy/forbiddenrites/omens');
  });
});
