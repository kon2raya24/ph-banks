# ph-banks

[![npm version](https://img.shields.io/npm/v/@ph-dev-utils/banks?label=npm&color=cb3837&logo=npm)](https://www.npmjs.com/package/@ph-dev-utils/banks)
[![Packagist version](https://img.shields.io/packagist/v/phdevutils/banks?label=Packagist&color=f28d1a&logo=packagist&logoColor=white)](https://packagist.org/packages/phdevutils/banks)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Made in PH](https://img.shields.io/badge/made%20in-🇵🇭%20Philippines-0038A8)](https://github.com/kon2raya24)

A **Philippine bank & e-money registry** for JavaScript/TypeScript and PHP — SWIFT/BIC codes plus **InstaPay / PESONet** participation flags. Part of the [`@ph-dev-utils`](https://github.com/kon2raya24/ph-dev-utils) family.

```
ph-banks/
├── packages/
│   ├── js/      # @ph-dev-utils/banks (npm)
│   └── php/     # phdevutils/banks (Composer)
├── data/        # banks.json (generated, shared)
└── scripts/build-data.mjs   # rebuilds banks.json from the source lists
```

## What's in it

158 institutions, classified per the BSP:

| Category | Notes |
| --- | --- |
| **Universal & commercial** | Domestic banks (BDO, BPI, Metrobank, …) + foreign-bank Manila branches (MUFG, Mizuho, JP Morgan, …) |
| **Thrift & rural** | Savings/development & rural banks on the retail rails |
| **Digital banks** | GoTyme, Maya Bank, Tonik, UnionDigital, UNObank |
| **E-wallets (EMI-NBFI)** | GCash, Maya, GrabPay, ShopeePay, PalawanPay, … |

Each entry carries: official name, short name/brand, type, foreign-branch flag, **SWIFT/BIC** (where sourced, with a confidence level), and **InstaPay**/**PESONet** participation.

## Install & use

**JS / TS** — `npm install @ph-dev-utils/banks`

```ts
import { findBank, listBanks, validateBIC } from '@ph-dev-utils/banks';
findBank('BDO')?.swift;                    // 'BNORPHMM'
listBanks({ type: 'ewallet', instapay: true });
validateBIC('BOPIPHMM');                   // true
```

**PHP** — `composer require phdevutils/banks`

```php
use PhDevUtils\Banks\Banks;
Banks::findBank('BDO')['swift'];           // 'BNORPHMM'
Banks::listBanks(['type' => 'ewallet', 'instapay' => true]);
Banks::validateBIC('BOPIPHMM');            // true
```

See the per-package READMEs ([JS](packages/js/README.md) · [PHP](packages/php/README.md)) for the full API.

## Data sources & accuracy

This package compiles **factual public information**:

- **PESONet ACH Participants** — Philippine Clearing House Corporation (BSP)
- **InstaPay ACH Participants** — BancNet (BSP)
- **PDIC Directory of Insured Universal & Commercial Banks** (names/types)
- **SWIFT/BIC** — cross-checked across public SWIFT directories; each code is tagged `verified` (2+ sources agree) or `single-source`.

Participation flags reflect the BSP lists' **as-of date** (exposed as `PARTICIPATION_AS_OF`) and change as institutions join/leave the rails. **SWIFT/BIC codes are head-office codes — always confirm the exact code with the bank or recipient before initiating a wire transfer.** Not affiliated with BSP, PDIC, PCHC, BancNet, or SWIFT.

Rebuild the dataset from source with `npm run build:data`.

## License

MIT. The bundled dataset is factual public information (see [LICENSE](LICENSE)).
