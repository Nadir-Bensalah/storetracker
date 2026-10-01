import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface Settled<T> {
  key: string;
  data: T | null;
  error: Error | null;
}

export function useFetch<T>(url: string, options?: RequestInit): UseFetchResult<T> {
  const [reloadCount, setReloadCount] = useState(0);
  const [settled, setSettled] = useState<Settled<T>>({ key: '', data: null, error: null });

  // Options are usually passed inline (`{ headers: {...} }`), so their identity
  // changes on every render. Keeping the latest value in a ref avoids an
  // infinite fetch loop without asking callers to memoise them.
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  // Each request has a key; `loading` is derived from whether the current key
  // has settled, instead of being set at the start of the effect.
  const requestKey = `${reloadCount}:${url}`;

  useEffect(() => {
    const controller = new AbortController();

    fetch(url, { ...optionsRef.current, signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<T>;
      })
      .then((data) => setSettled({ key: requestKey, data, error: null }))
      .catch((reason: unknown) => {
        // Aborting is our own doing (unmount, new URL, refetch): not an error to show.
        if (controller.signal.aborted) return;
        const error = reason instanceof Error ? reason : new Error(String(reason));
        setSettled((previous) => ({ key: requestKey, data: previous.data, error }));
      });

    return () => controller.abort();
  }, [url, requestKey]);

  const refetch = useCallback(() => setReloadCount((count) => count + 1), []);

  const isCurrent = settled.key === requestKey;
  return {
    data: settled.data,
    loading: !isCurrent,
    error: isCurrent ? settled.error : null,
    refetch,
  };
}
