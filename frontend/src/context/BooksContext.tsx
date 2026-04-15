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

let booksCache: BookWithShelves[] | null = null;
let booksRequest: Promise<BookWithShelves[]> | null = null;

const loadBooks = async (): Promise<BookWithShelves[]> => {
  if (booksCache) {
    return booksCache;
  }

  if (!booksRequest) {
    booksRequest = apiService
      .getBooks(true)
      .then((fetched) => {
        booksCache = fetched as BookWithShelves[];
        return booksCache;
      })
      .finally(() => {
        booksRequest = null;
      });
  }

  return booksRequest;
};

export const prefetchBooks = (): Promise<BookWithShelves[]> => loadBooks();

export const resetBooksCache = (): void => {
  booksCache = null;
  booksRequest = null;
};

/**
 * BooksProvider fetches all BookWithShelves when a book-aware route mounts
 * and provides them to its subtree.
 */
export const BooksProvider: React.FC<BooksProviderProps> = ({ children }) => {
  const [books, setBooks] = useState<BookWithShelves[]>(() => booksCache ?? []);
  const [loading, setLoading] = useState(() => booksCache === null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (booksCache) {
      setBooks(booksCache);
      setLoading(false);
      setError(null);
      return () => {
        isMounted = false;
      };
    }

    const fetchBooks = async () => {
      try {
        const fetched = await loadBooks();
        if (isMounted) {
          setBooks(fetched);
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

    void fetchBooks();

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
