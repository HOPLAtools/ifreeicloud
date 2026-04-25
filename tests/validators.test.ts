import { describe, it, expect } from 'vitest';
import {
  isValidImeiOrSn,
  isValidServiceId,
  isValidApiKey,
} from '../src/validators.js';

describe('isValidImeiOrSn', () => {
  it('accepts 15-digit IMEI', () => {
    expect(isValidImeiOrSn('354442067957123')).toBe(true);
  });

  it('accepts 11-char serial number', () => {
    expect(isValidImeiOrSn('C39JKDF0G5M')).toBe(true);
  });

  it('rejects too short (10 chars)', () => {
    expect(isValidImeiOrSn('1234567890')).toBe(false);
  });

  it('rejects too long (16 chars)', () => {
    expect(isValidImeiOrSn('1234567890123456')).toBe(false);
  });

  it('rejects special characters', () => {
    expect(isValidImeiOrSn('12345-67890AB')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidImeiOrSn('')).toBe(false);
  });
});

describe('isValidServiceId', () => {
  it('accepts 0 (FREE Universal Model Check)', () => {
    expect(isValidServiceId(0)).toBe(true);
  });

  it('accepts 287 (USA ESN Status)', () => {
    expect(isValidServiceId(287)).toBe(true);
  });

  it('accepts 999 (upper bound)', () => {
    expect(isValidServiceId(999)).toBe(true);
  });

  it('rejects negative', () => {
    expect(isValidServiceId(-1)).toBe(false);
  });

  it('rejects > 999', () => {
    expect(isValidServiceId(1000)).toBe(false);
  });

  it('rejects float', () => {
    expect(isValidServiceId(3.5)).toBe(false);
  });

  it('rejects NaN', () => {
    expect(isValidServiceId(NaN)).toBe(false);
  });
});

describe('isValidApiKey', () => {
  it('accepts the documented key shape', () => {
    expect(isValidApiKey('PTD-N6N-EUB-6ZT-R6R-ORV-ORB-0MS')).toBe(true);
  });

  it('accepts an all-letters key', () => {
    expect(isValidApiKey('ABC-DEF-GHI-JKL-MNO-PQR-STU-VWX')).toBe(true);
  });

  it('accepts lowercase (we normalize at the boundary, not at validate-time)', () => {
    expect(isValidApiKey('ptd-n6n-eub-6zt-r6r-orv-orb-0ms')).toBe(true);
  });

  it('rejects missing segments', () => {
    expect(isValidApiKey('PTD-N6N-EUB')).toBe(false);
  });

  it('rejects extra segments', () => {
    expect(isValidApiKey('PTD-N6N-EUB-6ZT-R6R-ORV-ORB-0MS-XXX')).toBe(false);
  });

  it('rejects wrong separator', () => {
    expect(isValidApiKey('PTD_N6N_EUB_6ZT_R6R_ORV_ORB_0MS')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidApiKey('')).toBe(false);
  });
});
