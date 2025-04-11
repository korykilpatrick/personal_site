import { useState, useEffect, useCallback, useRef } from 'react';

interface UseApiOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  autoFetch?: boolean;
}

interface UseApiResult<T, P extends any[]> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  fetchData: (...params: P) => Promise<T>;
}

/**
 * Custom hook for making API requests
 * @param fetchFn - Async function to fetch data
 * @param autoFetchParams - Parameters to use for automatic fetching when they change. Pass an empty array if no params.
 * @param options - Hook configuration options
 * @returns Object with data, loading state, error, and fetch function
 */
const useApi = <T, P extends any[] = []>(
  fetchFn: (...params: P) => Promise<T>,
  autoFetchParams: P,
  options: UseApiOptions<T> = {},
): UseApiResult<T, P> => {
  const {
    initialData = null,
    onSuccess,
    onError,
    autoFetch = true,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const isMounted = useRef(false);

  const fetchDataCallback = useCallback(
    async (...params: P): Promise<T> => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchFn(...params);
        setData(result);
        if (onSuccess) onSuccess(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        if (onError) onError(error);
        throw error;
      } finally {
        setTimeout(() => setLoading(false), 0);
      }
    },
    [fetchFn, onSuccess, onError],
  );

  useEffect(() => {
    if (isMounted.current) {
      if (autoFetch) {
        fetchDataCallback(...autoFetchParams);
      }
    } else {
      isMounted.current = true;
      if (autoFetch) {
        fetchDataCallback(...autoFetchParams);
      } else {
        setLoading(false);
      }
    }
  }, [autoFetch, fetchDataCallback, ...autoFetchParams]);

  return { data, loading, error, fetchData: fetchDataCallback };
};

export default useApi;
