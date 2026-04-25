# @hopla/ifreeicloud

TypeScript client for the [iFreeiCloud](https://api.ifreeicloud.co.uk) IMEI / iCloud / carrier check API.

- Zero runtime dependencies (uses native `fetch`)
- ESM + CJS + full type definitions
- React hooks via `@hopla/ifreeicloud/react` (no external deps)
- Tree-shakeable (`sideEffects: false`)
- Node.js >= 18
- API surface intentionally parallel to [`@hopla/sickw`](https://github.com/juliochemoreno/sickw) so the two providers can be swapped or used as fallbacks

## Install

```bash
npm install @hopla/ifreeicloud
```

## Quick Start (Node / backend)

```typescript
import { createIFreeiCloudClient } from '@hopla/ifreeicloud';

const client = createIFreeiCloudClient({
  apiKey: process.env.IFREEICLOUD_API_KEY!, // never ship this to the browser
});

// Run an instant service against an IMEI / serial number
const result = await client.check('354442067957123', 287);
console.log(result.response);  // human-readable string
console.log(result.object);    // structured payload (when the service supports JSON)

// Account balance (USD)
const balance = await client.balance(); // → number, e.g. 123.45

// Live service catalog from the API
const services = await client.services();
```

## Quick Start (React + Cloudflare Worker)

### 1. Backend proxy (Cloudflare Worker with Hono)

**Never expose your API key in the browser.** Create a Worker route that forwards requests:

```typescript
// worker/src/routes/ifreeicloud.ts
import { Hono } from 'hono';
import { createIFreeiCloudClient } from '@hopla/ifreeicloud';

const app = new Hono<{ Bindings: { IFREEICLOUD_API_KEY: string } }>();

app.post('/ifreeicloud/check', async (c) => {
  const client = createIFreeiCloudClient({ apiKey: c.env.IFREEICLOUD_API_KEY });
  const { imei, serviceId } = await c.req.json();
  const result = await client.check(imei, serviceId);
  return c.json({ success: true, data: result });
});

app.get('/ifreeicloud/balance', async (c) => {
  const client = createIFreeiCloudClient({ apiKey: c.env.IFREEICLOUD_API_KEY });
  const balance = await client.balance();
  return c.json({ success: true, data: balance });
});

app.get('/ifreeicloud/services', async (c) => {
  const client = createIFreeiCloudClient({ apiKey: c.env.IFREEICLOUD_API_KEY });
  const services = await client.services();
  return c.json({ success: true, data: services });
});

export default app;
```

### 2. Use the hooks

```tsx
import {
  useIFreeiCloudCheck,
  useIFreeiCloudBalance,
  useIFreeiCloudServices,
} from '@hopla/ifreeicloud/react';
import { isValidImeiOrSn } from '@hopla/ifreeicloud';
import { apiPost, apiGet } from '@/lib/api';
import { useState } from 'react';

function ImeiChecker() {
  const [imei, setImei] = useState('');
  const [serviceId, setServiceId] = useState(287);

  const { data: services } = useIFreeiCloudServices(() =>
    apiGet('/ifreeicloud/services').then((r) => r.data!),
  );
  const { data: balance } = useIFreeiCloudBalance(
    () => apiGet('/ifreeicloud/balance').then((r) => r.data!),
    60_000,
  );
  const check = useIFreeiCloudCheck((params) =>
    apiPost('/ifreeicloud/check', params).then((r) => r.data!),
  );

  return (
    <div>
      <p>Balance: ${balance?.toFixed(2)}</p>
      <input
        value={imei}
        onChange={(e) => setImei(e.target.value.trim())}
        placeholder="Enter IMEI or Serial"
        maxLength={15}
      />
      <button
        disabled={!isValidImeiOrSn(imei) || check.isPending}
        onClick={() => check.mutate({ imei, serviceId })}
      >
        {check.isPending ? 'Checking...' : 'Check'}
      </button>
      {check.isSuccess && <pre>{JSON.stringify(check.data!.object, null, 2)}</pre>}
      {check.isError && <p style={{ color: 'red' }}>{check.error!.message}</p>}
    </div>
  );
}
```

## React Hooks

| Hook | Type | Returns |
|------|------|---------|
| `useIFreeiCloudCheck<TObject>(fetchFn, options?)` | Action (manual trigger) | `{ data, error, isPending, isSuccess, isError, mutate, reset }` |
| `useIFreeiCloudServices(fetchFn)` | Auto-fetch on mount | `{ data, error, isLoading }` |
| `useIFreeiCloudBalance(fetchFn, intervalMs?)` | Auto-fetch + refetch | `{ data, error, isLoading, refetch }` |

> No history hook — iFreeiCloud's API does not expose a history endpoint.

## Validators

```typescript
import { isValidImeiOrSn, isValidServiceId, isValidApiKey } from '@hopla/ifreeicloud';

isValidImeiOrSn('354442067957123');                  // true
isValidServiceId(287);                               // true (0-999)
isValidApiKey('PTD-N6N-EUB-6ZT-R6R-ORV-ORB-0MS');    // true (8 groups of 3 alphanum)
```

## Service Catalog

72 services categorized for UI dropdowns and filtering. Snapshot taken 2026-04-24 from the
official panel — call `client.services()` to refresh from the live API.

```typescript
import { SERVICES, getServiceById, getServicesByCategory } from '@hopla/ifreeicloud';

const att = getServiceById(272);
// { id: 272, name: 'US - NEW - AT&T Status Check', price: 0.05, jsonSupport: true,
//   category: 'US Carriers', flags: ['us'] }

const carriers = getServicesByCategory('US Carriers'); // 8 services
```

| Category      | Count | Notes                                                      |
|---------------|-------|------------------------------------------------------------|
| Apple         | 16    | FMI, iCloud, GSX, Sold By, MacBook FMI/iCloud, Validator  |
| US Carriers   | 8     | AT&T, T-Mobile, Verizon, TracFone, Blacklist, ESN         |
| JP Carriers   | 3     | NTT Docomo, KDDI, SoftBank                                |
| Brand Info    | 15    | Samsung, Huawei, Pixel, OnePlus, OPPO, Xiaomi, Honor, …   |
| All-in-one    | 4     | Basic, Mini, Pro, Ultimate                                |
| Generic       | 16    | Universal Model, Carrier+SIM-Lock, Warranty, Convert, …   |
| Laptop        | 5     | Dell, HP, Lenovo, MacBook Specs                           |
| Dev/Testing   | 5     | Dev-Exclusive samples and TESTING-* fraud/model/serial    |

## Error Handling

iFreeiCloud doesn't publish an error-code taxonomy — it returns `{ success: false, error: "<string>" }`.
This client preserves the raw message verbatim and best-effort maps it to a typed code:

```typescript
import { IFreeiCloudError } from '@hopla/ifreeicloud';

try {
  await client.check(imei, serviceId);
} catch (err) {
  if (err instanceof IFreeiCloudError) {
    err.code;        // 'INSUFFICIENT_BALANCE' | 'INVALID_KEY' | 'INVALID_IMEI' | 'UNKNOWN'
    err.rawMessage;  // The original string from the API
  }
}
```

| Code                   | Triggered by (case-insensitive)              |
|------------------------|----------------------------------------------|
| `INSUFFICIENT_BALANCE` | Message contains `insufficient balance`      |
| `INVALID_KEY`          | `invalid api key`, `invalid key`, or `10234` |
| `INVALID_IMEI`         | `invalid imei`, `invalid serial number`, etc. |
| `UNKNOWN`              | Anything else                                |

When you hit an `UNKNOWN` repeatedly in production, open a PR to `errors.ts` to promote the pattern.

## Configuration

```typescript
createIFreeiCloudClient({
  apiKey: 'XXX-XXX-...',                   // Required (can be empty for proxy usage)
  baseUrl: 'https://api.ifreeicloud.co.uk', // Default — override for proxies
  timeout: 60000,                           // Default ms
});
```

## API surface notes

iFreeiCloud's wire format differs from many modern APIs in three places:

1. **Single endpoint** — every operation is `POST https://api.ifreeicloud.co.uk`. The body's
   `service` (for checks) or `accountinfo` (for `servicelist` / `balance`) parameter discriminates.
2. **Body is form-urlencoded**, not JSON.
3. **`object` is optional** — services with `jsonSupport: false` (Dell/HP/Lenovo, OLD Verizon,
   Huawei S1/S2, LG) return only `response` (a string).

The client hides points 1–2 entirely and exposes `object` as `T | undefined` for point 3.

## Documentation

Full reference is in [`docs/`](./docs):

- [`docs/api-docs/iFreeiCloud API.md`](./docs/api-docs/iFreeiCloud%20API.md) — endpoint, auth, envelope, examples
- [`docs/iFreeiCloud Service Reference.md`](./docs/iFreeiCloud%20Service%20Reference.md) — all 72 services, prices, categories

## License

MIT
