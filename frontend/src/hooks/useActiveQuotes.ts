import { useEffect, useState } from 'react';
import { Quote } from 'types';
import apiService from '@/api/apiService';
import { getErrorMessage, logError } from '@/utils/errorUtils';
import { shuffleArray } from '@/utils/quoteUtils';

interface UseActiveQuotesResult {
  quotes: Quote[];
  loading: boolean;
  error: string | null;
}

let activeQuotesCache: Quote[] | null = null;
let activeQuotesRequest: Promise<Quote[]> | null = null;

const loadActiveQuotes = async (): Promise<Quote[]> => {
  if (activeQuotesCache !== null) {
    return activeQuotesCache;
  }

  if (!activeQuotesRequest) {
    activeQuotesRequest = apiService
      .getActiveQuotes()
      .then((quotes) => {
        activeQuotesCache = Array.isArray(quotes) ? shuffleArray([...quotes]) : [];
        return activeQuotesCache;
      })
      .finally(() => {
        activeQuotesRequest = null;
      });
  }

  return activeQuotesRequest;
};

export const resetActiveQuotesCache = (): void => {
  activeQuotesCache = null;
  activeQuotesRequest = null;
};

const useActiveQuotes = (): UseActiveQuotesResult => {
  const [quotes, setQuotes] = useState<Quote[]>(() => activeQuotesCache ?? []);
  const [loading, setLoading] = useState(() => activeQuotesCache === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    if (activeQuotesCache !== null) {
      setQuotes(activeQuotesCache);
      setLoading(false);
      setError(null);
      return () => {
        isCancelled = true;
      };
    }

    const fetchQuotes = async () => {
      setLoading(true);
      setError(null);

      try {
        const quotes = await loadActiveQuotes();
        if (isCancelled) {
          return;
        }
        setQuotes(quotes);
      } catch (err: unknown) {
        if (isCancelled) {
          return;
        }

        const errorMessage = getErrorMessage(err, 'Failed to load quotes');
        setError(errorMessage);
        logError('fetching quotes', err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    void fetchQuotes();

    return () => {
      isCancelled = true;
    };
  }, []);

  return { quotes, loading, error };
};

export default useActiveQuotes;
