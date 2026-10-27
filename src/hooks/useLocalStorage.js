import { useState, useEffect } from "react";

// Keys are versioned ("pingly:v2:...") so old eval-1 data can't clash with
// the new data shapes. A failed write (e.g. quota exceeded) now fires an event
// that the ToastProvider turns into a visible message.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      window.dispatchEvent(new Event("pingly:storage-error"));
    }
  }, [key, value]);
  return [value, setValue];
}
