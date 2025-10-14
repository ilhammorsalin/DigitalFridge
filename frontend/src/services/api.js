const API_BASE = import.meta.env.VITE_BACKEND_API || 'http://localhost:5000';

export async function postJson(path, payload) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) {
    // Try to parse JSON error, otherwise fallback to text
    try {
      const json = JSON.parse(text);
      throw new Error(json.message || json.error || text || `HTTP ${res.status}`);
    } catch (_) {
      throw new Error(text || `HTTP ${res.status}`);
    }
  }
  try {
    return JSON.parse(text);
  } catch (_) {
    // Return raw text when not JSON
    return text;
  }
}

export async function postIngredientsJson(deepIngredients, normalIngredients) {
  return postJson('/api/ingredients-json', { deepIngredients, normalIngredients });
}

export async function postIngredientsMarkdown(deepIngredients, normalIngredients) {
  return postJson('/api/ingredients-md', { deepIngredients, normalIngredients });
}
