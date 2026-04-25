/**
 * Smoke test for @hopla/ifreeicloud against the real API.
 *
 * Run:
 *   IFREEICLOUD_API_KEY=PTD-... npx tsx scripts/smoke.ts
 *   IFREEICLOUD_API_KEY=PTD-... npx tsx scripts/smoke.ts --imei 354442067957123
 *
 * What it does (cost: ~$0.00):
 *   1. balance()                              — free metadata
 *   2. services()                              — free metadata, prints count
 *   3. check(imei, 0) — FREE Universal Model  — free
 *
 * Flags:
 *   --imei <imei>     IMEI/SN to test (default: 354442067957123 — Apple test IMEI)
 *   --paid <serviceId> Optionally also runs a paid check (off by default)
 *
 * The paid flag is gated explicitly because every paid call burns balance.
 */
import { createIFreeiCloudClient, getServiceById, IFreeiCloudError } from '../src/index.js';

function parseArgs(argv: string[]): { imei: string; paid?: number } {
  const args = { imei: '354442067957123' as string, paid: undefined as number | undefined };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--imei' && argv[i + 1]) {
      args.imei = argv[++i]!;
    } else if (a === '--paid' && argv[i + 1]) {
      args.paid = Number(argv[++i]);
    }
  }
  return args;
}

async function main(): Promise<void> {
  const apiKey = process.env.IFREEICLOUD_API_KEY;
  if (!apiKey) {
    console.error('Set IFREEICLOUD_API_KEY in the environment first.');
    process.exit(1);
  }

  const { imei, paid } = parseArgs(process.argv.slice(2));
  const client = createIFreeiCloudClient({ apiKey });

  // 1. Balance — free
  console.log('\n[1/3] balance()');
  const balance = await client.balance();
  console.log(`     → $${balance.toFixed(2)} USD`);

  // 2. Services — free
  console.log('\n[2/3] services()');
  const services = await client.services();
  console.log(`     → ${services.length} services live`);
  if (services[0]) {
    console.log(`     → first entry: ${JSON.stringify(services[0])}`);
  }

  // 3. FREE Universal Model Check
  console.log(`\n[3/3] check("${imei}", 0) — FREE Universal Model Check`);
  try {
    const free = await client.check(imei, 0);
    console.log('     → response:', free.response.slice(0, 200));
    console.log('     → object  :', JSON.stringify(free.object, null, 2));
  } catch (err) {
    if (err instanceof IFreeiCloudError) {
      console.error(`     ✗ [${err.code}] ${err.rawMessage}`);
    } else {
      throw err;
    }
  }

  // Optional paid call
  if (paid !== undefined) {
    const meta = getServiceById(paid);
    const label = meta ? `${meta.name} ($${meta.price})` : `(unknown service)`;
    console.log(`\n[paid] check("${imei}", ${paid}) — ${label}`);
    try {
      const result = await client.check(imei, paid);
      console.log('     → response:', result.response.slice(0, 200));
      console.log('     → object  :', JSON.stringify(result.object, null, 2));
    } catch (err) {
      if (err instanceof IFreeiCloudError) {
        console.error(`     ✗ [${err.code}] ${err.rawMessage}`);
      } else {
        throw err;
      }
    }
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
