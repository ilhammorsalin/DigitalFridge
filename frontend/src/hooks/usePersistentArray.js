import { loadArray, saveArray } from '@utils/storage'; // import helpers that read/write localStorage
import { useEffect, useState } from 'react'; // import React hooks for state and side-effects

export function usePersistentArray(key, initial = []) {
  // define a custom hook that persists an array by `key`
  const [value, setValue] = useState(() => loadArray(key) ?? initial); // initialize from storage if present, else use `initial`

  useEffect(() => {
    // run a side-effect whenever `key` or `value` changes
    saveArray(key, value); // write the current array to localStorage under `key`
  }, [key, value]); // dependencies: rerun effect if key or value changes

  return [value, setValue]; // expose the stateful array and its setter like useState
} // end usePersistentArray
