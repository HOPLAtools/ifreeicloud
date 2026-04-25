/**
 * Configuration for createIFreeiCloudClient.
 */
export interface IFreeiCloudConfig {
  /** API key. Format: `XXX-XXX-XXX-XXX-XXX-XXX-XXX-XXX`. Can be empty string when used behind a proxy. */
  apiKey: string;
  /** Override the API host. Default: `https://api.ifreeicloud.co.uk`. Useful for proxies. */
  baseUrl?: string;
  /** Per-request timeout in ms. Default: `60000`. */
  timeout?: number;
}

/**
 * Standard envelope returned by every iFreeiCloud API call.
 *
 * - `success` indicates whether the call ran end-to-end.
 * - `error` carries the human-readable error string when `success` is false.
 * - `response` is a human-readable string (sometimes HTML).
 * - `object` carries the structured payload — only present when the service supports JSON output.
 */
export interface IFreeiCloudEnvelope<TObject = unknown> {
  success: boolean;
  error?: string;
  response?: string;
  object?: TObject;
}

/**
 * A successful check / accountinfo response. `success` is `true` and `object` may or may not be present
 * depending on the service's JSON support flag (see SERVICES catalog).
 */
export interface IFreeiCloudCheckResponse<TObject = unknown> {
  success: true;
  response: string;
  object?: TObject;
}

/**
 * Service entry as returned by the live `accountinfo=servicelist` endpoint.
 * The exact shape on the wire is defined by iFreeiCloud and may grow new fields over time.
 */
export interface IFreeiCloudService {
  service: number | string;
  name: string;
  price: number | string;
  /** Some endpoints expose `processing_time` and a serial-support flag — preserved as-is. */
  [extra: string]: unknown;
}

/**
 * Best-effort error code derived from the `error` string returned by the API.
 *
 * iFreeiCloud does not publish a stable error-code taxonomy, so we map only the patterns we have
 * observed in production (`INSUFFICIENT_BALANCE`, `INVALID_KEY`). Anything else falls through to
 * `UNKNOWN`. The original message is always available on `IFreeiCloudError.rawMessage`.
 */
export type IFreeiCloudErrorCode =
  | 'INSUFFICIENT_BALANCE'
  | 'INVALID_KEY'
  | 'UNKNOWN';

/**
 * Categories assigned to services in the local catalog (derived from the service name + icons in the
 * iFreeiCloud panel — they are not part of the wire response).
 */
export type ServiceCategory =
  | 'Apple'
  | 'US Carriers'
  | 'JP Carriers'
  | 'Brand Info'
  | 'All-in-one'
  | 'Generic'
  | 'Laptop'
  | 'Dev/Testing';

/**
 * Per-service flag derived from the icons in the iFreeiCloud panel. Useful for filtering.
 */
export type ServiceFlag =
  | 'apple'        // 🍎
  | 'mac'          // 💻
  | 'us'           // 🇺🇸
  | 'jp'           // 🇯🇵
  | 'fmi-locked'   // 🔒
  | 'blacklist'    // 🅱
  | 'tool'         // 🔧
  | 'dev'          // 🌐
  | 'new';         // (NEW)

/**
 * Local service catalog entry.
 */
export interface IFreeiCloudServiceInfo {
  id: number;
  name: string;
  /** Price in USD. `0` for FREE services. */
  price: number;
  /** Whether the service returns a structured `object` field in addition to `response`. */
  jsonSupport: boolean;
  category: ServiceCategory;
  flags: ServiceFlag[];
}

/**
 * The public client surface.
 */
export interface IFreeiCloudClient {
  /**
   * Run an instant service against an IMEI / serial number.
   *
   * @param imei  IMEI (15 digits) or serial number (alphanumeric).
   * @param serviceId  Numeric ID from the SERVICES catalog or the live service list.
   * @returns The success envelope. `object` is typed as `TObject` when the caller provides it.
   * @throws {IFreeiCloudError} when the API returns `success: false`.
   * @throws {Error} when validation fails or the network call errors out.
   */
  check<TObject = unknown>(
    imei: string,
    serviceId: number,
  ): Promise<IFreeiCloudCheckResponse<TObject>>;

  /**
   * Account balance in USD as a number, parsed from `object.account_balance`.
   */
  balance(): Promise<number>;

  /**
   * Live list of available services from the API.
   */
  services(): Promise<IFreeiCloudService[]>;
}
