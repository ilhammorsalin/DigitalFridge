const API_BASE = import.meta.env.VITE_BACKEND_API || 'http://localhost:5000'; // base URL from env or fallback to local dev server

export async function postJson(path, payload) {
  const res = await fetch(`${API_BASE}${path}`, { // send a network request to API_BASE + path
    method: 'POST', // use HTTP POST
    headers: { 'Content-Type': 'application/json' }, // tell server we are sending JSON
    body: JSON.stringify(payload), // convert JS object to JSON string as request body
  });
  const text = await res.text(); // read the raw response text (works for JSON and plain text)
  if (!res.ok) { // if HTTP status is not in the 200-299 range, treat as error
    // Try to parse JSON error, otherwise fallback to text
    try { // attempt to parse the error payload as JSON
      const json = JSON.parse(text); // parse the text into an object
      throw new Error(json.message || json.error || text || `HTTP ${res.status}`); // throw a useful error message
    } catch { // if parsing fails, use the raw text
      throw new Error(text || `HTTP ${res.status}`); // throw with plain text or status code
    }
  }
  try { // if success, try to parse JSON
    return JSON.parse(text); // return parsed JSON if possible
  } catch { // if it wasn't JSON
    // Return raw text when not JSON
    return text; // return plain text response
  }
}

export async function postIngredientsJson(deepIngredients, normalIngredients) {
  return postJson('/api/ingredients-json', { deepIngredients, normalIngredients }); // call the JSON endpoint with both arrays
}

export async function postIngredientsMarkdown(deepIngredients, normalIngredients) {
  return postJson('/api/ingredients-md', { deepIngredients, normalIngredients }); // call the Markdown endpoint with both arrays
}
