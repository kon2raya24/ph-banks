# Changelog

All notable changes to this project will be documented in this file. The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.1.0] - 2026-06-01

Initial release. Philippine bank & e-money registry for JS and PHP.

### Added

- `@ph-dev-utils/banks` (npm) and `phdevutils/banks` (Composer) packages.
- **Registry of 158 institutions** — universal & commercial banks (incl. foreign-bank Manila branches), thrift & rural banks, digital banks, and e-wallets (GCash, Maya, GrabPay, ShopeePay, PalawanPay, …). Each entry: `name`, `shortName`, `type`, `foreign`, `swift`, `swiftConfidence`, `instapay`, `instapayReceiverOnly`, `pesonet`.
- **Lookups:** `listBanks(filter)`, `findBank(query)` (by SWIFT / name / short name), `findBySwift(code)`.
- **SWIFT/BIC helpers:** `validateBIC` (ISO 9362 format, 8/11 chars) and `parseBIC` (structural parse). 100% format-level — no network.
- `PARTICIPATION_AS_OF` / `participationAsOf()` and bundled `_meta` provenance.

### Data

- **InstaPay / PESONet** participation from the BSP-published ACH participant lists (BancNet & Philippine Clearing House Corporation), **as of 2026-04-30**.
- **Registry** names/types from the PDIC Directory of Insured Universal & Commercial Banks (2024-01-02) reconciled against the BSP rails lists. Robinsons Bank omitted (merged into BPI, Jan 2024).
- **SWIFT/BIC** cross-checked across public directories: **13 cross-verified** (2+ sources agree), 17 single-source, the rest `null` (never guessed). A malformed 9-char Citibank code seen in one source was rejected by the validator and corrected to the valid 8-char BIC.

### Verification

- JS: 14 vitest tests pass (lookup, filters, BIC validate/parse, data integrity).
- PHP: PHPUnit parity tests pass.

### Notes

- Browser-safe on the JS side (dataset compiled in; no `fs`, no network).
- **SWIFT/BIC codes are head-office codes — confirm with the bank before initiating a wire transfer.** Participation flags change over time; pin a version or rebuild from source (`npm run build:data`) when BSP updates the lists.
