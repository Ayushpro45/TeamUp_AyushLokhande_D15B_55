import { useState, useCallback } from 'react';

/**
 * useLocalStorage — drop-in replacement for useState that persists to localStorage.
 * @param {string} key - localStorage key
 * @param {*} initialValue - value to use when key is absent
 * @returns {[*, Function]} [storedValue, setValue]
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (valueToStore === undefined || valueToStore === null) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch {
        console.warn(`useLocalStorage: failed to write key "${key}"`);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}
