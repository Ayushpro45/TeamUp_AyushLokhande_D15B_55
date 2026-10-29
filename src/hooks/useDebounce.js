import { useState, useEffect } from 'react';

/**
 * useDebounce — delays updating the returned value until `delay` ms after the last change.
 * @param {*} value - the value to debounce
 * @param {number} delay - milliseconds to wait (default 300)
 * @returns {*} debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
