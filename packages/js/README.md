# @ph-dev-utils/banks

[![npm version](https://img.shields.io/npm/v/@ph-dev-utils/banks?label=npm&color=cb3837&logo=npm)](https://www.npmjs.com/package/@ph-dev-utils/banks)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)

Philippine **bank & e-money registry** for JavaScript/TypeScript — SWIFT/BIC codes plus **InstaPay / PESONet** participation flags for universal & commercial banks (incl. foreign branches), thrift & rural banks, digital banks, and e-wallets (GCash, Maya, GrabPay, ShopeePay…). Part of the [`@ph-dev-utils`](https://github.com/kon2raya24) family.

Bundled dataset is browser-safe (compiled in, no network, no `fs`).

```bash
npm install @ph-dev-utils/banks
```

## Quick start

```ts
import { listBanks, findBank, findBySwift, validateBIC } from '@ph-dev-utils/banks';

findBank('BDO');                 // { name: 'BDO Unibank, Inc.', shortName: 'BDO', swift: 'BNORPHMM', ... }
findBank('metrobank')?.swift;    // 'MBTCPHMM'
findBySwift('UBPHPHMMXXX');      // UnionBank (11-char input matches the 8-char head-office BIC)

listBanks({ type: 'ewallet' });          // GCash, Maya, GrabPay, ShopeePay, …
listBanks({ instapay: true }).length;    // InstaPay participants
listBanks({ type: 'universal_commercial', foreign: false }); // domestic U/KBs

validateBIC('BNORPHMM');         // true   (ISO 9362 format check)
validateBIC('CITIPHMXV');        // false  (9 chars — malformed)
```

## API

| Function | Returns |
| --- | --- |
| `listBanks(filter?)` | `Bank[]` — filter by `type` / `instapay` / `pesonet` / `foreign` / `hasSwift` |
| `findBank(query)` | `Bank \| null` — match by SWIFT, exact/partial name, or short name |
| `findBySwift(code)` | `Bank \| null` — by head-office BIC (8- or 11-char input) |
| `validateBIC(code)` | `boolean` — ISO 9362 format (8 or 11 chars), case-insensitive |
| `parseBIC(code)` | `{ institution, country, location, branch } \| null` |
| `PARTICIPATION_AS_OF` | `string` — the BSP lists' as-of date (`YYYY-MM-DD`) |
| `META` | provenance + disclaimer for the bundled data |

### `Bank`

```ts
interface Bank {
  name: string;
  shortName: string | null;          // 'BDO', 'GCash', …
  type: 'universal_commercial' | 'thrift' | 'rural' | 'digital' | 'ewallet';
  foreign: boolean;                  // foreign-bank Manila branch
  swift: string | null;              // head-office BIC, or null if not sourced
  swiftConfidence: 'verified' | 'single-source' | null;
  instapay: boolean;
  instapayReceiverOnly: boolean;     // can receive but not originate InstaPay
  pesonet: boolean;
}
```

`swiftConfidence` is **`verified`** when 2+ independent public SWIFT directories agree, **`single-source`** when only one does (format-valid but not cross-checked), and `null` when no SWIFT is sourced.

## Data & disclaimer

- **InstaPay / PESONet** flags come from the BSP-published ACH participant lists (BancNet & Philippine Clearing House Corporation) and reflect the `PARTICIPATION_AS_OF` date — participation changes over time.
- **Registry** (names/types) follows the PDIC Directory of Insured Universal & Commercial Banks plus the BSP rails lists.
- **SWIFT/BIC** codes are head-office codes compiled from public directories. **Always confirm the exact code with the bank or recipient before initiating a wire transfer.**

Not affiliated with BSP, PDIC, PCHC, BancNet, or SWIFT.

## License

MIT.
