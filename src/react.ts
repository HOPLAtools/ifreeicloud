import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  IFreeiCloudCheckResponse,
  IFreeiCloudService,
} from './types.js';

// ─── Hook return shapes ───────────────────────────────────────────────────────

export interface UseIFreeiCloudMutationResult<TParams, TData> {
  data: TData | null;
  error: Error | null;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  mutate: (params: TParams) => void;
  reset: () => void;
}

export interface UseIFreeiCloudQueryResult<TData> {
  data: TData | null;
  error: Error | null;
  isLoading: boolean;
}

export interface UseIFreeiCloudBalanceResult
  extends UseIFreeiCloudQueryResult<number> {
  refetch: () => void;
}

// ─── Options ──────────────────────────────────────────────────────────────────

export interface UseIFreeiCloudMutationOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

// ─── Check hook (manual trigger) ──────────────────────────────────────────────

export type CheckParams = { imei: string; serviceId: number };

export function useIFreeiCloudCheck<TObject = unknown>(
  fetchFn: (params: CheckParams) => Promise<IFreeiCloudCheckResponse<TObject>>,
  options?: UseIFreeiCloudMutationOptions<IFreeiCloudCheckResponse<TObject>>,
): UseIFreeiCloudMutationResult<CheckParams, IFreeiCloudCheckResponse<TObject>> {
  const [data, setData] = useState<IFreeiCloudCheckResponse<TObject> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(
    async (params: CheckParams) => {
      setIsPending(true);
      setError(null);
      try {
        const result = await fetchFn(params);
        setData(result);
        options?.onSuccess?.(result);
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        options?.onError?.(e);
      } finally {
        setIsPending(false);
      }
    },
    [fetchFn, options],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    error,
    isPending,
    isSuccess: data !== null,
    isError: error !== null,
    mutate,
    reset,
  };
}

// ─── Services hook (auto-fetch on mount) ──────────────────────────────────────

export function useIFreeiCloudServices(
  fetchFn: () => Promise<IFreeiCloudService[]>,
): UseIFreeiCloudQueryResult<IFreeiCloudService[]> {
  const [data, setData] = useState<IFreeiCloudService[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await fetchFn();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchFn]);

  return { data, error, isLoading };
}

// ─── Balance hook (auto-fetch + refetch interval) ─────────────────────────────

export function useIFreeiCloudBalance(
  fetchFn: () => Promise<number>,
  intervalMs?: number,
): UseIFreeiCloudBalanceResult {
  const [data, setData] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  const doFetch = useCallback(async () => {
    try {
      const result = await fetchRef.current();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    doFetch();
  }, [doFetch]);

  useEffect(() => {
    if (intervalMs == null || intervalMs <= 0) return;
    const id = setInterval(doFetch, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, doFetch]);

  return { data, error, isLoading, refetch: doFetch };
}
