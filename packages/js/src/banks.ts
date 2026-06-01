import data from '../data/banks.json' with { type: 'json' };

/** Institution category, following the BSP classification. */
export type BankType = 'universal_commercial' | 'thrift' | 'rural' | 'digital' | 'ewallet';

/** How well the SWIFT/BIC code is sourced. */
export type SwiftConfidence = 'verified' | 'single-source';

export interface Bank {
  /** Official institution name. */
  name: string;
  /** Common short name / brand (e.g. `BDO`, `GCash`), or `null`. */
  shortName: string | null;
  type: BankType;
  /** `true` for foreign-bank Manila branches (vs domestically incorporated). */
  foreign: boolean;
  /** Head-office SWIFT/BIC, or `null` when not independently sourced. */
  swift: string | null;
  /** Sourcing confidence for `swift` (`null` when `swift` is null). */
  swiftConfidence: SwiftConfidence | null;
  /** Listed as an InstaPay ACH participant on the as-of date. */
  instapay: boolean;
  /** InstaPay participant that can only RECEIVE (not originate sends). */
  instapayReceiverOnly: boolean;
  /** Listed as a PESONet ACH participant on the as-of date. */
  pesonet: boolean;
}

interface BanksFile {
  _meta: {
    participation_as_of: string;
    registry_as_of: string;
    sources: string[];
    disclaimer: string;
    [k: string]: unknown;
  };
  banks: Bank[];
}

const file = data as unknown as BanksFile;
const BANKS: Bank[] = file.banks;

/** The BSP participation lists' as-of date (`YYYY-MM-DD`). */
export const PARTICIPATION_AS_OF: string = file._meta.participation_as_of;
/** Provenance + disclaimer for the bundled dataset. */
export const META = file._meta;

export interface BankFilter {
  type?: BankType;
  /** Only InstaPay participants (`true`) or non-participants (`false`). */
  instapay?: boolean;
  /** Only PESONet participants (`true`) or non-participants (`false`). */
  pesonet?: boolean;
  /** Only foreign-branch (`true`) or domestic (`false`) institutions. */
  foreign?: boolean;
  /** Only institutions that have (`true`) / lack (`false`) a SWIFT code. */
  hasSwift?: boolean;
}

/** All institutions, optionally filtered. Returns a fresh array (safe to mutate). */
export function listBanks(filter: BankFilter = {}): Bank[] {
  return BANKS.filter((b) => {
    if (filter.type !== undefined && b.type !== filter.type) return false;
    if (filter.instapay !== undefined && b.instapay !== filter.instapay) return false;
    if (filter.pesonet !== undefined && b.pesonet !== filter.pesonet) return false;
    if (filter.foreign !== undefined && b.foreign !== filter.foreign) return false;
    if (filter.hasSwift !== undefined && (b.swift !== null) !== filter.hasSwift) return false;
    return true;
  });
}

function norm(s: string): string {
  return s.toLowerCase().replace(/&/g, 'and').replace(/[.,]/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Find one institution by SWIFT/BIC (8 or 11 char), exact/normalized name, or
 * short name. Returns `null` if nothing matches. Name match is case-insensitive
 * and punctuation-insensitive; a SWIFT11 input matches on its first 8 chars.
 */
export function findBank(query: string): Bank | null {
  if (!query) return null;
  const q = query.trim();
  // SWIFT (8 or 11) — match on the 8-char head-office code.
  if (/^[A-Za-z]{6}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$/.test(q)) {
    const bic8 = q.toUpperCase().slice(0, 8);
    const hit = BANKS.find((b) => b.swift === bic8);
    if (hit) return hit;
  }
  const n = norm(q);
  return (
    BANKS.find((b) => norm(b.name) === n) ??
    BANKS.find((b) => b.shortName && norm(b.shortName) === n) ??
    BANKS.find((b) => norm(b.name).includes(n) && n.length >= 3) ??
    null
  );
}

/** Find the institution whose head-office SWIFT/BIC matches (8 or 11 char input). */
export function findBySwift(swift: string): Bank | null {
  if (!swift) return null;
  const bic8 = swift.trim().toUpperCase().slice(0, 8);
  return BANKS.find((b) => b.swift === bic8) ?? null;
}

const BIC_RE = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

/**
 * Format-level SWIFT/BIC validation per ISO 9362: 4-letter institution +
 * 2-letter country + 2-char location, with an optional 3-char branch (8 or 11
 * chars total). Case-insensitive. Does not verify the code actually exists.
 */
export function validateBIC(code: string): boolean {
  if (typeof code !== 'string') return false;
  return BIC_RE.test(code.trim().toUpperCase());
}

export interface BicParts {
  institution: string; // 4
  country: string; // 2 (ISO 3166-1 alpha-2)
  location: string; // 2
  branch: string | null; // 3, or null for an 8-char head-office BIC
}

/** Structurally parse a SWIFT/BIC into its parts, or `null` if malformed. */
export function parseBIC(code: string): BicParts | null {
  if (!validateBIC(code)) return null;
  const c = code.trim().toUpperCase();
  return {
    institution: c.slice(0, 4),
    country: c.slice(4, 6),
    location: c.slice(6, 8),
    branch: c.length === 11 ? c.slice(8, 11) : null,
  };
}
