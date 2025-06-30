import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

interface UseAdminListOptions {
  endpoint: string;
  entityName: string;
}

interface UseAdminListReturn<T> {
  items: T[];
  isLoading: boolean;
  error: string | null;
  handleDelete: (id: number) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Reusable hook for admin list components
 * Handles fetching, loading states, error handling, and delete operations
 * 
 * @param options Configuration options for the hook
 * @returns Object with items, loading state, error, and handler functions
 */
export function useAdminList<T extends { id: number }>(
  options: UseAdminListOptions
): UseAdminListReturn<T> {
  const { endpoint, entityName } = options;
  
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<T[]>(endpoint, { signal });
      setItems(res.data);
    } catch (err: unknown) {
      // Check if the error is due to request cancellation
      if (err instanceof Error && (err.name === 'AbortError' || err.name === 'CanceledError')) {
        return; // Ignore abort/cancel errors
      }
      
      // Also check axios-specific cancel
      if ((err as any)?.code === 'ERR_CANCELED') {
        return;
      }
      
      const error = err as ApiError;
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        `Failed to fetch ${entityName}`;
      setError(errorMessage);
      console.error(`Error fetching ${entityName}:`, err);
    } finally {
      // Only set loading to false if not aborted
      if (!signal || !signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [endpoint, entityName]);

  useEffect(() => {
    const controller = new AbortController();
    fetchItems(controller.signal);
    
    return () => {
      controller.abort();
    };
  }, [fetchItems]);

  const handleDelete = useCallback(async (id: number) => {
    const confirmMessage = `Are you sure you want to delete this ${entityName.toLowerCase()}?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    setIsLoading(true);
    try {
      await api.delete(`${endpoint}/${id}`);
      // Optimistic update - remove from local state
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        `Failed to delete ${entityName}`;
      setError(errorMessage);
      console.error(`Error deleting ${entityName}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, entityName]);

  return {
    items,
    isLoading,
    error,
    handleDelete,
    refetch: () => fetchItems()
  };
}