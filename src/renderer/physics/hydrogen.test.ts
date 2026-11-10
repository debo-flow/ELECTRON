import { describe, it, expect } from 'vitest';
import { probabilityDensity } from './hydrogen';

describe('Hydrogen Wavefunctions', () => {
  it('1s is spherically symmetric', () => {
    const pX = probabilityDensity(1, 0, 0, 1, 0, 0);
    const pY = probabilityDensity(1, 0, 0, 0, 1, 0);
    const pZ = probabilityDensity(1, 0, 0, 0, 0, 1);
    expect(pX).toBeCloseTo(pY, 6);
    expect(pX).toBeCloseTo(pZ, 6);
  });

  it('2p (m=0) has a node at the z=0 plane', () => {
    const p = probabilityDensity(2, 1, 0, 1, 1, 0);
    expect(p).toBeCloseTo(0, 10);
  });

  it('1s radial probability peaks near r=1', () => {
    const probDist = (r: number) => 4 * Math.PI * r * r * probabilityDensity(1, 0, 0, r, 0, 0);
    expect(probDist(1.0)).toBeGreaterThan(probDist(0.5));
    expect(probDist(1.0)).toBeGreaterThan(probDist(1.5));
  });
});
