import { describe, it, expect } from 'vitest';
import { wavefunction } from '../physics/hydrogen';

describe('Wavefunction Phase', () => {
  it('2p_z orbital has opposite signs on positive and negative z axis', () => {
    const psiUp = wavefunction(2, 1, 0, 0, 0, 2);
    const psiDown = wavefunction(2, 1, 0, 0, 0, -2);
    
    // One should be positive, one should be negative
    expect(Math.sign(psiUp)).not.toBe(Math.sign(psiDown));
    expect(Math.sign(psiUp * psiDown)).toBe(-1);
  });
  
  it('1s orbital is everywhere positive', () => {
    const psi1 = wavefunction(1, 0, 0, 1, 0, 0);
    const psi2 = wavefunction(1, 0, 0, -1, -1, -1);
    
    expect(Math.sign(psi1)).toBe(1);
    expect(Math.sign(psi2)).toBe(1);
  });
});
