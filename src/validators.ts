/**
 * Validate an IMEI or serial number. iFreeiCloud accepts both — IMEI is 15 digits, serials are
 * alphanumeric and typically 11-15 chars. We accept the broader `[A-Za-z0-9]{11,15}` to cover both.
 */
export function isValidImeiOrSn(value: string): boolean {
  return /^[a-zA-Z0-9]{11,15}$/.test(value);
}

/**
 * Validate that a service ID is a non-negative integer in the range we expect from the catalog
 * (current max is 324). The upper bound is intentionally generous to avoid rejecting brand-new
 * services that aren't yet in the local catalog.
 */
export function isValidServiceId(id: number): boolean {
  return Number.isInteger(id) && id >= 0 && id <= 999;
}

/**
 * Validate the API key shape: 8 groups of 3 alphanumeric characters separated by hyphens.
 * Example: `PTD-N6N-EUB-6ZT-R6R-ORV-ORB-0MS`.
 *
 * Note: the iFreeiCloud key alphabet allows both letters (e.g. `O`) and digits (e.g. `0`) in any
 * group. The regex is case-insensitive; the wire format is uppercase but we accept lowercase too
 * to avoid false negatives on user input.
 */
export function isValidApiKey(key: string): boolean {
  return /^[A-Z0-9]{3}(-[A-Z0-9]{3}){7}$/i.test(key);
}
