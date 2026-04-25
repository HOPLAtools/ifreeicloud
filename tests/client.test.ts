import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createIFreeiCloudClient } from '../src/client.js';
import { IFreeiCloudError } from '../src/errors.js';

const TEST_KEY = 'PTD-N6N-EUB-6ZT-R6R-ORV-ORB-0MS';

function mockFetch(body: unknown, init?: { ok?: boolean; status?: number }) {
  const ok = init?.ok ?? true;
  const status = init?.status ?? 200;
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
    headers: new Headers({ 'content-type': 'application/json' }),
  });
}

describe('createIFreeiCloudClient', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('check()', () => {
    it('POSTs form-urlencoded body to the base URL', async () => {
      const fetchMock = mockFetch({
        success: true,
        response: 'ok',
        object: { model: 'iPhone 14' },
      });
      globalThis.fetch = fetchMock;

      const client = createIFreeiCloudClient({ apiKey: TEST_KEY });
      const result = await client.check<{ model: string }>('354442067957123', 287);

      expect(fetchMock).toHaveBeenCalledOnce();
      const [calledUrl, init] = fetchMock.mock.calls[0]!;
      expect(calledUrl).toBe('https://api.ifreeicloud.co.uk');
      expect(init.method).toBe('POST');
      expect(init.headers['content-type']).toBe(
        'application/x-www-form-urlencoded',
      );

      const sentParams = new URLSearchParams(init.body as string);
      expect(sentParams.get('service')).toBe('287');
      expect(sentParams.get('imei')).toBe('354442067957123');
      expect(sentParams.get('key')).toBe(TEST_KEY);

      expect(result.success).toBe(true);
      expect(result.object).toEqual({ model: 'iPhone 14' });
    });

    it('throws IFreeiCloudError when success is false', async () => {
      globalThis.fetch = mockFetch({
        success: false,
        error: 'Insufficient Balance',
      });

      const client = createIFreeiCloudClient({ apiKey: TEST_KEY });
      await expect(client.check('354442067957123', 287)).rejects.toMatchObject({
        name: 'IFreeiCloudError',
        code: 'INSUFFICIENT_BALANCE',
        rawMessage: 'Insufficient Balance',
      });
    });

    it('throws IFreeiCloudError on invalid key', async () => {
      globalThis.fetch = mockFetch({
        success: false,
        error: 'Error 10234: Invalid API Key',
      });

      const client = createIFreeiCloudClient({ apiKey: 'BAD-KEY-BAD-KEY-BAD-KEY-BAD-KEY' });
      await expect(client.check('354442067957123', 287)).rejects.toBeInstanceOf(
        IFreeiCloudError,
      );
    });

    it('rejects invalid IMEI before calling fetch', async () => {
      const fetchMock = mockFetch({});
      globalThis.fetch = fetchMock;

      const client = createIFreeiCloudClient({ apiKey: TEST_KEY });
      await expect(client.check('short', 287)).rejects.toThrow('Invalid IMEI/SN');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rejects invalid service ID before calling fetch', async () => {
      const fetchMock = mockFetch({});
      globalThis.fetch = fetchMock;

      const client = createIFreeiCloudClient({ apiKey: TEST_KEY });
      await expect(client.check('354442067957123', 1500)).rejects.toThrow(
        'Invalid service ID',
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('uses a custom baseUrl (e.g. proxy)', async () => {
      const fetchMock = mockFetch({ success: true, response: 'ok' });
      globalThis.fetch = fetchMock;

      const client = createIFreeiCloudClient({
        apiKey: TEST_KEY,
        baseUrl: 'https://proxy.example.com/ifree',
      });
      await client.check('354442067957123', 287);

      expect(fetchMock.mock.calls[0]![0]).toBe('https://proxy.example.com/ifree');
    });

    it('throws on non-2xx HTTP', async () => {
      globalThis.fetch = mockFetch({}, { ok: false, status: 503 });

      const client = createIFreeiCloudClient({ apiKey: TEST_KEY });
      await expect(client.check('354442067957123', 287)).rejects.toThrow(
        'iFreeiCloud HTTP 503',
      );
    });
  });

  describe('balance()', () => {
    it('parses object.account_balance and returns a number', async () => {
      globalThis.fetch = mockFetch({
        success: true,
        response: 'Your balance: $123.45',
        object: { account_balance: 123.45 },
      });

      const client = createIFreeiCloudClient({ apiKey: TEST_KEY });
      const result = await client.balance();
      expect(result).toBe(123.45);
    });

    it('coerces string balance to a number', async () => {
      globalThis.fetch = mockFetch({
        success: true,
        object: { account_balance: '99.5' },
      });

      const client = createIFreeiCloudClient({ apiKey: TEST_KEY });
      const result = await client.balance();
      expect(result).toBe(99.5);
    });

    it('throws when account_balance is missing', async () => {
      globalThis.fetch = mockFetch({
        success: true,
        response: 'malformed',
        object: {},
      });

      const client = createIFreeiCloudClient({ apiKey: TEST_KEY });
      await expect(client.balance()).rejects.toBeInstanceOf(IFreeiCloudError);
    });

    it('sends accountinfo=balance', async () => {
      const fetchMock = mockFetch({
        success: true,
        object: { account_balance: 0 },
      });
      globalThis.fetch = fetchMock;

      const client = createIFreeiCloudClient({ apiKey: TEST_KEY });
      await client.balance();

      const sentParams = new URLSearchParams(fetchMock.mock.calls[0]![1].body as string);
      expect(sentParams.get('accountinfo')).toBe('balance');
    });
  });

  describe('services()', () => {
    it('returns object as the service list', async () => {
      globalThis.fetch = mockFetch({
        success: true,
        response: '<table>...</table>',
        object: [
          { service: 287, name: 'USA ESN Status', price: 0.1 },
          { service: 0, name: '[FREE] Universal Model Check', price: 0 },
        ],
      });

      const client = createIFreeiCloudClient({ apiKey: TEST_KEY });
      const result = await client.services();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0]!.name).toBe('USA ESN Status');
    });

    it('returns [] when object is missing', async () => {
      globalThis.fetch = mockFetch({ success: true, response: 'no list' });
      const client = createIFreeiCloudClient({ apiKey: TEST_KEY });
      const result = await client.services();
      expect(result).toEqual([]);
    });

    it('sends accountinfo=servicelist', async () => {
      const fetchMock = mockFetch({ success: true, object: [] });
      globalThis.fetch = fetchMock;

      const client = createIFreeiCloudClient({ apiKey: TEST_KEY });
      await client.services();

      const sentParams = new URLSearchParams(fetchMock.mock.calls[0]![1].body as string);
      expect(sentParams.get('accountinfo')).toBe('servicelist');
    });
  });
});
