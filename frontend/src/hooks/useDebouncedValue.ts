import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of the input value.
 * @param value - The raw value to debounce
 * @param delay - The debounce delay in ms
 */
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebouncedValue;