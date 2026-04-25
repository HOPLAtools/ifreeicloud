import type {
  IFreeiCloudConfig,
  IFreeiCloudClient,
  IFreeiCloudCheckResponse,
  IFreeiCloudEnvelope,
  IFreeiCloudService,
} from './types.js';
import { makeApiError, IFreeiCloudError } from './errors.js';
import { isValidImeiOrSn, isValidServiceId } from './validators.js';

const DEFAULT_BASE_URL = 'https://api.ifreeicloud.co.uk';
const DEFAULT_TIMEOUT = 60_000;

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeout: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Build a `application/x-www-form-urlencoded` body. iFreeiCloud rejects JSON bodies — every
 * call has to be form-encoded, mirroring the official PHP examples.
 */
function encodeForm(params: Record<string, string>): string {
  return new URLSearchParams(params).toString();
}

/**
 * Parse the iFreeiCloud envelope. Throws an `IFreeiCloudError` when `success !== true`,
 * preserving the raw error string so callers can branch on it when our typed-code mapping
 * doesn't cover the case.
 */
function unwrap<T = unknown>(
  envelope: IFreeiCloudEnvelope<T>,
): IFreeiCloudCheckResponse<T> {
  if (envelope.success !== true) {
    const raw = envelope.error ?? 'iFreeiCloud returned success=false without an error message';
    throw makeApiError(raw);
  }
  return {
    success: true,
    response: envelope.response ?? '',
    object: envelope.object,
  };
}

export function createIFreeiCloudClient(
  config: IFreeiCloudConfig,
): IFreeiCloudClient {
  const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
  const timeout = config.timeout ?? DEFAULT_TIMEOUT;

  async function postForm<T>(params: Record<string, string>): Promise<T> {
    const body = encodeForm({ ...params, key: config.apiKey });
    const response = await fetchWithTimeout(
      baseUrl,
      {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body,
      },
      timeout,
    );

    if (!response.ok) {
      throw new Error(`iFreeiCloud HTTP ${response.status}`);
    }

    return (await response.json()) as T;
  }

  async function check<TObject = unknown>(
    imei: string,
    serviceId: number,
  ): Promise<IFreeiCloudCheckResponse<TObject>> {
    if (!isValidImeiOrSn(imei)) {
      throw new Error(
        `Invalid IMEI/SN: "${imei}". Must be 11-15 alphanumeric characters.`,
      );
    }
    if (!isValidServiceId(serviceId)) {
      throw new Error(
        `Invalid service ID: ${serviceId}. Must be an integer between 0 and 999.`,
      );
    }

    const envelope = await postForm<IFreeiCloudEnvelope<TObject>>({
      service: String(serviceId),
      imei,
    });
    return unwrap(envelope);
  }

  async function services(): Promise<IFreeiCloudService[]> {
    const envelope = await postForm<IFreeiCloudEnvelope<IFreeiCloudService[]>>({
      accountinfo: 'servicelist',
    });
    const unwrapped = unwrap(envelope);
    return unwrapped.object ?? [];
  }

  async function balance(): Promise<number> {
    const envelope = await postForm<IFreeiCloudEnvelope<{ account_balance: number | string }>>({
      accountinfo: 'balance',
    });
    const unwrapped = unwrap(envelope);
    const raw = unwrapped.object?.account_balance;
    if (raw == null) {
      throw new IFreeiCloudError(
        'UNKNOWN',
        'iFreeiCloud balance response did not include account_balance',
      );
    }
    const num = typeof raw === 'number' ? raw : Number(raw);
    if (!Number.isFinite(num)) {
      throw new IFreeiCloudError(
        'UNKNOWN',
        `iFreeiCloud balance returned non-numeric value: ${String(raw)}`,
      );
    }
    return num;
  }

  return { check, balance, services };
}
