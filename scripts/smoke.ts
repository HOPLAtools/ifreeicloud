/**
 * Smoke test for @hopla/ifreeicloud against the real API.
 *
 * Run:
 *   IFREEICLOUD_API_KEY=PTD-... npm run smoke
 *   IFREEICLOUD_API_KEY=PTD-... npm run smoke -- --imei <real-imei-or-serial>
 *   IFREEICLOUD_API_KEY=PTD-... npm run smoke -- --imei <real> --paid 287
 *
 * What it does:
 *   1. balance()                              — free metadata (~no cost)
 *   2. services()                             — free metadata
 *   3. check(imei, 0)  FREE Universal Model   — free
 *   4. (optional) check(imei, --paid <id>)    — costs whatever the paid service costs
 *
 * Each step runs independently — a failure on one does NOT abort the others, so you can see
 * the full landscape on a single run.
 */
import {
  createIFreeiCloudClient,
  getServiceById,
  IFreeiCloudError,
} from '../src/index.js';

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

function reportError(prefix: string, err: unknown): void {
  if (err instanceof IFreeiCloudError) {
    console.error(`${prefix} ✗ [${err.code}] ${err.rawMessage}`);
  } else if (err instanceof Error) {
    console.error(`${prefix} ✗ ${err.message}`);
  } else {
    console.error(`${prefix} ✗`, err);
  }
}

async function step<T>(label: string, fn: () => Promise<T>): Promise<T | undefined> {
  console.log(`\n${label}`);
  try {
    return await fn();
  } catch (err) {
    reportError('     ', err);
    return undefined;
  }
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
  await step('[1/3] balance()', async () => {
    const balance = await client.balance();
    console.log(`     → $${balance.toFixed(2)} USD`);
  });

  // 2. Services — free
  await step('[2/3] services()', async () => {
    const services = await client.services();
    console.log(`     → ${services.length} services live`);
    if (services.length === 0) {
      console.log('     (empty list — likely a wire-format mismatch; raw shape follows)');
    }
    if (services[0]) {
      console.log(`     → first entry: ${JSON.stringify(services[0])}`);
    }
  });

  // 3. FREE Universal Model Check
  await step(`[3/3] check("${imei}", 0) — FREE Universal Model Check`, async () => {
    const free = await client.check(imei, 0);
    console.log('     → response:', free.response.slice(0, 200));
    console.log('     → object  :', JSON.stringify(free.object, null, 2));
  });

  // 4. Optional paid call
  if (paid !== undefined) {
    const meta = getServiceById(paid);
    const label = meta ? `${meta.name} ($${meta.price})` : `(unknown service)`;
    await step(`[paid] check("${imei}", ${paid}) — ${label}`, async () => {
      const result = await client.check(imei, paid);
      console.log('     → response:', result.response.slice(0, 200));
      console.log('     → object  :', JSON.stringify(result.object, null, 2));
    });
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Smoke test crashed (unexpected):', err);
  process.exit(1);
});
