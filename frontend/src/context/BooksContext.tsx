import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { BookWithShelves } from 'types/index';
import apiService from '../api/apiService';

interface BooksState {
  books: BookWithShelves[];
  loading: boolean;
  error: Error | null;
}

/**
 * BooksContext: provides a single source of truth for BookWithShelves
 */
const BooksContext = createContext<BooksState>({
  books: [],
  loading: true,
  error: null,
});

interface BooksProviderProps {
  children: ReactNode;
}

/**
 * BooksProvider fetches all BookWithShelves once at app startup
 * and provides them to all children.
 */
export const BooksProvider: React.FC<BooksProviderProps> = ({ children }) => {
  const [books, setBooks] = useState<BookWithShelves[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true; // For safety if a user navigates away mid-fetch
    const fetchBooks = async () => {
      try {
        const fetched = await apiService.getBooks(true);
        if (isMounted) {
          setBooks(fetched as BookWithShelves[]);
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
    fetchBooks();
    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(() => ({ books, loading, error }), [books, loading, error]);

  return (
    <BooksContext.Provider value={value}>
      {children}
    </BooksContext.Provider>
  );
};

/**
 * Hook to access the books context
 */
export const useBooks = (): BooksState => {
  return useContext(BooksContext);
};