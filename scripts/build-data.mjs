// build-data.mjs — assemble data/banks.json (and packages/js/data/banks.json)
// from the authoritative source lists below, then validate and stamp provenance.
//
// SOURCES (all public, primary):
//   • PESONet ACH Participants — Philippine Clearing House Corporation, as of 2026-04-30
//     https://www.bsp.gov.ph/PaymentAndSettlement/PESONet%20Participants.pdf
//   • InstaPay ACH Participants — BancNet, as of 2026-04-30
//     https://www.bsp.gov.ph/PaymentAndSettlement/Instapay%20Participants.pdf
//   • PDIC Directory of Insured Universal & Commercial Banks, as of 2024-01-02 (names/types)
//     https://www.pdic.gov.ph/files/BSDStats/KB%20Bank%20Directory_website.pdf
//   • SWIFT/BIC codes — cross-checked across public SWIFT directories (see SWIFT below).
//
// Participation flags (instapay / pesonet) are membership in the two BSP lists.
// SWIFT is included ONLY where sourced — null otherwise (never guessed).
//
// Run:  node scripts/build-data.mjs   (writes both data/banks.json copies)

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const PARTICIPATION_AS_OF = '2026-04-30';
const REGISTRY_AS_OF = '2024-01-02';

// ─────────────────────────────────────────────────────────────────────────────
// PESONet ACH Participants (PCHC, as of 2026-04-30). Robinsons Bank is omitted
// (the source annotates it "merged with BPI" — defunct as a separate bank).
// ─────────────────────────────────────────────────────────────────────────────
const PESONET = {
  ukb: [
    'Al-Amanah Islamic Investment Bank of the Philippines',
    'Asia United Bank Corporation',
    'Australia and New Zealand Banking Group Ltd.',
    'Bangkok Bank Public Co. Ltd.',
    'Bank of America, N.A.',
    'Bank of China (Hong Kong) Limited - Manila Branch',
    'Bank of Commerce',
    'Bank of the Philippine Islands',
    'BDO Unibank, Inc.',
    'Cathay United Bank Co., Ltd. - Manila Branch',
    'China Banking Corporation',
    'CIMB Bank Philippines, Inc.',
    'Citibank, N.A.',
    'CTBC Bank (Philippines) Corporation',
    'Deutsche Bank AG',
    'Development Bank of the Philippines',
    'East West Banking Corporation',
    'Industrial and Commercial Bank of China, Ltd. - Manila Branch',
    'Industrial Bank of Korea Manila Branch',
    'JP Morgan Chase Bank, N.A.',
    'KEB Hana Bank - Manila Branch',
    'Land Bank of the Philippines',
    'Maybank Philippines, Inc.',
    'Mega International Commercial Bank Co., Ltd.',
    'Metropolitan Bank and Trust Company',
    'Mizuho Bank, Ltd. - Manila Branch',
    'MUFG Bank, Ltd.',
    'Philippine Bank of Communications',
    'Philippine National Bank',
    'Philippine Trust Company',
    'Philippine Veterans Bank',
    'Rizal Commercial Banking Corporation',
    'Security Bank Corporation',
    'Shinhan Bank - Manila Branch',
    'Standard Chartered Bank',
    'Sumitomo Mitsui Banking Corporation - Manila Branch',
    'The Hongkong and Shanghai Banking Corporation',
    'Union Bank of the Philippines',
    'United Overseas Bank Limited, Manila Branch',
  ],
  tb: [
    'AllBank (A Thrift Bank), Inc.',
    'Bangko Kabayan, Inc.',
    'Bank of Makati (A Savings Bank), Inc.',
    'BDO Network Bank, Inc.',
    'BPI Direct BanKo, Inc., A Savings Bank',
    'China Bank Savings, Inc.',
    'City Savings Bank, Inc.',
    'Dumaguete City Development Bank, Inc.',
    'Equicom Savings Bank, Inc.',
    'First Consolidated Bank, Inc.',
    'LOLC Bank Philippines Inc.',
    'Malayan Savings Bank, Inc.',
    'Philippine Business Bank, Inc., A Savings Bank',
    'Philippine Savings Bank',
    'Producers Savings Bank Corporation',
    'Queen City Development Bank, Inc. or Queenbank, A Thrift Bank',
    'Sterling Bank of Asia, Inc. (A Savings Bank)',
    'UCPB Savings Bank',
    'Wealth Development Bank Corporation',
    'Yuanta Savings Bank Philippines, Inc.',
  ],
  rb: [
    'Agribusiness Rural Bank, Inc.',
    'Bangko Mabuhay (A Rural Bank), Inc.',
    'Bangko Nuestra Señora del Pilar, Inc. (A Rural Bank)',
    'Bayanihan Bank, Inc.',
    'Biñan Rural Bank, Inc.',
    'BOF, Inc. (A Rural Bank)',
    'Camalig Bank, Inc. (A Rural Bank)',
    'Cantilan Bank, Inc. (A Rural Bank)',
    'Cebuana Lhuillier Rural Bank, Inc.',
    'Cooperative Bank of Quezon Province',
    'Dungganon Bank (A Microfinance Rural Bank), Inc.',
    'East West Rural Bank, Inc.',
    'Gateway Rural Bank, Inc.',
    'Guagua Rural Bank, Inc.',
    'Innovative Rural Bank, Inc. (A Rural Bank)',
    'Laguna Prestige Banking Corporation (A Rural Bank)',
    'Malarayat Rural Bank, Inc.',
    'MariBank Philippines Inc. (A Rural Bank)',
    'Money Mall Rural Bank, Inc.',
    'MVSM Bank (Rural Bank Since 1953), Inc.',
    'Netbank (A Rural Bank), Inc.',
    'New Rural Bank of San Leonardo (Nueva Ecija), Inc.',
    'Own Bank, The Rural Bank of Cavite City, Inc.',
    'Rang-Ay Bank, Inc. (A Rural Bank)',
    'RBT Bank, Inc., A Rural Bank',
    'Rural Bank of Angeles, Inc.',
    'Rural Bank of Bacolod City, Inc.',
    'Rural Bank of Bauang, Inc.',
    'Rural Bank of Digos, Inc.',
    'Rural Bank of Guinobatan, Inc.',
    'Rural Bank of La Paz, Inc.',
    'Rural Bank of Lebak (Sultan Kudarat), Inc.',
    'Rural Bank of Mangaldan, Inc.',
    'Rural Bank of Montalban, Inc.',
    'Rural Bank of Porac (Pampanga), Inc.',
    'Rural Bank of Rosario (La Union), Inc.',
    'Rural Bank of Sagay, Inc.',
    'Rural Bank of San Narciso, Inc.',
    'Rural Bank of Silay City, Inc.',
    'Rural Bank of Sta. Ignacia, Inc.',
    'Salmon Bank (Rural Bank) Inc.',
    'Southeast Country Bank Inc. (A Rural Bank)',
    'Summit Bank (Rural Bank of Tublay, Inc.)',
    'Top Bank Philippines, Inc. (A Rural Bank)',
    'Vigan Banco Rural, Incorporada',
    'Zambales Rural Bank, Inc.',
  ],
  db: [
    'GoTyme Bank Corporation',
    'Maya Bank, Inc.',
    'Tonik Digital Bank, Inc.',
    'Union Digital Bank',
    'UNObank, Inc.',
  ],
  emi: [
    'DCPAY Philippines, Inc.',
    'Easypay Global EMI Corporation',
    'GPay Network PH, Inc. (GrabPay)',
    'G-Xchange, Inc. (GCash)',
    'Lulu Financial Services (Phils.), Inc.',
    'Maya Philippines, Inc.',
    'PayMongo Payments, Inc.',
    'Philippine Digital Asset Exchange, Inc.',
    'PPS-PEPP Financial Services Corp. (PalawanPay)',
    'TagCash Ltd., Inc.',
    'TayoCash, Inc.',
    'USSC Money Services, Inc.',
    'Wise Pilipinas, Inc.',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// InstaPay ACH Participants (BancNet, as of 2026-04-30).
// `recvOnly` = listed as Receiver Only (cannot originate InstaPay sends).
// ─────────────────────────────────────────────────────────────────────────────
const INSTAPAY = {
  ukb: [
    'Asia United Bank Corporation',
    'Bank of China (Hong Kong) Limited - Manila Branch',
    'Bank of Commerce',
    'Bank of the Philippine Islands',
    'BDO Unibank, Inc.',
    'China Banking Corporation',
    'CIMB Bank Philippines, Inc.',
    'CTBC Bank (Philippines) Corporation',
    'Development Bank of the Philippines',
    'East West Banking Corporation',
    'Land Bank of the Philippines',
    'Maybank Philippines, Inc.',
    'Metropolitan Bank and Trust Company',
    'Philippine Bank of Communications',
    'Philippine National Bank',
    'Philippine Trust Company',
    'Philippine Veterans Bank',
    'Rizal Commercial Banking Corporation',
    'Security Bank Corporation',
    'Standard Chartered Bank',
    'The Hongkong and Shanghai Banking Corporation',
    'Union Bank of the Philippines',
  ],
  tb: [
    'AllBank (A Thrift Bank), Inc.',
    'BDO Network Bank, Inc.',
    'BPI Direct BanKo, Inc., A Savings Bank',
    'Card SME Bank Inc., A Thrift Bank',
    'China Bank Savings, Inc.',
    'City Savings Bank, Inc.',
    'Equicom Savings Bank, Inc.',
    'ISLA Bank (A Thrift Bank), Inc.',
    'Legazpi Savings Bank, Inc.',
    'Malayan Savings Bank, Inc.',
    'Pacific Ace Savings Bank, Inc.',
    'Philippine Business Bank, Inc., A Savings Bank',
    'Philippine Savings Bank',
    'Producers Savings Bank Corporation',
    'Queen City Development Bank, Inc. or Queenbank, A Thrift Bank',
    'Sterling Bank of Asia, Inc. (A Savings Bank)',
    'Sun Savings Bank, Inc.',
    'Wealth Development Bank Corporation',
  ],
  rb: [
    'Camalig Bank, Inc. (A Rural Bank)',
    'Cantilan Bank, Inc. (A Rural Bank)',
    'Card Bank, Inc. (A Microfinance-Oriented Rural Bank)',
    'CARD MRI Rizal Bank, Inc.',
    'Cebuana Lhuillier Rural Bank, Inc.',
    'Dungganon Bank (A Microfinance Rural Bank), Inc.',
    'East West Rural Bank, Inc.',
    'MariBank Philippines Inc. (A Rural Bank)',
    'Mindanao Consolidated Cooperative Bank',
    'Netbank (A Rural Bank), Inc.',
    'Own Bank, The Rural Bank of Cavite City, Inc.',
    'Partner Rural Bank (Cotabato), Inc.',
    'Rang-Ay Bank, Inc. (A Rural Bank)',
    'Rural Bank of Guinobatan, Inc.',
  ],
  db: [
    'GoTyme Bank Corporation',
    'Maya Bank, Inc.',
    'Tonik Digital Bank, Inc.',
    'Union Digital Bank',
    'UNObank, Inc.',
  ],
  emi: [
    'CIS Bayad Center, Inc.',
    'DCPAY Philippines, Inc.',
    'Easypay Global EMI Corporation',
    'Ecashpay Asia, Inc.',
    'GPay Network PH, Inc. (GrabPay)',
    'G-Xchange, Inc. (GCash)',
    'Infoserve, Inc.',
    'I-Remit, Inc.',
    'MarcoPay, Inc.',
    'Maya Philippines, Inc.',
    'OmniPay, Inc.',
    'PayMongo Payments, Inc.',
    'Paynamics Technologies, Inc.',
    'Peppermint Bizmoto Inc.',
    'Philippine Digital Asset Exchange, Inc.',
    'PPS-PEPP Financial Services Corp. (PalawanPay)',
    'ShopeePay Philippines, Inc.',
    'SpeedyPay, Inc.',
    'StarPay Corporation',
    'TayoCash, Inc.',
    'Toktokwallet, Inc.',
    'TopJuan Tech Corporation',
    'Traxion Pay, Inc.',
    'USSC Money Services, Inc.',
    'Wise Pilipinas, Inc.',
    'Zybi Tech, Inc.',
  ],
  // Listed under "Receiver Only" in the InstaPay PDF, by category.
  recvOnly: {
    tb: ['Luzon Development Bank', 'UCPB Savings Bank'],
    rb: [
      'Bangko Mabuhay (A Rural Bank), Inc.',
      'Entrepreneur Rural Bank, Inc.',
      'Quezon Capital Rural Bank, Inc.',
      'Rural Bank of Apalit, Inc.',
      'Vigan Banco Rural, Incorporada',
    ],
    emi: ['Alipay Philippines, Inc.', 'Toyota Financial Services Philippines Corporation'],
  },
};

// PDIC-listed U/KBs that are NOT in either retail rail (private/foreign branches).
// Included so the universal/commercial registry matches the PDIC directory.
const EXTRA_UKB = [
  'BDO Private Bank, Inc.',
  'Chang Hwa Commercial Bank, Ltd., Manila Branch',
  'First Commercial Bank, Ltd., Manila Branch',
  'Hua Nan Commercial Bank, Ltd., Manila Branch',
  'ING Bank N.V.',
];

// ─────────────────────────────────────────────────────────────────────────────
// SWIFT / BIC overlay. confidence: 'verified' = 2+ independent public directories
// agree; 'single-source' = one public directory (format-valid, not cross-checked).
// Anything not listed here ships with swift: null (never guessed).
// ─────────────────────────────────────────────────────────────────────────────
const SWIFT = {
  'BDO Unibank, Inc.': ['BNORPHMM', 'verified'],
  'Bank of the Philippine Islands': ['BOPIPHMM', 'verified'],
  'Metropolitan Bank and Trust Company': ['MBTCPHMM', 'verified'],
  'Land Bank of the Philippines': ['TLBPPHMM', 'verified'],
  'Development Bank of the Philippines': ['DBPHPHMM', 'verified'],
  'East West Banking Corporation': ['EWBCPHMM', 'verified'],
  'Philippine National Bank': ['PNBMPHMM', 'verified'],
  'Rizal Commercial Banking Corporation': ['RCBCPHMM', 'verified'],
  'China Banking Corporation': ['CHBKPHMM', 'verified'],
  'Union Bank of the Philippines': ['UBPHPHMM', 'verified'],
  'Security Bank Corporation': ['SETCPHMM', 'verified'],
  'Asia United Bank Corporation': ['AUBKPHMM', 'verified'],
  'Bank of Commerce': ['PABIPHMM', 'verified'],
  'Maybank Philippines, Inc.': ['MBBEPHMM', 'single-source'],
  'Philippine Trust Company': ['PHTBPHMM', 'single-source'],
  'Philippine Bank of Communications': ['CPHIPHMM', 'single-source'],
  'Philippine Veterans Bank': ['PHVBPHMM', 'single-source'],
  'The Hongkong and Shanghai Banking Corporation': ['HSBCPHMM', 'single-source'],
  'Standard Chartered Bank': ['SCBLPHMM', 'single-source'],
  'Citibank, N.A.': ['CITIPHMX', 'single-source'],
  'CIMB Bank Philippines, Inc.': ['CIPHPHMM', 'single-source'],
  'CTBC Bank (Philippines) Corporation': ['CTCBPHMM', 'single-source'],
  'Australia and New Zealand Banking Group Ltd.': ['ANZBPHMX', 'single-source'],
  'Bangkok Bank Public Co. Ltd.': ['BKKBPHMM', 'single-source'],
  'Bank of America, N.A.': ['BOFAPH2X', 'single-source'],
  'Bank of China (Hong Kong) Limited - Manila Branch': ['BKCHPHMM', 'single-source'],
  'Deutsche Bank AG': ['DEUTPHMM', 'single-source'],
  'Maya Bank, Inc.': ['MYYAPHM2', 'single-source'],
  'Tonik Digital Bank, Inc.': ['TODGPHM2', 'single-source'],
  'G-Xchange, Inc. (GCash)': ['GLTEPHMT', 'single-source'],
};

// Common short names / brands.
const SHORT = {
  'BDO Unibank, Inc.': 'BDO',
  'Bank of the Philippine Islands': 'BPI',
  'Metropolitan Bank and Trust Company': 'Metrobank',
  'Land Bank of the Philippines': 'LandBank',
  'Development Bank of the Philippines': 'DBP',
  'East West Banking Corporation': 'EastWest',
  'Philippine National Bank': 'PNB',
  'Rizal Commercial Banking Corporation': 'RCBC',
  'China Banking Corporation': 'China Bank',
  'Union Bank of the Philippines': 'UnionBank',
  'Security Bank Corporation': 'Security Bank',
  'Asia United Bank Corporation': 'AUB',
  'Philippine Bank of Communications': 'PBCom',
  'Philippine Trust Company': 'Philtrust',
  'The Hongkong and Shanghai Banking Corporation': 'HSBC',
  'CTBC Bank (Philippines) Corporation': 'CTBC',
  'Al-Amanah Islamic Investment Bank of the Philippines': 'Al-Amanah',
  'G-Xchange, Inc. (GCash)': 'GCash',
  'Maya Philippines, Inc.': 'Maya',
  'GPay Network PH, Inc. (GrabPay)': 'GrabPay',
  'ShopeePay Philippines, Inc.': 'ShopeePay',
  'PPS-PEPP Financial Services Corp. (PalawanPay)': 'PalawanPay',
  'CIS Bayad Center, Inc.': 'Bayad',
  'Maya Bank, Inc.': 'Maya Bank',
  'GoTyme Bank Corporation': 'GoTyme',
  'Union Digital Bank': 'UnionDigital',
};

// Foreign-bank Manila branches (vs domestically incorporated banks/subsidiaries).
const FOREIGN_BRANCH = new Set([
  'Australia and New Zealand Banking Group Ltd.',
  'Bangkok Bank Public Co. Ltd.',
  'Bank of America, N.A.',
  'Bank of China (Hong Kong) Limited - Manila Branch',
  'Cathay United Bank Co., Ltd. - Manila Branch',
  'Chang Hwa Commercial Bank, Ltd., Manila Branch',
  'Citibank, N.A.',
  'Deutsche Bank AG',
  'First Commercial Bank, Ltd., Manila Branch',
  'Hua Nan Commercial Bank, Ltd., Manila Branch',
  'Industrial and Commercial Bank of China, Ltd. - Manila Branch',
  'Industrial Bank of Korea Manila Branch',
  'ING Bank N.V.',
  'JP Morgan Chase Bank, N.A.',
  'KEB Hana Bank - Manila Branch',
  'Mega International Commercial Bank Co., Ltd.',
  'Mizuho Bank, Ltd. - Manila Branch',
  'MUFG Bank, Ltd.',
  'Shinhan Bank - Manila Branch',
  'Standard Chartered Bank',
  'Sumitomo Mitsui Banking Corporation - Manila Branch',
  'The Hongkong and Shanghai Banking Corporation',
  'United Overseas Bank Limited, Manila Branch',
]);

const TYPE_LABEL = {
  ukb: 'universal_commercial',
  tb: 'thrift',
  rb: 'rural',
  db: 'digital',
  emi: 'ewallet',
};

// Normalized join key — tolerates incidental punctuation/casing diffs across the
// two source PDFs while keeping distinct banks distinct.
function key(name) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const BIC_RE = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

// ── Merge ────────────────────────────────────────────────────────────────────
const byKey = new Map();

function upsert(name, typeCode, { instapay = false, pesonet = false, recvOnly = false } = {}) {
  const k = key(name);
  let e = byKey.get(k);
  if (!e) {
    e = { name, type: TYPE_LABEL[typeCode], instapay: false, pesonet: false, instapayReceiverOnly: false };
    byKey.set(k, e);
  }
  if (e.type !== TYPE_LABEL[typeCode]) {
    throw new Error(`Type conflict for "${name}": ${e.type} vs ${TYPE_LABEL[typeCode]}`);
  }
  if (instapay) e.instapay = true;
  if (pesonet) e.pesonet = true;
  if (recvOnly) e.instapayReceiverOnly = true;
}

for (const [cat, names] of Object.entries(PESONET)) for (const n of names) upsert(n, cat, { pesonet: true });
for (const [cat, names] of Object.entries(INSTAPAY)) {
  if (cat === 'recvOnly') continue;
  for (const n of names) upsert(n, cat, { instapay: true });
}
// Receiver-only InstaPay entries: still InstaPay participants, flagged.
for (const [cat, names] of Object.entries(INSTAPAY.recvOnly)) {
  for (const n of names) upsert(n, cat, { instapay: true, recvOnly: true });
}
for (const n of EXTRA_UKB) upsert(n, 'ukb', {});

// ── Decorate + validate ──────────────────────────────────────────────────────
const banks = [...byKey.values()].map((e) => {
  const swift = SWIFT[e.name] ?? null;
  if (swift && !BIC_RE.test(swift[0])) throw new Error(`Invalid BIC for ${e.name}: ${swift[0]}`);
  return {
    name: e.name,
    shortName: SHORT[e.name] ?? null,
    type: e.type,
    foreign: FOREIGN_BRANCH.has(e.name),
    swift: swift ? swift[0] : null,
    swiftConfidence: swift ? swift[1] : null,
    instapay: e.instapay,
    instapayReceiverOnly: e.instapay ? e.instapayReceiverOnly : false,
    pesonet: e.pesonet,
  };
});

banks.sort((a, b) => a.name.localeCompare(b.name, 'en'));

// ── Sanity report ─────────────────────────────────────────────────────────────
const byType = (t) => banks.filter((b) => b.type === t).length;
const withSwift = banks.filter((b) => b.swift).length;
const verified = banks.filter((b) => b.swiftConfidence === 'verified').length;
console.log('ph-banks data summary:');
console.log(`  total institutions : ${banks.length}`);
console.log(`  universal/commercial: ${byType('universal_commercial')}  (foreign branches: ${banks.filter((b) => b.foreign).length})`);
console.log(`  thrift              : ${byType('thrift')}`);
console.log(`  rural               : ${byType('rural')}`);
console.log(`  digital             : ${byType('digital')}`);
console.log(`  e-wallet (EMI-NBFI) : ${byType('ewallet')}`);
console.log(`  with SWIFT/BIC      : ${withSwift}  (cross-verified: ${verified}, single-source: ${withSwift - verified})`);
console.log(`  InstaPay / PESONet  : ${banks.filter((b) => b.instapay).length} / ${banks.filter((b) => b.pesonet).length}`);

const out = {
  _meta: {
    description:
      'Philippine bank & e-money registry with SWIFT/BIC codes and InstaPay/PESONet participation flags.',
    participation_as_of: PARTICIPATION_AS_OF,
    registry_as_of: REGISTRY_AS_OF,
    sources: [
      'PESONet ACH Participants — Philippine Clearing House Corporation (BSP), as of ' + PARTICIPATION_AS_OF,
      'InstaPay ACH Participants — BancNet (BSP), as of ' + PARTICIPATION_AS_OF,
      'PDIC Directory of Insured Universal & Commercial Banks, as of ' + REGISTRY_AS_OF,
      'SWIFT/BIC: cross-checked across public SWIFT directories; confidence per entry.',
    ],
    disclaimer:
      'Participation flags reflect the BSP-published lists on the as-of date and change over time. ' +
      'SWIFT/BIC codes are head-office codes compiled from public directories — ALWAYS confirm the ' +
      'exact code with the bank or recipient before initiating a wire transfer. Not affiliated with ' +
      'BSP, PDIC, PCHC, BancNet, or SWIFT.',
    swift_confidence: {
      verified: 'two or more independent public SWIFT directories agree',
      'single-source': 'one public directory; format-valid but not cross-checked',
    },
    count: banks.length,
  },
  banks,
};

const here = dirname(fileURLToPath(import.meta.url));
const json = JSON.stringify(out, null, 2) + '\n';
for (const rel of ['../data/banks.json', '../packages/js/data/banks.json']) {
  const p = join(here, rel);
  writeFileSync(p, json);
  console.log(`  wrote ${p}`);
}
