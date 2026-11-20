import { describe, it, expect } from 'vitest';
import { Scene } from 'three';
import { applicationName } from '../src/core/environment.js';

describe('initialization smoke (not gameplay)', () => {
  it('loads shared ESM in Node without DOM', () => {
    expect(applicationName).toBe('Đảo Đèn Lồng');
    expect(typeof document).toBe('undefined');
  });
  it('loads Three.js without creating WebGL', () => {
    expect(new Scene().isScene).toBe(true);
  });
});
