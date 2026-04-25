import { describe, it, expect } from 'vitest';
import {
  IFreeiCloudError,
  parseErrorMessage,
  makeApiError,
} from '../src/errors.js';

describe('IFreeiCloudError', () => {
  it('stores code and rawMessage', () => {
    const err = new IFreeiCloudError('INSUFFICIENT_BALANCE', 'Insufficient Balance');
    expect(err.code).toBe('INSUFFICIENT_BALANCE');
    expect(err.rawMessage).toBe('Insufficient Balance');
    expect(err.name).toBe('IFreeiCloudError');
    expect(err).toBeInstanceOf(Error);
  });

  it('formats the message with code, description, and rawMessage', () => {
    const err = new IFreeiCloudError('INVALID_KEY', 'Invalid API Key');
    expect(err.message).toContain('[INVALID_KEY]');
    expect(err.message).toContain('Invalid API Key');
  });
});

describe('parseErrorMessage', () => {
  it('maps "Insufficient Balance" → INSUFFICIENT_BALANCE', () => {
    expect(parseErrorMessage('Insufficient Balance')).toBe('INSUFFICIENT_BALANCE');
  });

  it('matches case-insensitively', () => {
    expect(parseErrorMessage('insufficient balance, please top up')).toBe(
      'INSUFFICIENT_BALANCE',
    );
  });

  it('maps "Invalid API Key" → INVALID_KEY', () => {
    expect(parseErrorMessage('Invalid API Key')).toBe('INVALID_KEY');
  });

  it('maps the legacy numeric 10234 → INVALID_KEY', () => {
    expect(parseErrorMessage('Error 10234: bad key')).toBe('INVALID_KEY');
  });

  it('falls through to UNKNOWN for unrecognized messages', () => {
    expect(parseErrorMessage('Some new error we have not seen')).toBe('UNKNOWN');
  });

  it('returns UNKNOWN for empty string', () => {
    expect(parseErrorMessage('')).toBe('UNKNOWN');
  });
});

describe('makeApiError', () => {
  it('builds an IFreeiCloudError with the parsed code', () => {
    const err = makeApiError('Insufficient Balance');
    expect(err).toBeInstanceOf(IFreeiCloudError);
    expect(err.code).toBe('INSUFFICIENT_BALANCE');
    expect(err.rawMessage).toBe('Insufficient Balance');
  });

  it('preserves unrecognized messages on rawMessage', () => {
    const err = makeApiError('Service offline (try again later)');
    expect(err.code).toBe('UNKNOWN');
    expect(err.rawMessage).toBe('Service offline (try again later)');
  });
});
