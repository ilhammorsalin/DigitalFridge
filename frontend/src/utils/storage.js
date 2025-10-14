export function loadArray(key) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveArray(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function clearKeys(keys) {
  try {
    for (const k of keys) localStorage.removeItem(k);
  } catch {
    // ignore
  }
}
