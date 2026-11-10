import { describe, it, expect } from 'vitest';
import { getOrbitalLabel } from '../ui/labels';

describe('getOrbitalLabel', () => {
  it('identifies s-orbitals', () => {
    expect(getOrbitalLabel(1, 0, 0)).toBe('1s');
    expect(getOrbitalLabel(3, 0, 0)).toBe('3s');
  });

  it('identifies p-orbitals specifically', () => {
    expect(getOrbitalLabel(2, 1, 0)).toBe('2p_z');
    expect(getOrbitalLabel(2, 1, 1)).toBe('2p_x');
    expect(getOrbitalLabel(2, 1, -1)).toBe('2p_y');
  });

  it('identifies d-orbitals specifically', () => {
    expect(getOrbitalLabel(3, 2, 0)).toBe('3d_z²');
    expect(getOrbitalLabel(3, 2, 1)).toBe('3d_xz');
  });

  it('identifies f-orbitals generically or specifically', () => {
    expect(getOrbitalLabel(4, 3, 0)).toBe('4f_z³');
    expect(getOrbitalLabel(4, 3, 2)).toBe('4f_m=2');
  });
});
