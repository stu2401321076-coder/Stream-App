import { useEffect, useRef, useState, useCallback } from 'preact/hooks';

const CACHE = new Map();
const DEFAULT_STALE_MS = 30_000;
const DEFAULT_TTL_MS = 5 * 60_000;

function getCached(key) {
  if (!key) return null;
  const entry = CACHE.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > DEFAULT_TTL_MS) {
    CACHE.delete(key);
    return null;
  }
  return entry;
}

function setCached(key, value) {
  if (!key) return;
  CACHE.set(key, { value, at: Date.now() });
}

export function invalidateCache(prefix) {
  if (!prefix) {
    CACHE.clear();
    return;
  }
  for (const k of CACHE.keys()) {
    if (k.startsWith(prefix)) CACHE.delete(k);
  }
}

export function useApi(fetcher, deps = [], options = {}) {
  const { cacheKey = null, staleTime = DEFAULT_STALE_MS, enabled = true } = options;
  const cached = enabled ? getCached(cacheKey) : null;
  const isFresh = cached && Date.now() - cached.at < staleTime;

  const [data, setData] = useState(cached ? cached.value : null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(enabled && !isFresh);
  const abortRef = useRef(null);

  const run = useCallback(async () => {
    if (!enabled) return;
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher({ signal: ctrl.signal });
      if (ctrl.signal.aborted) return;
      setData(result);
      setCached(cacheKey, result);
    } catch (err) {
      if (ctrl.signal.aborted) return;
      if (err?.name === 'AbortError') return;
      setError(err);
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, cacheKey, ...deps]);

  useEffect(() => {
    if (!enabled) return;
    if (isFresh) {
      setData(cached.value);
      setLoading(false);
      return;
    }
    run();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, cacheKey, ...deps]);

  return { data, error, loading, refetch: run };
}
