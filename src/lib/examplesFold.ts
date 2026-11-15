// Whether a player folded the ready-crafts card at the top of the Plan tab, kept in their browser.
//
// The card is the first thing a new visitor sees (asked 2026-11-15: a beginner who lands on a wall of
// modifiers may not stay to try), so a player who already knows the planner must be able to put it away
// once and not meet it open again. Guarded like every storage read in the app: a private window or a
// stranger's storage must not stop the tab rendering — the card then simply opens.

const KEY = 'poe2htc.examples.folded';

export function readFolded(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function writeFolded(folded: boolean): void {
  try {
    if (folded) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch { /* it just does not persist */ }
}
