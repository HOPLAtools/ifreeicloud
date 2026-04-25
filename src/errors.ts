import type { IFreeiCloudErrorCode } from './types.js';

/**
 * Best-effort message-pattern → typed-code mapping.
 *
 * iFreeiCloud doesn't publish a stable error-code taxonomy. We only map the patterns we've seen
 * in production. Everything else falls through to `UNKNOWN` and the caller can branch on
 * `error.rawMessage` if they need finer granularity.
 */
const ERROR_PATTERNS: Array<{ code: IFreeiCloudErrorCode; pattern: RegExp }> = [
  { code: 'INSUFFICIENT_BALANCE', pattern: /insufficient\s*balance/i },
  // The legacy integration treats numeric code 10234 as "API key inválida".
  { code: 'INVALID_KEY', pattern: /invalid\s*api\s*key|invalid\s*key|\b10234\b/i },
];

const ERROR_DESCRIPTIONS: Record<IFreeiCloudErrorCode, string> = {
  INSUFFICIENT_BALANCE: 'Account balance is too low to run this service',
  INVALID_KEY: 'API key is missing, malformed, or rejected by the server',
  UNKNOWN: 'iFreeiCloud returned an error',
};

export class IFreeiCloudError extends Error {
  readonly code: IFreeiCloudErrorCode;
  /** The raw `error` string returned by the API — always preserved verbatim. */
  readonly rawMessage: string;

  constructor(code: IFreeiCloudErrorCode, rawMessage: string) {
    const description = ERROR_DESCRIPTIONS[code];
    super(rawMessage ? `[${code}] ${description}: ${rawMessage}` : `[${code}] ${description}`);
    this.name = 'IFreeiCloudError';
    this.code = code;
    this.rawMessage = rawMessage;
  }
}

/**
 * Map a raw error message from the API to a typed error code. Falls through to `UNKNOWN`
 * for messages that don't match any known pattern.
 */
export function parseErrorMessage(message: string): IFreeiCloudErrorCode {
  if (!message) return 'UNKNOWN';
  for (const { code, pattern } of ERROR_PATTERNS) {
    if (pattern.test(message)) return code;
  }
  return 'UNKNOWN';
}

/**
 * Build an `IFreeiCloudError` from an envelope error string.
 */
export function makeApiError(rawMessage: string): IFreeiCloudError {
  return new IFreeiCloudError(parseErrorMessage(rawMessage), rawMessage);
}

export { ERROR_DESCRIPTIONS };
