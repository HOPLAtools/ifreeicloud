import { describe, it, expect } from 'vitest';
import {
  SERVICES,
  getServiceById,
  getServicesByCategory,
} from '../src/services.js';

describe('SERVICES', () => {
  it('has 72 services (panel snapshot 2026-04-24)', () => {
    expect(SERVICES).toHaveLength(72);
  });

  it('all services have required fields', () => {
    for (const s of SERVICES) {
      expect(s.id).toBeTypeOf('number');
      expect(s.name).toBeTypeOf('string');
      expect(s.price).toBeTypeOf('number');
      expect(s.jsonSupport).toBeTypeOf('boolean');
      expect(s.category).toBeTypeOf('string');
      expect(Array.isArray(s.flags)).toBe(true);
    }
  });

  it('has unique service IDs', () => {
    const ids = SERVICES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('the FREE Universal Model Check is priced at 0', () => {
    const free = SERVICES.find((s) => s.id === 0);
    expect(free?.price).toBe(0);
  });
});

describe('getServiceById', () => {
  it('finds AT&T (272)', () => {
    const s = getServiceById(272);
    expect(s).toBeDefined();
    expect(s!.category).toBe('US Carriers');
    expect(s!.flags).toContain('us');
  });

  it('finds the FREE universal model check (0)', () => {
    const s = getServiceById(0);
    expect(s).toBeDefined();
    expect(s!.price).toBe(0);
  });

  it('returns undefined for an ID not in the catalog', () => {
    expect(getServiceById(99999)).toBeUndefined();
  });
});

describe('getServicesByCategory', () => {
  it('US Carriers has 8 entries', () => {
    expect(getServicesByCategory('US Carriers')).toHaveLength(8);
  });

  it('JP Carriers has 3 entries', () => {
    expect(getServicesByCategory('JP Carriers')).toHaveLength(3);
  });

  it('Apple has 16 entries', () => {
    expect(getServicesByCategory('Apple')).toHaveLength(16);
  });

  it('Brand Info has 15 entries', () => {
    expect(getServicesByCategory('Brand Info')).toHaveLength(15);
  });

  it('All-in-one has 4 entries', () => {
    expect(getServicesByCategory('All-in-one')).toHaveLength(4);
  });

  it('Generic has 16 entries', () => {
    expect(getServicesByCategory('Generic')).toHaveLength(16);
  });

  it('Laptop has 5 entries', () => {
    expect(getServicesByCategory('Laptop')).toHaveLength(5);
  });

  it('Dev/Testing has 5 entries', () => {
    expect(getServicesByCategory('Dev/Testing')).toHaveLength(5);
  });

  it('every category total sums to 72', () => {
    const categories = [
      'Apple',
      'US Carriers',
      'JP Carriers',
      'Brand Info',
      'All-in-one',
      'Generic',
      'Laptop',
      'Dev/Testing',
    ] as const;
    const total = categories.reduce(
      (sum, c) => sum + getServicesByCategory(c).length,
      0,
    );
    expect(total).toBe(72);
  });

  it('the legacy IDs (0, 238, 272, 273, 284, 251) are all in the catalog', () => {
    for (const id of [0, 238, 272, 273, 284, 251]) {
      expect(getServiceById(id)).toBeDefined();
    }
  });
});
