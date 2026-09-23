import { describe, it, expect } from 'vitest';
import { solveDenseInPlace } from './denseSolve.ts';

describe('solveDenseInPlace', () => {
  it('solves every right-hand side at once, pivoting past a zero on the diagonal', () => {
    // [0 2 1; 1 1 0; 2 0 3] — the leading zero forces a row swap.
    const A = Float64Array.from([0, 2, 1, 1, 1, 0, 2, 0, 3]);
    const b1 = Float64Array.from([7, 3, 11]); // A·(1, 2, 3)
    const b2 = Float64Array.from([2, 1, 5]);
    expect(solveDenseInPlace(A, 3, [b1, b2])).toBe(true);
    expect([...b1].map((x) => +x.toFixed(12))).toEqual([1, 2, 3]);
    // Whatever b2 solves to, it must satisfy the original system.
    const A0 = [0, 2, 1, 1, 1, 0, 2, 0, 3];
    const rhs2 = [2, 1, 5];
    for (let r = 0; r < 3; r++) {
      expect(A0[r * 3]! * b2[0]! + A0[r * 3 + 1]! * b2[1]! + A0[r * 3 + 2]! * b2[2]!).toBeCloseTo(rhs2[r]!, 12);
    }
  });

  it('says so when the matrix is singular', () => {
    expect(solveDenseInPlace(Float64Array.from([1, 2, 2, 4]), 2, [Float64Array.from([1, 2])])).toBe(false);
  });
});
