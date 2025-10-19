export function loadArray(key) {
  // export a function to read a JSON array from localStorage
  try {
    // protect against storage being unavailable or JSON parse errors
    const saved = localStorage.getItem(key); // get the raw JSON string stored under this key
    return saved ? JSON.parse(saved) : []; // parse to JS array if found, else return an empty array
  } catch {
    // if anything goes wrong (quota, privacy mode, bad JSON)
    return []; // fail safely with an empty array
  } // end try/catch
} // end loadArray

export function saveArray(key, value) {
  // export a function to save an array to localStorage
  try {
    // guard writes in case storage is blocked or full
    localStorage.setItem(key, JSON.stringify(value)); // serialize the array to JSON and store it by key
  } catch {
    // ignore write failures so the app keeps working
    // ignore // intentionally swallow errors (e.g., quota exceeded)
  } // end try/catch
} // end saveArray

export function clearKeys(keys) {
  // export a function to remove multiple localStorage keys
  try {
    // guard against storage access issues
    for (const k of keys) localStorage.removeItem(k); // loop through each key and remove it from localStorage
  } catch {
    // ignore errors so a single failure doesn't crash the app
    // ignore // intentionally swallow errors
  } // end try/catch
} // end clearKeys
