// A dense linear solve, for the one place the optimizer needs an exact answer rather than an iterated
// one: a policy's chain on a small lattice (`MarkovOptions.exactEvaluation`, markovFromItem.ts).

/**
 * Solve `A·x = b` for every right-hand side in `rhs`, IN PLACE: Gaussian elimination with partial
 * pivoting on the row-major `m × m` matrix `A`, each `rhs[k]` overwritten with its solution. M³/3
 * multiply-adds — ~0.03 s at 458 unknowns, so keep `m` in the hundreds.
 *
 * Returns false when `A` is singular (a pivot of zero) or a solution is not finite; `A` and `rhs` then
 * hold nothing meaningful.
 */
export function solveDenseInPlace(A: Float64Array, m: number, rhs: readonly Float64Array[]): boolean {
  for (let k = 0; k < m; k++) {
    let p = k;
    for (let r = k + 1; r < m; r++) if (Math.abs(A[r * m + k]!) > Math.abs(A[p * m + k]!)) p = r;
    if (!(Math.abs(A[p * m + k]!) > 1e-300)) return false;
    if (p !== k) {
      for (let col = k; col < m; col++) { const x = A[k * m + col]!; A[k * m + col] = A[p * m + col]!; A[p * m + col] = x; }
      for (const b of rhs) { const x = b[k]!; b[k] = b[p]!; b[p] = x; }
    }
    const pivot = A[k * m + k]!;
    for (let r = k + 1; r < m; r++) {
      const f = A[r * m + k]! / pivot;
      if (f === 0) continue; // a sparse chain: most rows have nothing to eliminate
      for (let col = k; col < m; col++) A[r * m + col] = A[r * m + col]! - f * A[k * m + col]!;
      for (const b of rhs) b[r] = b[r]! - f * b[k]!;
    }
  }
  for (let r = m - 1; r >= 0; r--) {
    for (const b of rhs) {
      let x = b[r]!;
      for (let col = r + 1; col < m; col++) x -= A[r * m + col]! * b[col]!;
      b[r] = x / A[r * m + r]!;
      if (!Number.isFinite(b[r]!)) return false;
    }
  }
  return true;
}
