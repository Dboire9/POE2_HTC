// One rule, in a module with NO side effects on import.
//
// It lives here rather than in refresh.mjs because that file is a SCRIPT: importing it runs the whole
// pipeline and rewrites data/patches/. Anything that wants to apply this rule — the refresh itself, a
// one-off migration of the shipped data, a test — has to be able to reach it without that.

/**
 * Put back the placeholder `cleanText` had nothing to collapse.
 *
 * The display text comes from `tierIds[0]` — the WORST tier — and `cleanText` only collapses a
 * PARENTHESISED range. A tier whose roll is a single fixed value is rendered by RePoE without
 * parentheses, so the literal survives: 115 shipped mods labelled themselves with their worst roll.
 * `15% reduced Attribute Requirements` really goes to 35%, and `+1 to Level of all Fire Spell Skills`
 * on a Wand really goes to +5 — which is what a player asking for +5 was shown as "+1".
 *
 * Only rewrites what it can prove: the tiers' rolls must actually VARY (a genuinely fixed mod should
 * keep its number), the representative tier's roll must be a single value, and the text must contain
 * exactly ONE number equal to it in magnitude — magnitude because the sign lives in the words, as
 * `15% reduced` does for a stored -15. Anything else is left alone, which is how
 * `Crossbows/AdditionalAmmo` ("Loads an additional bolt", no number at all) survives untouched.
 */
export function templateFixedRoll(text, tiers) {
  if (text == null || text.includes('#')) return text;
  const rolls = tiers.flatMap((t) => (t.ranges || []).flat());
  if (new Set(rolls).size <= 1) return text; // a mod that really is one value keeps it
  const first = (tiers[0]?.ranges || [])[0];
  if (!first || first[0] !== first[1]) return text;
  const nums = text.match(/-?\d+(?:\.\d+)?/g) || [];
  if (nums.length !== 1 || Math.abs(Number(nums[0])) !== Math.abs(first[0])) return text;
  return text.replace(nums[0], '#');
}
