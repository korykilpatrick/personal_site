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

const useActiveQuotes = (): UseActiveQuotesResult => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchQuotes = async () => {
      setLoading(true);
      setError(null);

      try {
        const quotes = await apiService.getActiveQuotes();
        if (isCancelled) {
          return;
        }

        if (Array.isArray(quotes)) {
          setQuotes(shuffleArray([...quotes]));
        } else {
          setQuotes([]);
        }
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

    fetchQuotes();

    return () => {
      isCancelled = true;
    };
  }, []);

  return { quotes, loading, error };
};

export default useActiveQuotes;
