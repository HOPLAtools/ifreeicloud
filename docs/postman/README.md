# Postman collection for iFreeiCloud

Two files in this folder:

- `iFreeiCloud.postman_collection.json` — 17 pre-built requests against the live API
- `iFreeiCloud.postman_environment.json` — environment template with `baseUrl`, `apiKey`, `imei`

## Import

1. Open Postman → **File → Import** (or `⌘O` on macOS)
2. Drop both files into the dialog
3. Pick the **iFreeiCloud (template)** environment from the top-right dropdown
4. Click the eye icon next to the environment name → **Edit** → set your real `apiKey` (and optionally a real `imei` you'll be testing with)

## Or use the CLI

```bash
# From the package install (after npm i @hopla/ifreeicloud)
ls node_modules/@hopla/ifreeicloud/docs/postman/

# Or after a git clone
ls ~/Projects/hopla/ifreeicloud/docs/postman/
```

Drop the JSON files into Postman from there.

## What's included

| Folder | Requests | Notes |
|--------|----------|-------|
| Account | Balance, Service List | Free metadata calls |
| Free / Cheap | Service 0 (FREE), 275 ($0.005) | Safe to spam while exploring |
| Apple | 4, 60, 131, 247, 206 | Free 2.80 GSX is the most expensive — careful |
| US Carriers | 272, 273, 284, 251, 211, 287 | Each carrier-specific call returns ESN + finance |
| JP Carriers | 195, 236, 237 | NTT Docomo, SoftBank, KDDI |

Every request has a built-in test that asserts HTTP 200 + envelope shape (`success` field present), and logs the API's `error` string to the Postman console when `success: false`.

## Variables

The collection uses three variables, resolved against the active environment:

| Variable  | Default                              | Notes                                      |
|-----------|--------------------------------------|--------------------------------------------|
| `baseUrl` | `https://api.ifreeicloud.co.uk`     | Override for proxies                       |
| `apiKey`  | `YOUR_API_KEY_HERE`                  | **Set in your environment, not the file**  |
| `imei`    | `354442067957123`                    | Replace with a real IMEI/serial            |

## Notes

- All requests are POST `application/x-www-form-urlencoded`. The body params discriminate the operation (`service` for checks, `accountinfo` for balance/services).
- `name` fields in the Service List response include HTML entities (e.g. `&#128274;` for 🔒). Decode at render-time if you display them.
- The catalog has 73+ services live — this collection only includes ~17 representative IDs. For the full list, run **Account → Service List** or see `docs/iFreeiCloud Service Reference.md`.
- For programmatic usage, prefer the SDK: `npm install @hopla/ifreeicloud`. The Postman collection is for manual exploration / debugging.
