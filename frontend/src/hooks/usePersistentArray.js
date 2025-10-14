import { useEffect, useState } from 'react';
import { loadArray, saveArray } from '@utils/storage';

export function usePersistentArray(key, initial = []) {
  const [value, setValue] = useState(() => loadArray(key) ?? initial);

  useEffect(() => {
    saveArray(key, value);
  }, [key, value]);

  return [value, setValue];
}
