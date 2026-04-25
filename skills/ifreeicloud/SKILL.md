---
name: ifreeicloud
description: Use when building features that involve IMEI checks, iCloud / FMI status, US or JP carrier checks, ESN / finance status, blacklist checks, MacBook serial lookups, or any integration with the iFreeiCloud API. Teaches how to use the @hopla/ifreeicloud npm library correctly — backend client, React hooks, validators, error handling, and 72-service catalog.
argument-hint: [what to build]
---

# @hopla/ifreeicloud — Integration Guide

Use the `@hopla/ifreeicloud` npm library for all iFreeiCloud API integrations. Do NOT call `api.ifreeicloud.co.uk` directly — the library handles form-encoding, envelope unwrapping, error parsing, and typed responses.

## Install

```bash
npm install @hopla/ifreeicloud
```

## Critical Rules

1. **Never expose the API key in frontend code** — `createIFreeiCloudClient` belongs in the backend only. The key carries account credit.
2. **Always use a backend proxy** — frontend calls your API, your API calls iFreeiCloud.
3. **Validate IMEI/SN before calling** — `isValidImeiOrSn()` (11–15 alphanumeric chars).
4. **`object` is optional** — services with `jsonSupport: false` (Dell/HP/Lenovo, OLD Verizon, Huawei S1/S2, LG) return only `response` (a string). Use `jsonSupport` from the catalog to decide whether to expect structured data.
5. **All checks are instant** — iFreeiCloud has no async / polling endpoint. There is no `history()` like in `@hopla/sickw`.
6. **Wire format** — every call is a `POST` to `https://api.ifreeicloud.co.uk` with `application/x-www-form-urlencoded` body. The library hides this; do not roll your own fetch.

## Architecture

```
React Component
  └─ useIFreeiCloudCheck(fetchFn) hook       ← @hopla/ifreeicloud/react
       └─ fetchFn (your apiPost/apiGet)
            └─ Backend proxy route            ← your Hono/Express/etc
                 └─ createIFreeiCloudClient() ← @hopla/ifreeicloud
                      └─ api.ifreeicloud.co.uk
```

## Backend Setup (Cloudflare Worker + Hono)

```typescript
import { Hono } from 'hono';
import {
  createIFreeiCloudClient,
  isValidImeiOrSn,
  isValidServiceId,
  IFreeiCloudError,
} from '@hopla/ifreeicloud';

const app = new Hono<{ Bindings: { IFREEICLOUD_API_KEY: string } }>();

app.post('/api/ifreeicloud/check', async (c) => {
  const { imei, serviceId } = await c.req.json<{ imei: string; serviceId: number }>();

  if (!isValidImeiOrSn(imei)) return c.json({ success: false, error: 'Invalid IMEI/SN' }, 400);
  if (!isValidServiceId(serviceId)) return c.json({ success: false, error: 'Invalid service ID' }, 400);

  const client = createIFreeiCloudClient({ apiKey: c.env.IFREEICLOUD_API_KEY });

  try {
    const result = await client.check(imei, serviceId);
    return c.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof IFreeiCloudError) {
      return c.json({ success: false, error: err.message, code: err.code }, 400);
    }
    throw err;
  }
});

app.get('/api/ifreeicloud/services', async (c) => {
  const client = createIFreeiCloudClient({ apiKey: c.env.IFREEICLOUD_API_KEY });
  const services = await client.services();
  return c.json({ success: true, data: services });
});

app.get('/api/ifreeicloud/balance', async (c) => {
  const client = createIFreeiCloudClient({ apiKey: c.env.IFREEICLOUD_API_KEY });
  const balance = await client.balance(); // → number, e.g. 123.45
  return c.json({ success: true, data: balance });
});
```

## Multi-Tenant (API Key per User)

Same pattern as `@hopla/sickw`: store one encrypted iFreeiCloud key per user, decrypt and instantiate the client per request.

```typescript
import { Hono } from 'hono';
import {
  createIFreeiCloudClient,
  isValidImeiOrSn,
  isValidServiceId,
  IFreeiCloudError,
} from '@hopla/ifreeicloud';

type Env = { Bindings: { DB: D1Database; JWT_SECRET: string } };
type Variables = { userId: string };

const app = new Hono<Env & { Variables: Variables }>();

const authMiddleware = async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ success: false, error: 'Unauthorized' }, 401);
  const payload = await verifyJwt(token, c.env.JWT_SECRET);
  c.set('userId', payload.sub);
  await next();
};

async function getUserClient(db: D1Database, userId: string) {
  const row = await db
    .prepare('SELECT ifreeicloud_api_key FROM users WHERE id = ?')
    .bind(userId)
    .first();
  if (!row?.ifreeicloud_api_key) throw new Error('No API key configured');
  return createIFreeiCloudClient({ apiKey: decrypt(row.ifreeicloud_api_key) });
}

app.use('/api/ifreeicloud/*', authMiddleware);

app.post('/api/ifreeicloud/check', async (c) => {
  const { imei, serviceId } = await c.req.json<{ imei: string; serviceId: number }>();
  if (!isValidImeiOrSn(imei)) return c.json({ success: false, error: 'Invalid IMEI/SN' }, 400);
  if (!isValidServiceId(serviceId)) return c.json({ success: false, error: 'Invalid service ID' }, 400);

  const client = await getUserClient(c.env.DB, c.get('userId'));
  try {
    const result = await client.check(imei, serviceId);
    return c.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof IFreeiCloudError) {
      return c.json({ success: false, error: err.message, code: err.code }, 400);
    }
    throw err;
  }
});
```

### Frontend: API Key Settings UI

```tsx
import { isValidApiKey } from '@hopla/ifreeicloud';

function ApiKeySettings() {
  const [key, setKey] = useState('');

  const handleSave = async () => {
    if (!isValidApiKey(key)) {
      showError('Invalid API key format (expected XXX-XXX-XXX-XXX-XXX-XXX-XXX-XXX)');
      return;
    }
    await apiPost('/api/settings/ifreeicloud-key', { apiKey: key });
    setKey('');
  };

  return (
    <div>
      <input
        type="password"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="XXX-XXX-XXX-XXX-XXX-XXX-XXX-XXX"
      />
      <button onClick={handleSave} disabled={!key}>Save API Key</button>
    </div>
  );
}
```

### Multi-Tenant Rules

1. **Encrypt at rest** — store the key encrypted in your DB, decrypt only when instantiating the client.
2. **Never return to frontend** — the key goes IN via settings, never comes back OUT.
3. **Client is per-request** — `createIFreeiCloudClient` is a lightweight closure, safe to create on every request.
4. **Validate on input** — `isValidApiKey()` in the settings UI before sending to backend.
5. **Graceful missing key** — if user hasn't configured a key, return a clear app-level error (not an iFreeiCloud API error).

## Frontend React Hooks

```typescript
import {
  useIFreeiCloudCheck,
  useIFreeiCloudServices,
  useIFreeiCloudBalance,
} from '@hopla/ifreeicloud/react';
import { isValidImeiOrSn } from '@hopla/ifreeicloud';

// Action hook (manual trigger via .mutate())
const check = useIFreeiCloudCheck<{ model?: string }>(
  (params) => apiPost('/api/ifreeicloud/check', params).then((r) => r.data!),
);
check.mutate({ imei: '354442067957123', serviceId: 287 });
// → { data, error, isPending, isSuccess, isError, mutate, reset }

// Auto-fetch hooks (fetch on mount)
const { data: services } = useIFreeiCloudServices(
  () => apiGet('/api/ifreeicloud/services').then((r) => r.data!),
);

const { data: balance, refetch } = useIFreeiCloudBalance(
  () => apiGet('/api/ifreeicloud/balance').then((r) => r.data!),
  60_000, // optional refetch interval (ms)
);
```

> No `useIFreeiCloudHistory` — iFreeiCloud has no history endpoint. All checks are instant.

## Validators (use in both frontend and backend)

```typescript
import { isValidImeiOrSn, isValidServiceId, isValidApiKey } from '@hopla/ifreeicloud';

isValidImeiOrSn('354442067957123');                  // true — 11-15 alphanumeric
isValidServiceId(287);                               // true — integer 0-999
isValidApiKey('PTD-N6N-EUB-6ZT-R6R-ORV-ORB-0MS');    // true — 8 groups of 3 alphanum (case-insensitive)
```

## Error Handling

iFreeiCloud doesn't publish a stable error-code taxonomy — it returns `{ success: false, error: "<string>" }`. The library best-effort maps the message to a typed code and **always** preserves the raw string on `rawMessage`.

```typescript
import { IFreeiCloudError } from '@hopla/ifreeicloud';

try {
  const result = await client.check(imei, serviceId);
} catch (err) {
  if (err instanceof IFreeiCloudError) {
    // err.code: 'INSUFFICIENT_BALANCE' | 'INVALID_KEY' | 'UNKNOWN'
    // err.rawMessage: original API error string (verbatim)
    // err.message: '[INSUFFICIENT_BALANCE] Account balance is too low...: <raw>'
  }
}
```

| Code                   | Triggered by (case-insensitive)              |
|------------------------|----------------------------------------------|
| `INSUFFICIENT_BALANCE` | `insufficient balance`                        |
| `INVALID_KEY`          | `invalid api key`, `invalid key`, or `10234`  |
| `UNKNOWN`              | Anything else                                 |

When you start seeing the same `UNKNOWN` message repeatedly in production, promote it: open a PR adding the regex to `parseErrorMessage` in `src/errors.ts`.

## Service Catalog (for building UI dropdowns)

```typescript
import { SERVICES, getServiceById, getServicesByCategory } from '@hopla/ifreeicloud';

const att = getServiceById(272);
// {
//   id: 272,
//   name: 'US - NEW - AT&T Status Check',
//   price: 0.05,
//   jsonSupport: true,
//   category: 'US Carriers',
//   flags: ['us']
// }

const carriers = getServicesByCategory('US Carriers'); // 8 services
const apple    = getServicesByCategory('Apple');       // 16 services
```

| Category      | Count | Notes                                                       |
|---------------|-------|-------------------------------------------------------------|
| Apple         | 16    | FMI, iCloud, GSX, Sold By, MacBook FMI/iCloud, Validator   |
| US Carriers   | 8     | AT&T, T-Mobile, Verizon, TracFone, Blacklist, ESN          |
| JP Carriers   | 3     | NTT Docomo, KDDI, SoftBank                                 |
| Brand Info    | 15    | Samsung, Huawei, Pixel, OnePlus, OPPO, Xiaomi, Honor, …    |
| All-in-one    | 4     | Basic, Mini, Pro, Ultimate                                 |
| Generic       | 16    | Universal Model, Carrier+SIM-Lock, Warranty, Convert, …    |
| Laptop        | 5     | Dell, HP, Lenovo, MacBook Specs                            |
| Dev/Testing   | 5     | Dev-Exclusive samples and TESTING-* fraud/model/serial     |

## Combined ESN + Finance (US Carriers)

For US carrier services (`272 AT&T`, `273 T-Mobile`, `284 Verizon`, `251 TracFone`), iFreeiCloud returns **both** ESN status (`deviceStatus`) and finance status (`financeStatus`) in a single call. You only pay once.

```typescript
const result = await client.check(imei, 272);
const obj = result.object as Record<string, string> | undefined;

// Field names use the prefix `<carrier>/...`:
// e.g. `att/deviceStatus`, `att/financeStatus`
const esn = Object.entries(obj ?? {}).find(([k]) => k.endsWith('deviceStatus'))?.[1];
const fin = Object.entries(obj ?? {}).find(([k]) => k.endsWith('financeStatus'))?.[1];
```

The actual key prefix varies by carrier (`att/`, `tmobile/`, `verizon/`, `tracfone/`). Match by suffix as shown above.

## Routing by carrier (legacy pattern)

Common pattern when building a "check this IMEI" feature: first call a cheap service to discover the carrier, then route to the correct paid carrier service.

```typescript
const universal = await client.check(imei, 0);   // FREE Universal Model Check
const carrier = (universal.object as { lockedCarrier?: string })?.lockedCarrier ?? '';

let serviceId: number | null = null;
if (/at&t/i.test(carrier))           serviceId = 272;
else if (/t-mobile|sprint/i.test(carrier)) serviceId = 273;
else if (/verizon/i.test(carrier))   serviceId = 284;
else if (/trac/i.test(carrier))      serviceId = 251;
else if (/unlock/i.test(carrier))    serviceId = null; // skip — already unlocked
// else: unknown carrier, log and skip

if (serviceId !== null) {
  const carrierResult = await client.check(imei, serviceId);
  // carrierResult.object has both deviceStatus + financeStatus
}
```

## Combining with @hopla/sickw

Both libraries expose intentionally parallel APIs (`createXClient`, `.check`, `.balance`, `.services`, hooks). When you want a primary + fallback pattern (e.g., Sickw first, iFreeiCloud as fallback), the only thing that differs is the import and the service IDs.

```typescript
import { createSickwClient, SickwError } from '@hopla/sickw';
import { createIFreeiCloudClient, IFreeiCloudError } from '@hopla/ifreeicloud';

async function checkVerizonEsn(imei: string) {
  // Try Sickw first (cheaper)
  try {
    const sickw = createSickwClient({ apiKey: process.env.SICKW_API_KEY! });
    return await sickw.check(imei, 9); // Verizon USA Status Pro
  } catch (err) {
    if (!(err instanceof SickwError)) throw err;
  }
  // Fallback to iFreeiCloud
  const ifree = createIFreeiCloudClient({ apiKey: process.env.IFREEICLOUD_API_KEY! });
  return await ifree.check(imei, 284); // US - NEW - Verizon Finance Check
}
```

## Common Pitfalls

- **`object` may be missing** — for `jsonSupport: false` services, `object` is `undefined`. Don't blindly access nested fields; check first.
- **Form-urlencoded only** — never send a JSON body. The library does this for you; only matters if you're building a proxy.
- **Balance is a number, not a string** — `client.balance()` returns `number` (parsed from `object.account_balance`). It throws `IFreeiCloudError` if the API response doesn't include the field.
- **No `format` parameter** — Sickw has `beta`/`json`/`html`/`notags`/`instant`; iFreeiCloud has one shape only.
- **No `history()` / no async** — every service the catalog lists is instant. There's no order ID to poll.
- **CORS** — `api.ifreeicloud.co.uk` does NOT support CORS. Backend proxy is mandatory.
- **Timeout** — default 60s. Most services finish in seconds, but a few (GSX-style, MDM) can take longer.
- **Service ID range** — validator accepts 0–999 to be future-proof. Live IDs in 2026-04-24 catalog go up to 324.

For detailed types and the complete service list, see the reference file in this skill directory.
