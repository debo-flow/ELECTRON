import { describe, it, expect } from 'vitest';
import { validateSettings, defaultState } from '../state';

describe('Settings Validation', () => {
  it('falls back to defaults if data is corrupt or null', () => {
    expect(validateSettings(null)).toEqual(defaultState);
    expect(validateSettings("invalid string")).toEqual(defaultState);
  });
  
  it('merges valid partial settings without overwriting missing defaults', () => {
    const res = validateSettings({ theme: 'ice', n: 3 });
    expect(res.theme).toBe('ice');
    expect(res.n).toBe(3);
    expect(res.l).toBe(defaultState.l); // Kept default
  });

  it('clamps invalid quantum numbers found in save file', () => {
    const res = validateSettings({ n: 2, l: 3, m: 5 }); // 2f doesn't exist
    expect(res.n).toBe(2);
    expect(res.l).toBe(1); // Capped to p
    expect(res.m).toBe(1); // Capped to l
  });
});
