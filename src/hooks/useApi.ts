import { useState, useEffect, useCallback, useRef } from 'react';

interface UseApiOptions<T, P extends any[]> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  autoFetch?: boolean;
  dependencies?: any[];
  initialParams?: P;
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
 * @param options - Hook configuration options
 * @returns Object with data, loading state, error, and fetch function
 */
const useApi = <T, P extends any[] = []>(
  fetchFn: (...params: P) => Promise<T>,
  options: UseApiOptions<T, P> = {}
): UseApiResult<T, P> => {
  const { 
    initialData = null, 
    onSuccess, 
    onError, 
    autoFetch = true,
    dependencies = [],
    initialParams = [] as unknown as P
  } = options;
  
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<Error | null>(null);
  
  // Keep track of the current parameters
  const paramsRef = useRef<P>(initialParams);
  
  const fetchData = useCallback(async (...params: P): Promise<T> => {
    setLoading(true);
    setError(null);
    
    // Update the current parameters
    if (params.length > 0) {
      paramsRef.current = params;
    }
    
    try {
      const result = await fetchFn(...paramsRef.current);
      setData(result);
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      if (onError) onError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchFn, onSuccess, onError, ...dependencies]);
  
  useEffect(() => {
    if (autoFetch) {
      fetchData(...paramsRef.current);
    }
  }, [autoFetch, fetchData]);
  
  return { data, loading, error, fetchData };
};

export default useApi;