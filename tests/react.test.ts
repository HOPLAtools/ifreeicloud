import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type {
  IFreeiCloudCheckResponse,
  IFreeiCloudService,
} from '../src/types.js';
import {
  useIFreeiCloudCheck,
  useIFreeiCloudServices,
  useIFreeiCloudBalance,
} from '../src/react.js';

const mockResponse: IFreeiCloudCheckResponse<{ model: string }> = {
  success: true,
  response: 'ok',
  object: { model: 'iPhone 14' },
};

const mockServices: IFreeiCloudService[] = [
  { service: 287, name: 'USA ESN Status', price: 0.1 },
];

describe('useIFreeiCloudCheck', () => {
  it('calls fetchFn on mutate and surfaces data', async () => {
    const fetchFn = vi.fn().mockResolvedValue(mockResponse);
    const { result } = renderHook(() =>
      useIFreeiCloudCheck<{ model: string }>(fetchFn),
    );

    expect(result.current.isPending).toBe(false);
    expect(result.current.data).toBeNull();

    await act(async () => {
      result.current.mutate({ imei: '354442067957123', serviceId: 287 });
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual(mockResponse);
    expect(fetchFn).toHaveBeenCalledWith({
      imei: '354442067957123',
      serviceId: 287,
    });
  });

  it('captures errors', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('API down'));
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useIFreeiCloudCheck(fetchFn, { onError }),
    );

    await act(async () => {
      result.current.mutate({ imei: '354442067957123', serviceId: 287 });
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.error?.message).toBe('API down');
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'API down' }),
    );
  });

  it('reset clears state', async () => {
    const fetchFn = vi.fn().mockResolvedValue(mockResponse);
    const { result } = renderHook(() => useIFreeiCloudCheck(fetchFn));

    await act(async () => {
      result.current.mutate({ imei: '354442067957123', serviceId: 287 });
    });
    expect(result.current.isSuccess).toBe(true);

    act(() => {
      result.current.reset();
    });
    expect(result.current.data).toBeNull();
    expect(result.current.isSuccess).toBe(false);
  });
});

describe('useIFreeiCloudServices', () => {
  it('fetches on mount', async () => {
    const fetchFn = vi.fn().mockResolvedValue(mockServices);
    const { result } = renderHook(() => useIFreeiCloudServices(fetchFn));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(mockServices);
    expect(fetchFn).toHaveBeenCalledOnce();
  });

  it('captures errors', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useIFreeiCloudServices(fetchFn));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error?.message).toBe('Network error');
    expect(result.current.data).toBeNull();
  });
});

describe('useIFreeiCloudBalance', () => {
  it('fetches on mount and exposes a number', async () => {
    const fetchFn = vi.fn().mockResolvedValue(123.45);
    const { result } = renderHook(() => useIFreeiCloudBalance(fetchFn));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBe(123.45);
  });

  it('refetch updates the value', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(50);
    const { result } = renderHook(() => useIFreeiCloudBalance(fetchFn));

    await waitFor(() => expect(result.current.data).toBe(100));

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.data).toBe(50));
  });

  it('auto-refetches on interval', async () => {
    vi.useFakeTimers();
    const fetchFn = vi.fn().mockResolvedValue(123.45);
    renderHook(() => useIFreeiCloudBalance(fetchFn, 1000));

    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(1000);
    expect(fetchFn).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});
