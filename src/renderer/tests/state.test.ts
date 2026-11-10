import { describe, it, expect } from 'vitest';
import { clampQuantumNumbers } from '../state';

describe('clampQuantumNumbers', () => {
  it('clamps l to n-1', () => {
    const { n, l } = clampQuantumNumbers(2, 2, 0); // 2d doesn't exist
    expect(n).toBe(2);
    expect(l).toBe(1); // capped to p
  });

  it('clamps m strictly between -l and l', () => {
    const res = clampQuantumNumbers(3, 1, 2); // 3p, m=2 is invalid
    expect(res.m).toBe(1); 
    
    const res2 = clampQuantumNumbers(3, 1, -5);
    expect(res2.m).toBe(-1);
  });

  it('keeps valid combinations intact', () => {
    const res = clampQuantumNumbers(4, 3, -2);
    expect(res).toEqual({ n: 4, l: 3, m: -2 });
  });
});
