const { GoogleGenerativeAI } = require('@google/generative-ai');

// ============================================================================
// Ingredient Processing
// ============================================================================

function normalizeIngredients(deepIngredients, normalIngredients) {
  const deep = Array.isArray(deepIngredients) ? deepIngredients : [];
  const normal = Array.isArray(normalIngredients) ? normalIngredients : [];
  const all = [...deep, ...normal].filter(Boolean);
  
  return { deep, normal, all };
}

// ============================================================================
// Error Responses
// ============================================================================

function createErrorResponse(message, code) {
  const error = new Error(message);
  error.code = code;
  error.isUserFriendly = true;
  return error;
}

function handleNoIngredients() {
  throw createErrorResponse(
    'No ingredients provided. Please add some ingredients to generate a recipe.',
    'NO_INGREDIENTS'
  );
}

function handleMissingApiKey() {
  throw createErrorResponse(
    'Recipe generation requires a Google API key. Please set GOOGLE_API_KEY in your environment variables.',
    'NO_API_KEY'
  );
}

function handleApiError(originalError) {
  throw createErrorResponse(
    `Unable to generate recipe at this time. Please try again later. ${
      originalError?.message ? `(${originalError.message})` : ''
    }`,
    'API_ERROR'
  );
}

// ============================================================================
// Formatting Utilities
// ============================================================================

function formatMarkdownRecipe({ title, servings, ingredients, steps }) {
  const stepsText = Array.isArray(steps)
    ? steps.map((step, i) => `${i + 1}. ${step}`).join('\n')
    : steps;
  
  return (
    `# ${title}\n\n` +
    `${servings}\n\n` +
    `## Ingredients\n${ingredients}\n\n` +
    `## Steps\n${stepsText}`
  );
}

function formatTextRecipe({ title, servings, ingredients, steps }) {
  return (
    `${title}\n` +
    `${servings}\n` +
    `Ingredients: ${ingredients}.\n` +
    `Steps: ${steps}`
  );
}

// ============================================================================
// API Key Validation
// ============================================================================

function validateApiKey(requireApiKey) {
  if (!process.env.GOOGLE_API_KEY) {
    if (requireApiKey) {
      handleMissingApiKey();
    }
    return false;
  }
  return true;
}

// ============================================================================
// Prompt Generation
// ============================================================================

function buildPrompt(ingredients, output) {
  const { deep, normal } = ingredients;
  
  const basePrompt =
    `You are a helpful cooking assistant. Create ONE concise, tasty recipe using the provided ingredients.\n\n` +
    `Deep (freezer): ${deep.join(', ') || 'none'}\n` +
    `Normal (fridge/pantry): ${normal.join(', ') || 'none'}\n\n` +
    `Rules:\n` +
    `- Prefer fresh/perishable items first; use freezer items as protein/backup.\n` +
    `- You may assume basic pantry staples (water, oil, salt, pepper, sugar, soy sauce).\n` +
    `- Keep it SHORT (<= 120 words).\n` +
    `- If something key is missing, suggest a simple substitution.\n`;

  if (output === 'markdown') {
    return basePrompt +
      `Format strictly as Markdown:\n` +
      `# Title (1 line)\n` +
      `Serves X • ~Y min (one line)\n` +
      `## Ingredients\n- inline, comma-separated key ingredients (include provided items)\n` +
      `## Steps\n1-5 short numbered steps\n` +
      `Output only Markdown.`;
  }
  
  return basePrompt +
    `Format: Title; Servings & time (one line); Ingredients (inline, comma-separated); Steps (3-5 short steps).\n` +
    `Output only the recipe text.`;
}

// ============================================================================
// Gemini API Integration
// ============================================================================

async function callGeminiApi(prompt) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() || '';
    
    if (!text.trim()) {
      throw new Error('Empty response from Gemini');
    }
    
    return text.trim();
  } catch (err) {
    console.error('Gemini API error:', err?.message || err);
    handleApiError(err);
  }
}

// ============================================================================
// Main Function
// ============================================================================

async function generateConciseRecipe({
  deepIngredients,
  normalIngredients,
  output = 'text',
  requireApiKey = false,
}) {
  const ingredients = normalizeIngredients(deepIngredients, normalIngredients);
  
  // Validate we have ingredients
  if (ingredients.all.length === 0) {
    handleNoIngredients();
  }
  
  // Validate API key is available
  const hasApiKey = validateApiKey(requireApiKey);
  if (!hasApiKey) {
    handleMissingApiKey();
  }
  
  // Generate recipe via Gemini API
  const prompt = buildPrompt(ingredients, output);
  return await callGeminiApi(prompt);
}

module.exports = { generateConciseRecipe };