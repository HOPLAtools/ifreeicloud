/**
 * Regenerate `docs/postman/iFreeiCloud.postman_collection.json` from the canonical
 * service catalog in `src/services.ts`.
 *
 * Run after editing the catalog:
 *   npm run postman:generate
 *
 * The output collection has 9 folders:
 *   - Account                 → balance + service list
 *   - one folder per ServiceCategory (8 folders)
 *
 * Each service becomes a POST request to {{baseUrl}} with the form-urlencoded body
 * iFreeiCloud expects. Variables `{{baseUrl}}`, `{{apiKey}}`, `{{imei}}` are
 * collection-level so the user only sets them once via an environment.
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SERVICES } from '../src/services.js';
import type { ServiceCategory, IFreeiCloudServiceInfo } from '../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, '..', 'docs', 'postman', 'iFreeiCloud.postman_collection.json');

type PostmanItem = Record<string, unknown>;

const CATEGORY_ORDER: ServiceCategory[] = [
  'Apple',
  'US Carriers',
  'JP Carriers',
  'Brand Info',
  'All-in-one',
  'Generic',
  'Laptop',
  'Dev/Testing',
];

function priceLabel(price: number): string {
  if (price === 0) return 'FREE';
  return `$${price.toFixed(price < 0.01 ? 3 : 2)}`;
}

function checkRequest(s: IFreeiCloudServiceInfo): PostmanItem {
  const flags = s.flags.length > 0 ? ` • flags: ${s.flags.join(', ')}` : '';
  const jsonNote = s.jsonSupport
    ? 'Returns structured `object`.'
    : 'Returns only `response` (no JSON object).';

  return {
    name: `${s.id} - ${s.name}`,
    request: {
      method: 'POST',
      header: [],
      body: {
        mode: 'urlencoded',
        urlencoded: [
          { key: 'service', value: String(s.id) },
          { key: 'imei', value: '{{imei}}' },
          { key: 'key', value: '{{apiKey}}' },
        ],
      },
      url: '{{baseUrl}}',
      description: `${s.category} • ${priceLabel(s.price)}${flags}\n\n${jsonNote}`,
    },
  };
}

function accountRequest(name: string, accountinfo: 'balance' | 'servicelist', description: string): PostmanItem {
  return {
    name,
    request: {
      method: 'POST',
      header: [],
      body: {
        mode: 'urlencoded',
        urlencoded: [
          { key: 'accountinfo', value: accountinfo },
          { key: 'key', value: '{{apiKey}}' },
        ],
      },
      url: '{{baseUrl}}',
      description,
    },
  };
}

function build(): unknown {
  const folders: PostmanItem[] = [];

  // Account folder (metadata calls — no service ID)
  folders.push({
    name: 'Account',
    item: [
      accountRequest(
        'Balance',
        'balance',
        'Returns the account balance in `object.account_balance` (USD). Free metadata call.',
      ),
      accountRequest(
        'Service List',
        'servicelist',
        'Returns the live catalog of instant services. `response` is HTML, `object` is keyed by service ID with name/price/time/description/snSupport/objectSupport. Free metadata call.',
      ),
    ],
  });

  // One folder per category, with services sorted by ID inside
  for (const category of CATEGORY_ORDER) {
    const services = SERVICES.filter((s) => s.category === category).sort((a, b) => a.id - b.id);
    if (services.length === 0) continue;
    folders.push({
      name: category,
      item: services.map(checkRequest),
    });
  }

  return {
    info: {
      name: 'iFreeiCloud API',
      description: [
        'Manual exploration of the iFreeiCloud API (https://api.ifreeicloud.co.uk).',
        '',
        'All requests are POST against a single host. The body discriminates the operation:',
        '- `service=<id>` → run an instant service',
        '- `accountinfo=servicelist` → list services',
        '- `accountinfo=balance` → account balance',
        '',
        'Set the collection variables before sending: `baseUrl`, `apiKey`, `imei`. ',
        'A matching environment file is included at `docs/postman/iFreeiCloud.postman_environment.json`.',
        '',
        `Generated from \`src/services.ts\` — ${SERVICES.length} services across ${CATEGORY_ORDER.length} categories.`,
        'Do not edit by hand. Run `npm run postman:generate` after updating the catalog.',
        '',
        'SDK: https://www.npmjs.com/package/@hopla/ifreeicloud',
      ].join('\n'),
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    variable: [
      { key: 'baseUrl', value: 'https://api.ifreeicloud.co.uk', type: 'string' },
      { key: 'apiKey', value: 'YOUR_API_KEY_HERE', type: 'string' },
      { key: 'imei', value: '354442067957123', type: 'string' },
    ],
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            "pm.test('HTTP 200', () => pm.response.to.have.status(200));",
            'const data = pm.response.json();',
            "pm.test('envelope shape', () => { pm.expect(data).to.have.property('success'); });",
            "if (data.success !== true) { console.warn('iFreeiCloud error:', data.error); }",
          ],
        },
      },
    ],
    item: folders,
  };
}

function main(): void {
  const collection = build();
  writeFileSync(OUTPUT, JSON.stringify(collection, null, 2) + '\n');
  const totalRequests = (collection as { item: Array<{ item: unknown[] }> }).item.reduce(
    (sum, folder) => sum + folder.item.length,
    0,
  );
  console.log(`Wrote ${OUTPUT}`);
  console.log(`  ${(collection as { item: unknown[] }).item.length} folders, ${totalRequests} requests total.`);
}

main();
