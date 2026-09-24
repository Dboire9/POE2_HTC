// The unit a stat is PRINTED in, from the unit the game files STORE it in.
//
// RePoE hands over a stat's raw range, and a few stats are kept finer than the game prints them: Life
// Regeneration per MINUTE (printed per second), Leech and some chances in PERMYRIAD (hundredths of a
// percent). Read raw, a T1 body armour printed "1986–2160 Life Regeneration per second" where the game says
// 33.1–36 (reported 2026-09-23), and a trade search for it asked for at least 1,986 and found nothing.
//
// Keyed on the stat id's own suffix, which is how the game names the unit — the translation files
// apply "per_minute_to_per_second" and "divide_by_one_hundred" to exactly these. Every range the
// refresh builds from RePoE passes through here; poe2db's (Essence, Desecrated) are already printed.

const UNITS = [
  // [suffix test, divisor, decimals the game prints]
  [/_per_minute(?:_|$)/, 60, 1],
  [/_permyriad(?:_|$)/, 100, 2],
];

/** A stat's `[min, max]` in the unit the game prints it in. */
export function shownRange(statId, [min, max]) {
  const unit = UNITS.find(([test]) => test.test(statId));
  if (!unit) return [min, max];
  const [, by, dp] = unit;
  const f = 10 ** dp;
  return [Math.round((min / by) * f) / f, Math.round((max / by) * f) / f];
}
