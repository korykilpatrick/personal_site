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
let booksCachedAt: number | null = null;
let booksRequest: Promise<BookWithShelves[]> | null = null;

/**
 * Keep route remounts instant while bounding an open tab's stale bookshelf data.
 * Goodreads syncs are infrequent, so a five-minute refresh avoids noisy polling.
 */
export const BOOKS_CACHE_TTL_MS = 5 * 60 * 1000;

const getBooksCacheTtlRemaining = (): number => {
  if (booksCache === null || booksCachedAt === null) {
    return 0;
  }

  const cacheAge = Math.max(0, Date.now() - booksCachedAt);
  return Math.max(0, BOOKS_CACHE_TTL_MS - cacheAge);
};

const loadBooks = async (): Promise<BookWithShelves[]> => {
  if (booksCache !== null && getBooksCacheTtlRemaining() > 0) {
    return booksCache;
  }

  if (!booksRequest) {
    booksRequest = apiService
      .getBooks(true)
      .then((fetched) => {
        booksCache = fetched as BookWithShelves[];
        booksCachedAt = Date.now();
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
  booksCachedAt = null;
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
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleNextRefresh = () => {
      if (!isMounted) {
        return;
      }

      const remainingTtl = getBooksCacheTtlRemaining();
      const refreshDelay = remainingTtl > 0 ? remainingTtl : BOOKS_CACHE_TTL_MS;
      refreshTimer = setTimeout(() => {
        void fetchBooks();
      }, refreshDelay);
    };

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
          // Keep rendering the last successful snapshot when a background
          // revalidation fails. Only the initial load has no usable fallback.
          if (booksCache === null) {
            setError(e);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          scheduleNextRefresh();
        }
      }
    };

    void fetchBooks();

    return () => {
      isMounted = false;
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
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
