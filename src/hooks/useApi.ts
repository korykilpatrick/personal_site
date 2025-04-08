import { useState, useEffect, useCallback } from 'react';

interface UseApiOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  autoFetch?: boolean;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  fetchData: () => Promise<void>;
}

/**
 * Custom hook for making API requests
 * @param fetchFn - Async function to fetch data
 * @param options - Hook configuration options
 * @returns Object with data, loading state, error, and fetch function
 */
const useApi = <T>(
  fetchFn: () => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> => {
  const { initialData = null, onSuccess, onError, autoFetch = true } = options;
  
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn();
      setData(result);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, onSuccess, onError]);
  
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);
  
  return { data, loading, error, fetchData };
};

export default useApi;