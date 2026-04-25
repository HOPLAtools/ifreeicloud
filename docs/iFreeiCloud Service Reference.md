# iFreeiCloud Service Reference

Snapshot of the `Instant Services & Prices` panel from `https://api.ifreeicloud.co.uk/services`,
captured **2026-04-24**. Total: **72 services**.

> The panel only exposes instant services. Manual or queued services are not listed and do
> not have an ID in this catalog.

The `JSON` column indicates whether the service returns a structured `object` payload
(`Yes`) or only a human-readable `response` string (`No`). Categories are local — derived
from the service name + the icons in the panel; they are not part of the wire response.

## Apple (16)

| ID  | Service                                          | Price  | JSON | Flags                          |
|-----|--------------------------------------------------|--------|------|--------------------------------|
| 4   | FMI On/Off Status                                | $0.01  | Yes  | apple, fmi-locked              |
| 46  | Replaced Status (Original Device)                | $0.02  | Yes  | apple                          |
| 60  | iCloud Clean/Lost Status (Cellular)              | $0.03  | Yes  | apple, blacklist               |
| 131 | Activation Check                                 | $0.02  | Yes  | apple                          |
| 152 | Purchase Date Check                              | $0.03  | Yes  | apple                          |
| 165 | Purchase Country Check                           | $0.05  | Yes  | apple                          |
| 167 | Refurbished Status                               | $0.03  | Yes  | apple                          |
| 171 | Replacement Status (Active Device)               | $0.02  | Yes  | apple                          |
| 206 | Full GSX Report                                  | $2.80  | Yes  | apple, new                     |
| 247 | MacBook FMI On/Off Check                         | $0.20  | Yes  | apple, mac, fmi-locked         |
| 249 | MacBook iCloud Clean/Lost Check                  | $0.30  | Yes  | apple, mac, blacklist          |
| 274 | Model/Product Description                        | $0.03  | Yes  | apple                          |
| 275 | Apple IMEI/Serial Validator                      | $0.005 | Yes  | apple                          |
| 290 | iCloud Clean/Lost Status (WiFi Only)             | $0.06  | Yes  | apple, blacklist               |
| 309 | MDM On/Off Status S2                             | $0.45  | Yes  | apple                          |
| 320 | Sold By Info                                     | $2.39  | Yes  | apple, new                     |

## US Carriers (8)

| ID  | Service                                              | Price | JSON | Flags             |
|-----|------------------------------------------------------|-------|------|-------------------|
| 13  | US - OLD - Verizon Clean/Lost Check                  | $0.05 | No   | us                |
| 145 | US - OLD - T-Mobile Pro Check                        | $0.06 | Yes  | us                |
| 211 | USA Blacklist/Barred Check                           | $0.06 | Yes  | us, blacklist     |
| 251 | US - TracFone / StraightTalk Status Check            | $0.10 | Yes  | us                |
| 272 | US - NEW - AT&T Status Check                         | $0.05 | Yes  | us                |
| 273 | US - NEW - T-Mobile Pro Check                        | $0.05 | Yes  | us                |
| 284 | US - NEW - Verizon Finance Check                     | $0.04 | Yes  | us                |
| 287 | USA ESN Status                                       | $0.10 | Yes  | us                |

## JP Carriers (3)

| ID  | Service                            | Price | JSON | Flags |
|-----|------------------------------------|-------|------|-------|
| 195 | JP - NTT Docomo Status Check       | $0.03 | Yes  | jp    |
| 236 | JP - SoftBank Finance Check        | $0.03 | Yes  | jp    |
| 237 | JP - KDDI Finance Check            | $0.03 | Yes  | jp    |

## Brand Info (15)

| ID  | Service                                  | Price | JSON |
|-----|------------------------------------------|-------|------|
| 11  | Samsung Info S1                          | $0.12 | Yes  |
| 158 | Huawei Info S1                           | $0.10 | No   |
| 160 | LG Info                                  | $0.10 | No   |
| 190 | Samsung Info S2                          | $0.06 | Yes  |
| 196 | Xiaomi Info                              | $0.05 | Yes  |
| 209 | Google Pixel Info                        | $0.12 | Yes  |
| 233 | OnePlus Info                             | $0.06 | Yes  |
| 246 | Motorola Info                            | $0.08 | Yes  |
| 248 | ZTE Info                                 | $0.05 | Yes  |
| 283 | Huawei Info S2                           | $0.07 | No   |
| 289 | FID Pro Check (Apple/Samsung/Google)     | $0.03 | Yes  |
| 302 | Samsung Knox Status                      | $0.14 | Yes  |
| 307 | iTel / Tecno / Infinix Info              | $0.02 | Yes  |
| 317 | OPPO Info                                | $0.20 | Yes  |
| 324 | Honor Info                               | $0.08 | Yes  |

## All-in-one bundles (4)

| ID  | Service                              | Price | JSON |
|-----|--------------------------------------|-------|------|
| 120 | All-in-one (Basic Info)              | $0.08 | Yes  |
| 205 | All-in-one (iFreeCheck Mini)         | $0.05 | Yes  |
| 242 | All-in-one (iFreeCheck Pro)          | $0.10 | Yes  |
| 281 | All-in-one (iFreeCheck Ultimate)     | $0.55 | Yes  |

## Generic (16)

| ID  | Service                                  | Price | JSON | Flags                       |
|-----|------------------------------------------|-------|------|-----------------------------|
| 0   | [FREE] Universal Model Check             | FREE  | Yes  |                             |
| 49  | Convert IMEI / IMEI2 / Serial            | $0.02 | Yes  |                             |
| 55  | Blacklist Status                         | $0.02 | Yes  | blacklist                   |
| 56  | Model + Brand + Manufacturer (by IMEI)   | $0.01 | Yes  |                             |
| 81  | Model + Color + Storage                  | $0.02 | Yes  |                             |
| 140 | Warranty Check                           | $0.02 | Yes  | tool                        |
| 225 | Model + Color + Storage + FMI            | $0.03 | Yes  |                             |
| 229 | Part Number / MPN                        | $0.10 | Yes  |                             |
| 241 | SIM-Lock Status                          | $0.03 | Yes  |                             |
| 243 | Carrier + SIM-Lock S1                    | $0.08 | Yes  | blacklist, tool             |
| 252 | Carrier + SIM-Lock S2                    | $0.08 | Yes  | fmi-locked, tool            |
| 253 | Carrier + SIM-Lock S3                    | $0.07 | Yes  | blacklist                   |
| 255 | Carrier + SIM-Lock Only                  | $0.06 | Yes  |                             |
| 286 | Warranty Check Pro                       | $0.02 | Yes  | tool                        |
| 319 | Model + eSIM + pSIM Compatibility        | $0.01 | Yes  |                             |
| 321 | Config Code Check                        | $0.02 | Yes  |                             |

## Laptop (5)

| ID  | Service                                  | Price | JSON | Flags |
|-----|------------------------------------------|-------|------|-------|
| 308 | MacBook Specifications (No CTO)          | $0.20 | Yes  | mac   |
| 313 | Lenovo Laptop Model Check                | $0.02 | No   |       |
| 314 | Dell Laptop Model Check                  | $0.02 | No   |       |
| 315 | HP Laptop Model Check                    | $0.02 | No   |       |
| 316 | MacBook Specifications + FMI + MDM       | $0.70 | Yes  | mac   |

## Dev / Testing (5)

| ID  | Service                              | Price | JSON | Flags |
|-----|--------------------------------------|-------|------|-------|
| 125 | FMI On/Off [Dev-Exclusive]           | $0.01 | Yes  | dev   |
| 238 | Free Check Sample [Dev-Exclusive]    | $0.01 | Yes  | dev   |
| 318 | TESTING - Serial Decoder             | $1.00 | Yes  | tool  |
| 322 | TESTING - Fraud Check                | $1.00 | Yes  | tool  |
| 323 | TESTING - Model                      | $1.00 | Yes  | tool  |

## Icon legend (from the panel)

| Icon | Meaning                                       |
|------|-----------------------------------------------|
| 🔒    | Requires locked / FMI ON device               |
| 🔧    | Tool / utility / testing service              |
| 🌐    | Dev-exclusive endpoint                        |
| 🇺🇸    | US-specific carrier coverage                  |
| 🇯🇵    | Japan-specific carrier coverage               |
| 💻    | MacBook-specific                              |
| 🍎    | Apple-only                                    |
| 🅱    | Blacklist / iCloud-related                    |

## Legacy footprint (Phones.Trade)

The IDs currently consumed in production by the Phones.Trade backend are:

| ID  | Used for                            |
|-----|-------------------------------------|
| 0   | Universal Model lookup (iPad/Mac)   |
| 238 | MacBook model sample (dev)          |
| 251 | TracFone ESN + finance              |
| 272 | AT&T ESN + finance                  |
| 273 | T-Mobile ESN + finance              |
| 284 | Verizon ESN + finance               |

For each US-carrier ID the response carries both ESN (`deviceStatus`) and finance
(`financeStatus`) in a single call, so a one-shot is enough — see the legacy report
`ifreeicloud-flujo-detallado.md`.
