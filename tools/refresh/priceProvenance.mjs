// What the price sheet says about itself: whether any price is not live market data, and which.
//
// `PriceBasisNote` shows `caveat` to players as one whole sentence and colours the note by `estimated`,
// so both must name EVERY price that is not observed today. They named only the inferred essences, so a
// sheet whose boss omens came from a 77-day-old hand transcription still told players "All prices are
// live market data, except 50 essence variants" (found 2026-11-10). And with no inferred essence the
// sheet would have called itself fully live.
//
// Kept apart from prices.mjs, which fetches on import, so it can be tested.

/** "OmenoftheBlackblooded" → "Omen of the Blackblooded"; "OmenofSinistralAnnulment" → "Omen of Sinistral Annulment". */
export const omenName = (key) => {
  const m = /^Omenof(the)?(.*)$/.exec(key);
  if (!m) return key;
  const rest = m[2].replace(/(?<!^)(?=[A-Z])/g, ' ');
  return `Omen of ${m[1] ? 'the ' : ''}${rest}`;
};

/** poe.ninja's page slug for a league: "Forbidden Rites" → "forbiddenrites". */
export const leagueSlug = (league) => league.toLowerCase().replace(/[^a-z0-9]/g, '');

/** The poe.ninja page the omen quotes are transcribed from, for the league being priced. */
export const omenPageUrl = (league) => `https://poe.ninja/poe2/economy/${leagueSlug(league)}/omens`;

const list = (names) => (names.length <= 1 ? names.join('')
  : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`);

/**
 * `estimated` and `caveat` for the sheet.
 *
 * @param {{ inferredEssences: number, fallbackOmens: readonly string[], omenQuotesAsOf?: string }} p
 *   `fallbackOmens` are the omen keys priced from the stored quotes because their live line was too thin
 *   (or absent); `omenQuotesAsOf` is the date those quotes were transcribed.
 * @returns {{ estimated: boolean, caveat?: string }}
 */
export function priceProvenance({ inferredEssences, fallbackOmens, omenQuotesAsOf }) {
  const parts = [];
  if (inferredEssences > 0) {
    parts.push(`${inferredEssences} essence variant${inferredEssences === 1 ? '' : 's'} nobody is currently `
      + 'trading (inferred from the same essence\'s other levels)');
  }
  if (fallbackOmens.length > 0) {
    const names = list(fallbackOmens.map(omenName));
    const when = omenQuotesAsOf ? ` on ${omenQuotesAsOf}` : '';
    parts.push(`the ${names} (too thinly traded to price live, so priced from a quote copied by hand${when})`);
  }
  if (parts.length === 0) return { estimated: false };
  return { estimated: true, caveat: `All prices are live market data, except ${parts.join(', and ')}.` };
}
