import { useState, useEffect, useCallback } from 'react';
import adminApi from '../api/adminApi';
import { getErrorMessage, isCancelledError, logError } from '../utils/errorUtils';

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

  const fetchItems = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);
      try {
        const items = await adminApi.getList<T>(endpoint, signal);
        setItems(items);
      } catch (err: unknown) {
        // Ignore cancelled requests
        if (isCancelledError(err)) {
          return;
        }

        const errorMessage = getErrorMessage(err, `Failed to fetch ${entityName}`);
        setError(errorMessage);
        logError(`fetching ${entityName}`, err);
      } finally {
        // Only set loading to false if not aborted
        if (!signal || !signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [endpoint, entityName]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchItems(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchItems]);

  const handleDelete = useCallback(
    async (id: number) => {
      const confirmMessage = `Are you sure you want to delete this ${entityName.toLowerCase()}?`;
      if (!window.confirm(confirmMessage)) {
        return;
      }

      setIsLoading(true);
      try {
        await adminApi.remove(endpoint, id);
        // Update local state after successful deletion
        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err, `Failed to delete ${entityName}`);
        setError(errorMessage);
        logError(`deleting ${entityName}`, err);
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, entityName]
  );

  return {
    items,
    isLoading,
    error,
    handleDelete,
    refetch: () => fetchItems(),
  };
}
