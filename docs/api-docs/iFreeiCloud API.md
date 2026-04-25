# iFreeiCloud API — Reference

> Adapted from the panel docs at `https://api.ifreeicloud.co.uk/services`.
> Examples use a placeholder API key — replace it with your own from the dashboard.

---

## 1. Overview

iFreeiCloud exposes an HTTP API for *instant checks* on devices (IMEI / serial number) and for
account metadata (service list, balance). All requests are **POST** against a single host —
the operation is discriminated by the body parameters.

| Attribute            | Value                                  |
|----------------------|----------------------------------------|
| Host                 | `https://api.ifreeicloud.co.uk`        |
| Method               | `POST`                                 |
| Request format       | `application/x-www-form-urlencoded`    |
| Response format      | `JSON`                                 |
| Panel               | `https://api.ifreeicloud.co.uk/services` |

### Logical operations

| Purpose                | Discriminator                                  |
|------------------------|------------------------------------------------|
| Run an instant service | `service=<numeric ID>` + `imei=<value>`        |
| List services          | `accountinfo=servicelist`                      |
| Get balance            | `accountinfo=balance`                          |

---

## 2. Authentication

Every request requires the API key on the **`key`** body parameter. The key is personal —
all consumption is debited from its associated account. Use the *Account Balance API* to
monitor it.

---

## 3. Standard envelope

Every response uses the same shape:

```jsonc
{
  "success": true,           // false on error
  "error":   "…",            // human-readable error string when success !== true
  "response": "…",           // human-readable text / HTML
  "object":   { /* … */ }    // structured payload (only for services with jsonSupport)
}
```

Recommended error handling (from the official PHP example):

```php
if ($httpcode != 200) {
    echo "Error: HTTP Code $httpcode";
} elseif ($myResult->success !== true) {
    echo "Error: " . $myResult->error;
} else {
    echo $myResult->response;          // human-readable
    // $myResult->object holds the structured JSON
}
```

The `@hopla/ifreeicloud` client wraps this for you — it throws `IFreeiCloudError` (with the
parsed code and the raw message) when `success !== true`.

---

## 4. Endpoint A — Run an Instant Service

| Field     | Type    | Required | Description                                                         |
|-----------|---------|----------|---------------------------------------------------------------------|
| `service` | integer | Yes      | Service ID (see service reference)                                  |
| `imei`    | string  | Yes      | IMEI (15 digits) or serial number, depending on the service         |
| `key`     | string  | Yes      | Account API key                                                     |

### TypeScript (`@hopla/ifreeicloud`)

```typescript
import { createIFreeiCloudClient } from '@hopla/ifreeicloud';

const client = createIFreeiCloudClient({ apiKey: process.env.IFREEICLOUD_API_KEY! });
const result = await client.check('354442067957123', 287);
console.log(result.response);
console.log(result.object);
```

### cURL

```bash
curl -X POST https://api.ifreeicloud.co.uk \
  -d "service=287" \
  -d "imei=354442067957123" \
  -d "key=$IFREEICLOUD_API_KEY"
```

---

## 5. Endpoint B — Service List

| Field         | Type   | Required | Value                              |
|---------------|--------|----------|-------------------------------------|
| `accountinfo` | string | Yes      | `servicelist`                       |
| `key`         | string | Yes      | Account API key                     |

`response` returns an HTML table for humans; `object` returns the structured list (Service ID,
Name, Price, Processing Time, Serial support).

### TypeScript

```typescript
const services = await client.services();
```

### cURL

```bash
curl -X POST https://api.ifreeicloud.co.uk \
  -d "accountinfo=servicelist" \
  -d "key=$IFREEICLOUD_API_KEY"
```

---

## 6. Endpoint C — Account Balance

| Field         | Type   | Required | Value                         |
|---------------|--------|----------|-------------------------------|
| `accountinfo` | string | Yes      | `balance`                     |
| `key`         | string | Yes      | Account API key               |

The numeric balance lives at `object.account_balance`. The `@hopla/ifreeicloud` client
parses this into a `number` for you.

### TypeScript

```typescript
const balance = await client.balance(); // number, e.g. 123.45
```

### cURL

```bash
curl -X POST https://api.ifreeicloud.co.uk \
  -d "accountinfo=balance" \
  -d "key=$IFREEICLOUD_API_KEY"
```

---

## 7. Error handling

iFreeiCloud doesn't publish a stable error-code taxonomy — only a free-form `error` string.
The client maps the patterns we've seen to typed codes and preserves the raw message:

| Typed code             | Triggered by (case-insensitive)              |
|------------------------|----------------------------------------------|
| `INSUFFICIENT_BALANCE` | `insufficient balance`                        |
| `INVALID_KEY`          | `invalid api key`, `invalid key`, or `10234`  |
| `INVALID_IMEI`         | `invalid imei`, `invalid serial number`, etc. |
| `UNKNOWN`              | Anything else                                 |

```typescript
import { IFreeiCloudError } from '@hopla/ifreeicloud';

try {
  await client.check(imei, serviceId);
} catch (err) {
  if (err instanceof IFreeiCloudError) {
    err.code;        // typed code
    err.rawMessage;  // verbatim string
  }
}
```

When a new pattern shows up repeatedly in production, promote it from `UNKNOWN` to a typed
code in `src/errors.ts`.

---

## 8. Postman collection

A pre-built Postman collection lives at [`docs/postman/`](../postman/). Import the
`*.postman_collection.json` and `*.postman_environment.json` into Postman, set your `apiKey` in the
environment, and you have ~17 ready-to-send requests covering account, Apple, US carriers, and JP
carriers. See [`docs/postman/README.md`](../postman/README.md) for setup details.

## 9. Best practices

1. **Retries**: when the underlying `fetch` rejects (`AbortError`, network) or HTTP is non-2xx,
   retry with exponential backoff. The default per-request timeout is 60 s.
2. **Cheap pre-validation**: use service `275 — Apple IMEI/Serial Validator` ($0.005) to gate
   expensive checks when the input source is untrusted.
3. **Cache `services()`**: the panel labels the API v1.0 Beta. Cache the live service list
   daily to detect new IDs and price changes without paying the round-trip on every UI render.
4. **Don't ship the key to the browser**: the API key carries account credit. Always proxy
   through a backend (Cloudflare Worker, Express, etc.) and use this client there.
5. **Watch balance**: the legacy integration alerts to Slack on `INSUFFICIENT_BALANCE` and
   `INVALID_KEY`. Wire similar alarms early — these are the two errors you'll actually see.
