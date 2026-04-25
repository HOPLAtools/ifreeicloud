# @hopla/ifreeicloud — API Reference

## Types

```typescript
interface IFreeiCloudConfig {
  apiKey: string;       // 31 chars: XXX-XXX-XXX-XXX-XXX-XXX-XXX-XXX
  baseUrl?: string;     // default: 'https://api.ifreeicloud.co.uk'
  timeout?: number;     // default: 60000ms
}

// Wire envelope (what the API returns)
interface IFreeiCloudEnvelope<TObject = unknown> {
  success: boolean;
  error?: string;       // populated only when success === false
  response?: string;    // human-readable text / HTML
  object?: TObject;     // structured payload (only when service has jsonSupport: true)
}

// What the client returns on success (the library throws IFreeiCloudError on failure)
interface IFreeiCloudCheckResponse<TObject = unknown> {
  success: true;
  response: string;
  object?: TObject;
}

// Service entry from the live `accountinfo=servicelist` endpoint
interface IFreeiCloudService {
  service: number | string;
  name: string;
  price: number | string;
  [extra: string]: unknown;   // processing_time, serial_supported, etc.
}

// Local catalog entry (with category + flags derived from name + panel icons)
interface IFreeiCloudServiceInfo {
  id: number;
  name: string;
  price: number;        // 0 for FREE
  jsonSupport: boolean; // true if `object` is populated on success
  category: ServiceCategory;
  flags: ServiceFlag[];
}

type ServiceCategory =
  | 'Apple' | 'US Carriers' | 'JP Carriers' | 'Brand Info'
  | 'All-in-one' | 'Generic' | 'Laptop' | 'Dev/Testing';

type ServiceFlag =
  | 'apple' | 'mac' | 'us' | 'jp'
  | 'fmi-locked' | 'blacklist' | 'tool' | 'dev' | 'new';

type IFreeiCloudErrorCode = 'INSUFFICIENT_BALANCE' | 'INVALID_KEY' | 'UNKNOWN';
```

## IFreeiCloudClient Interface

```typescript
interface IFreeiCloudClient {
  // Run an instant service. `TObject` types the structured payload when known.
  check<TObject = unknown>(
    imei: string,
    serviceId: number,
  ): Promise<IFreeiCloudCheckResponse<TObject>>;

  // Account balance in USD (parsed from object.account_balance)
  balance(): Promise<number>;

  // Live list of available services from the API
  services(): Promise<IFreeiCloudService[]>;
}
```

> **No `history()`** — iFreeiCloud has no async / polling endpoint. All catalogued services are instant.
> **No `format` parameter** — the API has one response shape only.

## IFreeiCloudError

```typescript
class IFreeiCloudError extends Error {
  readonly code: IFreeiCloudErrorCode;   // typed (best-effort) code
  readonly rawMessage: string;            // verbatim error string from the API
}

// Helper for tests / proxies that need to construct errors from a message
function parseErrorMessage(message: string): IFreeiCloudErrorCode;
```

## React Hook Signatures

```typescript
// Action hook — manual trigger via .mutate()
function useIFreeiCloudCheck<TObject = unknown>(
  fetchFn: (params: { imei: string; serviceId: number })
    => Promise<IFreeiCloudCheckResponse<TObject>>,
  options?: {
    onSuccess?: (data: IFreeiCloudCheckResponse<TObject>) => void;
    onError?: (error: Error) => void;
  },
): {
  data: IFreeiCloudCheckResponse<TObject> | null;
  error: Error | null;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  mutate: (params: { imei: string; serviceId: number }) => void;
  reset: () => void;
};

// Auto-fetch hooks — fire on mount
function useIFreeiCloudServices(
  fetchFn: () => Promise<IFreeiCloudService[]>,
): { data: IFreeiCloudService[] | null; error: Error | null; isLoading: boolean };

function useIFreeiCloudBalance(
  fetchFn: () => Promise<number>,
  intervalMs?: number,
): { data: number | null; error: Error | null; isLoading: boolean; refetch: () => void };
```

## Error Codes

| Code                   | Triggered by (case-insensitive)              |
|------------------------|----------------------------------------------|
| `INSUFFICIENT_BALANCE` | `insufficient balance`                        |
| `INVALID_KEY`          | `invalid api key`, `invalid key`, or `10234`  |
| `UNKNOWN`              | Anything else (the raw message is preserved) |

## Validators

```typescript
function isValidImeiOrSn(value: string): boolean;   // 11-15 alphanumeric
function isValidServiceId(id: number): boolean;     // integer 0-999 (future-proof)
function isValidApiKey(key: string): boolean;       // 8 groups of 3 alphanum, case-insensitive
```

## Catalog helpers

```typescript
const SERVICES: readonly IFreeiCloudServiceInfo[];
function getServiceById(id: number): IFreeiCloudServiceInfo | undefined;
function getServicesByCategory(category: ServiceCategory): IFreeiCloudServiceInfo[];
```

---

## Complete Service Catalog (72 services, snapshot 2026-04-24)

### Apple (16)

| ID  | Name                                      | Price  | JSON | Flags                       |
|-----|-------------------------------------------|--------|------|-----------------------------|
| 4   | FMI On/Off Status                         | $0.01  | Yes  | apple, fmi-locked           |
| 46  | Replaced Status (Original Device)         | $0.02  | Yes  | apple                       |
| 60  | iCloud Clean/Lost Status (Cellular)       | $0.03  | Yes  | apple, blacklist            |
| 131 | Activation Check                          | $0.02  | Yes  | apple                       |
| 152 | Purchase Date Check                       | $0.03  | Yes  | apple                       |
| 165 | Purchase Country Check                    | $0.05  | Yes  | apple                       |
| 167 | Refurbished Status                        | $0.03  | Yes  | apple                       |
| 171 | Replacement Status (Active Device)        | $0.02  | Yes  | apple                       |
| 206 | Full GSX Report                           | $2.80  | Yes  | apple, new                  |
| 247 | MacBook FMI On/Off Check                  | $0.20  | Yes  | apple, mac, fmi-locked      |
| 249 | MacBook iCloud Clean/Lost Check           | $0.30  | Yes  | apple, mac, blacklist       |
| 274 | Model/Product Description                 | $0.03  | Yes  | apple                       |
| 275 | Apple IMEI/Serial Validator               | $0.005 | Yes  | apple                       |
| 290 | iCloud Clean/Lost Status (WiFi Only)      | $0.06  | Yes  | apple, blacklist            |
| 309 | MDM On/Off Status S2                      | $0.45  | Yes  | apple                       |
| 320 | Sold By Info                              | $2.39  | Yes  | apple, new                  |

### US Carriers (8)

| ID  | Name                                          | Price | JSON | Flags         |
|-----|-----------------------------------------------|-------|------|---------------|
| 13  | US - OLD - Verizon Clean/Lost Check           | $0.05 | No   | us            |
| 145 | US - OLD - T-Mobile Pro Check                 | $0.06 | Yes  | us            |
| 211 | USA Blacklist/Barred Check                    | $0.06 | Yes  | us, blacklist |
| 251 | US - TracFone / StraightTalk Status Check     | $0.10 | Yes  | us            |
| 272 | US - NEW - AT&T Status Check                  | $0.05 | Yes  | us            |
| 273 | US - NEW - T-Mobile Pro Check                 | $0.05 | Yes  | us            |
| 284 | US - NEW - Verizon Finance Check              | $0.04 | Yes  | us            |
| 287 | USA ESN Status                                | $0.10 | Yes  | us            |

### JP Carriers (3)

| ID  | Name                              | Price | JSON | Flags |
|-----|-----------------------------------|-------|------|-------|
| 195 | JP - NTT Docomo Status Check      | $0.03 | Yes  | jp    |
| 236 | JP - SoftBank Finance Check       | $0.03 | Yes  | jp    |
| 237 | JP - KDDI Finance Check           | $0.03 | Yes  | jp    |

### Brand Info (15)

| ID  | Name                                  | Price | JSON |
|-----|---------------------------------------|-------|------|
| 11  | Samsung Info S1                       | $0.12 | Yes  |
| 158 | Huawei Info S1                        | $0.10 | No   |
| 160 | LG Info                               | $0.10 | No   |
| 190 | Samsung Info S2                       | $0.06 | Yes  |
| 196 | Xiaomi Info                           | $0.05 | Yes  |
| 209 | Google Pixel Info                     | $0.12 | Yes  |
| 233 | OnePlus Info                          | $0.06 | Yes  |
| 246 | Motorola Info                         | $0.08 | Yes  |
| 248 | ZTE Info                              | $0.05 | Yes  |
| 283 | Huawei Info S2                        | $0.07 | No   |
| 289 | FID Pro Check (Apple/Samsung/Google)  | $0.03 | Yes  |
| 302 | Samsung Knox Status                   | $0.14 | Yes  |
| 307 | iTel / Tecno / Infinix Info           | $0.02 | Yes  |
| 317 | OPPO Info                             | $0.20 | Yes  |
| 324 | Honor Info                            | $0.08 | Yes  |

### All-in-one (4)

| ID  | Name                              | Price | JSON |
|-----|-----------------------------------|-------|------|
| 120 | All-in-one (Basic Info)           | $0.08 | Yes  |
| 205 | All-in-one (iFreeCheck Mini)      | $0.05 | Yes  |
| 242 | All-in-one (iFreeCheck Pro)       | $0.10 | Yes  |
| 281 | All-in-one (iFreeCheck Ultimate)  | $0.55 | Yes  |

### Generic (16)

| ID  | Name                                    | Price | JSON | Flags                     |
|-----|-----------------------------------------|-------|------|---------------------------|
| 0   | [FREE] Universal Model Check            | FREE  | Yes  |                           |
| 49  | Convert IMEI / IMEI2 / Serial           | $0.02 | Yes  |                           |
| 55  | Blacklist Status                        | $0.02 | Yes  | blacklist                 |
| 56  | Model + Brand + Manufacturer (by IMEI)  | $0.01 | Yes  |                           |
| 81  | Model + Color + Storage                 | $0.02 | Yes  |                           |
| 140 | Warranty Check                          | $0.02 | Yes  | tool                      |
| 225 | Model + Color + Storage + FMI           | $0.03 | Yes  |                           |
| 229 | Part Number / MPN                       | $0.10 | Yes  |                           |
| 241 | SIM-Lock Status                         | $0.03 | Yes  |                           |
| 243 | Carrier + SIM-Lock S1                   | $0.08 | Yes  | blacklist, tool           |
| 252 | Carrier + SIM-Lock S2                   | $0.08 | Yes  | fmi-locked, tool          |
| 253 | Carrier + SIM-Lock S3                   | $0.07 | Yes  | blacklist                 |
| 255 | Carrier + SIM-Lock Only                 | $0.06 | Yes  |                           |
| 286 | Warranty Check Pro                      | $0.02 | Yes  | tool                      |
| 319 | Model + eSIM + pSIM Compatibility       | $0.01 | Yes  |                           |
| 321 | Config Code Check                       | $0.02 | Yes  |                           |

### Laptop (5)

| ID  | Name                                   | Price | JSON | Flags |
|-----|----------------------------------------|-------|------|-------|
| 308 | MacBook Specifications (No CTO)        | $0.20 | Yes  | mac   |
| 313 | Lenovo Laptop Model Check              | $0.02 | No   |       |
| 314 | Dell Laptop Model Check                | $0.02 | No   |       |
| 315 | HP Laptop Model Check                  | $0.02 | No   |       |
| 316 | MacBook Specifications + FMI + MDM     | $0.70 | Yes  | mac   |

### Dev / Testing (5)

| ID  | Name                                  | Price | JSON | Flags |
|-----|---------------------------------------|-------|------|-------|
| 125 | FMI On/Off [Dev-Exclusive]            | $0.01 | Yes  | dev   |
| 238 | Free Check Sample [Dev-Exclusive]     | $0.01 | Yes  | dev   |
| 318 | TESTING - Serial Decoder              | $1.00 | Yes  | tool  |
| 322 | TESTING - Fraud Check                 | $1.00 | Yes  | tool  |
| 323 | TESTING - Model                       | $1.00 | Yes  | tool  |

## Common Pitfalls

- **`object` may be missing** — services with `jsonSupport: false` (Dell/HP/Lenovo, OLD Verizon, Huawei S1/S2, LG) only populate `response`. Always null-check `object` before reading nested fields.
- **All keys are optional in `object`** — even for `jsonSupport: true` services, individual fields can be missing depending on the device. Use safe access patterns.
- **Form-urlencoded** — body must be `application/x-www-form-urlencoded`. The library handles this; only matters when writing a proxy.
- **CORS** — `api.ifreeicloud.co.uk` does NOT support CORS. Backend proxy is mandatory for browser-side use.
- **Balance type** — `client.balance()` returns `number`, not `string`. Tests and proxies need to expect a number.
- **No history / async** — there is no order ID, no polling, no `history()`. Every service in the catalog returns synchronously.
- **Combined ESN+finance** — for `272/273/284/251`, both `<carrier>/deviceStatus` and `<carrier>/financeStatus` come back in a single call. Don't pay twice.
- **Unknown errors** — when you see `IFreeiCloudError` with `code: 'UNKNOWN'`, log the `rawMessage` and consider promoting the pattern in `src/errors.ts`.
- **Service ID validator is permissive** (0-999) so brand-new IDs work even before the local catalog is updated. Always sync the catalog from `client.services()` periodically.
