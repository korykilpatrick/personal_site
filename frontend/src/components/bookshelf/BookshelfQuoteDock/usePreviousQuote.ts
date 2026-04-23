import { useEffect, useRef } from 'react';

// Classic "usePrevious" — returns the value committed on the previous
// render. Used by Palimpsest / Echo plate to echo the PRIOR quote as
// a ghost, so the dock feels like memory rather than duplication.
//
// Returns `undefined` on the first render (there IS no prior value
// yet) — the consumer should fall back to the current value for that
// first paint.
export default function usePreviousQuote<T>(current: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = current;
  }, [current]);

  return ref.current;
}
