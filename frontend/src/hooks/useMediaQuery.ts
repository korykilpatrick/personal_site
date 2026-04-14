import { useEffect, useState } from 'react';

const canUseMatchMedia = (): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function';

const evaluateFallbackQuery = (query: string, fallback: boolean): boolean => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const minWidthMatch = query.match(/^\(min-width:\s*(\d+)px\)$/);
  if (minWidthMatch) {
    return window.innerWidth >= Number.parseInt(minWidthMatch[1], 10);
  }

  const maxWidthMatch = query.match(/^\(max-width:\s*(\d+)px\)$/);
  if (maxWidthMatch) {
    return window.innerWidth <= Number.parseInt(maxWidthMatch[1], 10);
  }

  return fallback;
};

const getInitialMatch = (query: string, fallback: boolean): boolean => {
  if (!canUseMatchMedia()) {
    return evaluateFallbackQuery(query, fallback);
  }

  return window.matchMedia(query).matches;
};

export default function useMediaQuery(query: string, fallback = false): boolean {
  const [matches, setMatches] = useState<boolean>(() => getInitialMatch(query, fallback));

  useEffect(() => {
    if (!canUseMatchMedia()) {
      const syncMatches = () => {
        setMatches(evaluateFallbackQuery(query, fallback));
      };

      syncMatches();
      window.addEventListener('resize', syncMatches);

      return () => {
        window.removeEventListener('resize', syncMatches);
      };
    }

    const mediaQuery = window.matchMedia(query);
    const syncMatches = () => setMatches(mediaQuery.matches);

    syncMatches();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncMatches);
      return () => {
        mediaQuery.removeEventListener('change', syncMatches);
      };
    }

    mediaQuery.addListener(syncMatches);
    return () => {
      mediaQuery.removeListener(syncMatches);
    };
  }, [fallback, query]);

  return matches;
}
