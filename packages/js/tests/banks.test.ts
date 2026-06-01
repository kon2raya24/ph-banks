import { describe, it, expect } from 'vitest';
import {
  listBanks,
  findBank,
  findBySwift,
  validateBIC,
  parseBIC,
  PARTICIPATION_AS_OF,
  type Bank,
} from '../src/index';

describe('listBanks', () => {
  it('returns the full registry', () => {
    expect(listBanks().length).toBeGreaterThan(140);
  });

  it('filters by type', () => {
    const ukb = listBanks({ type: 'universal_commercial' });
    expect(ukb.length).toBeGreaterThan(30);
    expect(ukb.every((b) => b.type === 'universal_commercial')).toBe(true);

    const ewallets = listBanks({ type: 'ewallet' });
    expect(ewallets.some((b) => b.shortName === 'GCash')).toBe(true);
    expect(ewallets.some((b) => b.shortName === 'Maya')).toBe(true);
  });

  it('filters by participation and SWIFT presence', () => {
    expect(listBanks({ instapay: true }).every((b) => b.instapay)).toBe(true);
    expect(listBanks({ pesonet: true }).every((b) => b.pesonet)).toBe(true);
    expect(listBanks({ hasSwift: true }).every((b) => b.swift !== null)).toBe(true);
    expect(listBanks({ foreign: true }).every((b) => b.foreign)).toBe(true);
  });

  it('returns a fresh array each call (mutation-safe)', () => {
    const a = listBanks();
    a.pop();
    expect(listBanks().length).toBe(a.length + 1);
  });
});

describe('findBank', () => {
  it('finds by short name, exact name, and partial name', () => {
    expect(findBank('BDO')?.name).toBe('BDO Unibank, Inc.');
    expect(findBank('Bank of the Philippine Islands')?.shortName).toBe('BPI');
    expect(findBank('metrobank')?.swift).toBe('MBTCPHMM');
  });

  it('finds by SWIFT (8 and 11 char)', () => {
    expect(findBank('BNORPHMM')?.shortName).toBe('BDO');
    expect(findBank('UBPHPHMMXXX')?.shortName).toBe('UnionBank'); // 11-char → matches BIC8
  });

  it('returns null for no match', () => {
    expect(findBank('Bank of Nowhere')).toBeNull();
    expect(findBank('')).toBeNull();
  });
});

describe('findBySwift', () => {
  it('matches the head-office code from 8- or 11-char input', () => {
    expect(findBySwift('rcbcphmm')?.shortName).toBe('RCBC');
    expect(findBySwift('RCBCPHMMXXX')?.shortName).toBe('RCBC');
    expect(findBySwift('ZZZZPHMM')).toBeNull();
  });
});

describe('validateBIC / parseBIC', () => {
  it('accepts valid 8- and 11-char BICs (case-insensitive)', () => {
    expect(validateBIC('BNORPHMM')).toBe(true);
    expect(validateBIC('bopiphmmxxx')).toBe(true);
    expect(validateBIC('BOFAPH2X')).toBe(true); // alphanumeric location
  });

  it('rejects malformed BICs', () => {
    expect(validateBIC('CITIPHMXV')).toBe(false); // 9 chars
    expect(validateBIC('BNOR')).toBe(false);
    expect(validateBIC('1234PHMM')).toBe(false); // digits in institution
    expect(validateBIC('')).toBe(false);
    // @ts-expect-error runtime guard
    expect(validateBIC(null)).toBe(false);
  });

  it('parses BIC parts', () => {
    expect(parseBIC('BOPIPHMM')).toEqual({
      institution: 'BOPI',
      country: 'PH',
      location: 'MM',
      branch: null,
    });
    expect(parseBIC('RCBCPHMMXXX')?.branch).toBe('XXX');
    expect(parseBIC('nope')).toBeNull();
  });
});

describe('data integrity', () => {
  const banks = listBanks();

  it('every SWIFT present is a valid BIC and carries a confidence', () => {
    for (const b of banks as Bank[]) {
      if (b.swift) {
        expect(validateBIC(b.swift), b.name).toBe(true);
        expect(b.swiftConfidence === 'verified' || b.swiftConfidence === 'single-source').toBe(true);
      } else {
        expect(b.swiftConfidence).toBeNull();
      }
    }
  });

  it('receiver-only implies InstaPay participation', () => {
    for (const b of banks) if (b.instapayReceiverOnly) expect(b.instapay).toBe(true);
  });

  it('exposes the participation as-of date', () => {
    expect(PARTICIPATION_AS_OF).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
