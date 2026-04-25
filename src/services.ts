import type { IFreeiCloudServiceInfo, ServiceCategory } from './types.js';

/**
 * Local catalog of the 72 instant services available on iFreeiCloud as of 2026-04-24.
 *
 * Source: `~/Desktop/ifreeicloud/FreeiCloud_API_Documentation.md`, panel
 * `https://api.ifreeicloud.co.uk/services`.
 *
 * The API doesn't publish categories — those are derived from the service name + the icons
 * shown in the panel. Re-run a sync against the live `services()` endpoint when iFreeiCloud
 * adds, renames, or reprices entries.
 */
export const SERVICES: readonly IFreeiCloudServiceInfo[] = [
  // ──────────────── Apple (16) ────────────────
  { id: 4,   name: 'FMI On/Off Status',                      price: 0.01,  jsonSupport: true,  category: 'Apple', flags: ['apple', 'fmi-locked'] },
  { id: 46,  name: 'Replaced Status (Original Device)',      price: 0.02,  jsonSupport: true,  category: 'Apple', flags: ['apple'] },
  { id: 60,  name: 'iCloud Clean/Lost Status (Cellular)',    price: 0.03,  jsonSupport: true,  category: 'Apple', flags: ['apple', 'blacklist'] },
  { id: 131, name: 'Activation Check',                       price: 0.02,  jsonSupport: true,  category: 'Apple', flags: ['apple'] },
  { id: 152, name: 'Purchase Date Check',                    price: 0.03,  jsonSupport: true,  category: 'Apple', flags: ['apple'] },
  { id: 165, name: 'Purchase Country Check',                 price: 0.05,  jsonSupport: true,  category: 'Apple', flags: ['apple'] },
  { id: 167, name: 'Refurbished Status',                     price: 0.03,  jsonSupport: true,  category: 'Apple', flags: ['apple'] },
  { id: 171, name: 'Replacement Status (Active Device)',     price: 0.02,  jsonSupport: true,  category: 'Apple', flags: ['apple'] },
  { id: 206, name: 'Full GSX Report',                        price: 2.80,  jsonSupport: true,  category: 'Apple', flags: ['apple', 'new'] },
  { id: 247, name: 'MacBook FMI On/Off Check',               price: 0.20,  jsonSupport: true,  category: 'Apple', flags: ['apple', 'mac', 'fmi-locked'] },
  { id: 249, name: 'MacBook iCloud Clean/Lost Check',        price: 0.30,  jsonSupport: true,  category: 'Apple', flags: ['apple', 'mac', 'blacklist'] },
  { id: 274, name: 'Model/Product Description',              price: 0.03,  jsonSupport: true,  category: 'Apple', flags: ['apple'] },
  { id: 275, name: 'Apple IMEI/Serial Validator',            price: 0.005, jsonSupport: true,  category: 'Apple', flags: ['apple'] },
  { id: 290, name: 'iCloud Clean/Lost Status (WiFi Only)',   price: 0.06,  jsonSupport: true,  category: 'Apple', flags: ['apple', 'blacklist'] },
  { id: 309, name: 'MDM On/Off Status S2',                   price: 0.45,  jsonSupport: true,  category: 'Apple', flags: ['apple'] },
  { id: 320, name: 'Sold By Info',                           price: 2.39,  jsonSupport: true,  category: 'Apple', flags: ['apple', 'new'] },

  // ──────────────── US Carriers (8) ────────────────
  { id: 13,  name: 'US - OLD - Verizon Clean/Lost Check',    price: 0.05,  jsonSupport: false, category: 'US Carriers', flags: ['us'] },
  { id: 145, name: 'US - OLD - T-Mobile Pro Check',          price: 0.06,  jsonSupport: true,  category: 'US Carriers', flags: ['us'] },
  { id: 211, name: 'USA Blacklist/Barred Check',             price: 0.06,  jsonSupport: true,  category: 'US Carriers', flags: ['us', 'blacklist'] },
  { id: 251, name: 'US - TracFone / StraightTalk Status Check', price: 0.10, jsonSupport: true, category: 'US Carriers', flags: ['us'] },
  { id: 272, name: 'US - NEW - AT&T Status Check',           price: 0.05,  jsonSupport: true,  category: 'US Carriers', flags: ['us'] },
  { id: 273, name: 'US - NEW - T-Mobile Pro Check',          price: 0.05,  jsonSupport: true,  category: 'US Carriers', flags: ['us'] },
  { id: 284, name: 'US - NEW - Verizon Finance Check',       price: 0.04,  jsonSupport: true,  category: 'US Carriers', flags: ['us'] },
  { id: 287, name: 'USA ESN Status',                         price: 0.10,  jsonSupport: true,  category: 'US Carriers', flags: ['us'] },

  // ──────────────── JP Carriers (3) ────────────────
  { id: 195, name: 'JP - NTT Docomo Status Check',           price: 0.03,  jsonSupport: true,  category: 'JP Carriers', flags: ['jp'] },
  { id: 236, name: 'JP - SoftBank Finance Check',            price: 0.03,  jsonSupport: true,  category: 'JP Carriers', flags: ['jp'] },
  { id: 237, name: 'JP - KDDI Finance Check',                price: 0.03,  jsonSupport: true,  category: 'JP Carriers', flags: ['jp'] },

  // ──────────────── Brand Info (15) ────────────────
  { id: 11,  name: 'Samsung Info S1',                        price: 0.12,  jsonSupport: true,  category: 'Brand Info', flags: [] },
  { id: 158, name: 'Huawei Info S1',                         price: 0.10,  jsonSupport: false, category: 'Brand Info', flags: [] },
  { id: 160, name: 'LG Info',                                price: 0.10,  jsonSupport: false, category: 'Brand Info', flags: [] },
  { id: 190, name: 'Samsung Info S2',                        price: 0.06,  jsonSupport: true,  category: 'Brand Info', flags: [] },
  { id: 196, name: 'Xiaomi Info',                            price: 0.05,  jsonSupport: true,  category: 'Brand Info', flags: [] },
  { id: 209, name: 'Google Pixel Info',                      price: 0.12,  jsonSupport: true,  category: 'Brand Info', flags: [] },
  { id: 233, name: 'OnePlus Info',                           price: 0.06,  jsonSupport: true,  category: 'Brand Info', flags: [] },
  { id: 246, name: 'Motorola Info',                          price: 0.08,  jsonSupport: true,  category: 'Brand Info', flags: [] },
  { id: 248, name: 'ZTE Info',                               price: 0.05,  jsonSupport: true,  category: 'Brand Info', flags: [] },
  { id: 283, name: 'Huawei Info S2',                         price: 0.07,  jsonSupport: false, category: 'Brand Info', flags: [] },
  { id: 289, name: 'FID Pro Check (Apple/Samsung/Google)',   price: 0.03,  jsonSupport: true,  category: 'Brand Info', flags: [] },
  { id: 302, name: 'Samsung Knox Status',                    price: 0.14,  jsonSupport: true,  category: 'Brand Info', flags: [] },
  { id: 307, name: 'iTel / Tecno / Infinix Info',            price: 0.02,  jsonSupport: true,  category: 'Brand Info', flags: [] },
  { id: 317, name: 'OPPO Info',                              price: 0.20,  jsonSupport: true,  category: 'Brand Info', flags: [] },
  { id: 324, name: 'Honor Info',                             price: 0.08,  jsonSupport: true,  category: 'Brand Info', flags: [] },

  // ──────────────── All-in-one (4) ────────────────
  { id: 120, name: 'All-in-one (Basic Info)',                price: 0.08,  jsonSupport: true,  category: 'All-in-one', flags: [] },
  { id: 205, name: 'All-in-one (iFreeCheck Mini)',           price: 0.05,  jsonSupport: true,  category: 'All-in-one', flags: [] },
  { id: 242, name: 'All-in-one (iFreeCheck Pro)',            price: 0.10,  jsonSupport: true,  category: 'All-in-one', flags: [] },
  { id: 281, name: 'All-in-one (iFreeCheck Ultimate)',       price: 0.55,  jsonSupport: true,  category: 'All-in-one', flags: [] },

  // ──────────────── Generic (16) ────────────────
  { id: 0,   name: '[FREE] Universal Model Check',           price: 0,     jsonSupport: true,  category: 'Generic', flags: [] },
  { id: 49,  name: 'Convert IMEI / IMEI2 / Serial',          price: 0.02,  jsonSupport: true,  category: 'Generic', flags: [] },
  { id: 55,  name: 'Blacklist Status',                       price: 0.02,  jsonSupport: true,  category: 'Generic', flags: ['blacklist'] },
  { id: 56,  name: 'Model + Brand + Manufacturer (by IMEI)', price: 0.01,  jsonSupport: true,  category: 'Generic', flags: [] },
  { id: 81,  name: 'Model + Color + Storage',                price: 0.02,  jsonSupport: true,  category: 'Generic', flags: [] },
  { id: 140, name: 'Warranty Check',                         price: 0.02,  jsonSupport: true,  category: 'Generic', flags: ['tool'] },
  { id: 225, name: 'Model + Color + Storage + FMI',          price: 0.03,  jsonSupport: true,  category: 'Generic', flags: [] },
  { id: 229, name: 'Part Number / MPN',                      price: 0.10,  jsonSupport: true,  category: 'Generic', flags: [] },
  { id: 241, name: 'SIM-Lock Status',                        price: 0.03,  jsonSupport: true,  category: 'Generic', flags: [] },
  { id: 243, name: 'Carrier + SIM-Lock S1',                  price: 0.08,  jsonSupport: true,  category: 'Generic', flags: ['blacklist', 'tool'] },
  { id: 252, name: 'Carrier + SIM-Lock S2',                  price: 0.08,  jsonSupport: true,  category: 'Generic', flags: ['fmi-locked', 'tool'] },
  { id: 253, name: 'Carrier + SIM-Lock S3',                  price: 0.07,  jsonSupport: true,  category: 'Generic', flags: ['blacklist'] },
  { id: 255, name: 'Carrier + SIM-Lock Only',                price: 0.06,  jsonSupport: true,  category: 'Generic', flags: [] },
  { id: 286, name: 'Warranty Check Pro',                     price: 0.02,  jsonSupport: true,  category: 'Generic', flags: ['tool'] },
  { id: 319, name: 'Model + eSIM + pSIM Compatibility',      price: 0.01,  jsonSupport: true,  category: 'Generic', flags: [] },
  { id: 321, name: 'Config Code Check',                      price: 0.02,  jsonSupport: true,  category: 'Generic', flags: [] },

  // ──────────────── Laptop (5) ────────────────
  { id: 308, name: 'MacBook Specifications (No CTO)',        price: 0.20,  jsonSupport: true,  category: 'Laptop', flags: ['mac'] },
  { id: 313, name: 'Lenovo Laptop Model Check',              price: 0.02,  jsonSupport: false, category: 'Laptop', flags: [] },
  { id: 314, name: 'Dell Laptop Model Check',                price: 0.02,  jsonSupport: false, category: 'Laptop', flags: [] },
  { id: 315, name: 'HP Laptop Model Check',                  price: 0.02,  jsonSupport: false, category: 'Laptop', flags: [] },
  { id: 316, name: 'MacBook Specifications + FMI + MDM',     price: 0.70,  jsonSupport: true,  category: 'Laptop', flags: ['mac'] },

  // ──────────────── Dev/Testing (5) ────────────────
  { id: 125, name: 'FMI On/Off [Dev-Exclusive]',             price: 0.01,  jsonSupport: true,  category: 'Dev/Testing', flags: ['dev'] },
  { id: 238, name: 'Free Check Sample [Dev-Exclusive]',      price: 0.01,  jsonSupport: true,  category: 'Dev/Testing', flags: ['dev'] },
  { id: 318, name: 'TESTING - Serial Decoder',               price: 1.00,  jsonSupport: true,  category: 'Dev/Testing', flags: ['tool'] },
  { id: 322, name: 'TESTING - Fraud Check',                  price: 1.00,  jsonSupport: true,  category: 'Dev/Testing', flags: ['tool'] },
  { id: 323, name: 'TESTING - Model',                        price: 1.00,  jsonSupport: true,  category: 'Dev/Testing', flags: ['tool'] },
];

const SERVICES_BY_ID = new Map<number, IFreeiCloudServiceInfo>(
  SERVICES.map((s) => [s.id, s]),
);

/**
 * Look up a service by its numeric ID. Returns `undefined` if the ID is not in the catalog.
 */
export function getServiceById(id: number): IFreeiCloudServiceInfo | undefined {
  return SERVICES_BY_ID.get(id);
}

/**
 * Filter the catalog by category.
 */
export function getServicesByCategory(
  category: ServiceCategory,
): IFreeiCloudServiceInfo[] {
  return SERVICES.filter((s) => s.category === category);
}
