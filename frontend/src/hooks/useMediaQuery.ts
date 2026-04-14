import { useEffect, useState } from 'react';

const canUseMatchMedia = (): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function';

const getInitialMatch = (query: string, fallback: boolean): boolean => {
  if (!canUseMatchMedia()) {
    return fallback;
  }

  return window.matchMedia(query).matches;
};

export default function useMediaQuery(query: string, fallback = false): boolean {
  const [matches, setMatches] = useState<boolean>(() => getInitialMatch(query, fallback));

  useEffect(() => {
    if (!canUseMatchMedia()) {
      setMatches(fallback);
      return undefined;
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
