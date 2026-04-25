# Postman collection for iFreeiCloud

Two files in this folder:

- `iFreeiCloud.postman_collection.json` — 74 pre-built requests against the live API (2 account + all 72 services), organized in 9 folders by service category. **Generated** from `src/services.ts` — do not edit by hand.
- `iFreeiCloud.postman_environment.json` — environment template with `baseUrl`, `apiKey`, `imei`

To regenerate the collection after editing the catalog:

```bash
npm run postman:generate
```

## HOPLA convention

Drop these files into the **HOPLA Tools** team workspace in Postman so all `@hopla/*` collections
live in one place. This is the same convention used by `@hopla/sickw` and any future `@hopla/*`
SDK package.

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
| Account | 2 | Balance + Service List (free metadata calls) |
| Apple | 16 | FMI, iCloud, GSX, MacBook FMI/iCloud, Validator, etc. |
| US Carriers | 8 | AT&T, T-Mobile, Verizon, TracFone, Blacklist, ESN |
| JP Carriers | 3 | NTT Docomo, SoftBank, KDDI |
| Brand Info | 15 | Samsung, Huawei, Pixel, OnePlus, OPPO, Xiaomi, Honor, … |
| All-in-one | 4 | Basic, Mini, Pro, Ultimate |
| Generic | 16 | Universal Model, Carrier+SIM-Lock, Warranty, Convert, … |
| Laptop | 5 | Dell, HP, Lenovo, MacBook Specs |
| Dev/Testing | 5 | Dev-Exclusive samples and TESTING-* fraud/model/serial |

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
- The collection includes all 72 services from the local catalog (`src/services.ts`). The live API may have more — call **Account → Service List** to refresh, then update `src/services.ts` and run `npm run postman:generate`.
- For programmatic usage, prefer the SDK: `npm install @hopla/ifreeicloud`. The Postman collection is for manual exploration / debugging.
