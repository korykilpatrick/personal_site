import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { LibraryItem } from 'types/index';
import apiService from '../api/apiService';

interface LibraryState {
  libraryItems: LibraryItem[];
  loading: boolean;
  error: Error | null;
}

/**
 * LibraryContext: provides a single source of truth for LibraryItems
 */
const LibraryContext = createContext<LibraryState>({
  libraryItems: [],
  loading: true,
  error: null,
});

interface LibraryProviderProps {
  children: ReactNode;
}

/**
 * LibraryProvider fetches all LibraryItems once at app startup
 * and provides them to all children.
 */
export const LibraryProvider: React.FC<LibraryProviderProps> = ({ children }) => {
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true; 
    const fetchLibraryItems = async () => {
      try {
        // Assuming apiService.getLibraryItems() fetches all items by default
        const fetchedItems = await apiService.getLibraryItems(); 
        if (isMounted) {
          setLibraryItems(fetchedItems);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          const e = err instanceof Error ? err : new Error(String(err));
          setError(e);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchLibraryItems();
    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(() => ({ libraryItems, loading, error }), [libraryItems, loading, error]);

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
};

/**
 * Hook to access the library context
 */
export const useLibrary = (): LibraryState => {
  return useContext(LibraryContext);
}; 