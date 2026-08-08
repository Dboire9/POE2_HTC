// Small generic enumeration helpers shared by the optimizers. All inputs here are tiny (≤6 target mods,
// ≤4 alchemy slots), so the naive recursive forms are fine — clarity over cleverness.

/** All permutations of `items` (K! of them). K is small here (≤6), so this is fine. */
export function permutations<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [[...items]];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i++) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    for (const p of permutations(rest)) out.push([items[i]!, ...p]);
  }
  return out;
}

/** All size-`k` subsets of `items` (order-independent). k is small here (=4), so this is fine. */
export function combinations<T>(items: readonly T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (k > items.length) return [];
  const out: T[][] = [];
  for (let i = 0; i <= items.length - k; i++) {
    for (const rest of combinations(items.slice(i + 1), k - 1)) out.push([items[i]!, ...rest]);
  }
  return out;
}

/** Every ordered selection of `k` distinct items from `arr` (⇒ [] if k > |arr|; [[]] if k === 0). */
export function orderedSelections<T>(arr: readonly T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (k > arr.length) return [];
  const out: T[][] = [];
  for (const combo of combinations(arr, k)) for (const perm of permutations(combo)) out.push(perm);
  return out;
}

export function factorial(n: number): number {
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}
