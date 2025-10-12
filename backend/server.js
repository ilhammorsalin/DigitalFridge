require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.send('api is running lesgooooooooo');
});

// Helper to generate a concise recipe using Gemini (with safe fallback)
// Options:
// - output: 'text' | 'markdown' — controls formatting of the successful recipe
// - requireApiKey: boolean — if true, throws when GOOGLE_API_KEY is missing
async function generateConciseRecipe({
  deepIngredients,
  normalIngredients,
  output = 'text',
  requireApiKey = false,
}) {
  const deep = Array.isArray(deepIngredients) ? deepIngredients : [];
  const normal = Array.isArray(normalIngredients) ? normalIngredients : [];

  const all = [...deep, ...normal].filter(Boolean);

  // Fallback if no ingredients provided
  if (all.length === 0) {
    const base =
      'No ingredients provided. Try adding a few items like chicken, rice, and veggies to get a quick recipe.';
    if (output === 'markdown') {
      return `# No Ingredients\n\n${base}`;
    }
    return base;
  }

  // If no API key, return a lightweight heuristic recipe
  if (!process.env.GOOGLE_API_KEY) {
    if (requireApiKey) {
      const err = new Error('GOOGLE_API_KEY is missing');
      err.code = 'NO_API_KEY';
      throw err;
    }
    const title = `${normal[0] || deep[0]} Quick Skillet`;
    const used = all.slice(0, 6).join(', ');
    if (output === 'markdown') {
      return (
        `# ${title}\n\n` +
        `Serves 2 • ~20 min\n\n` +
        `## Ingredients\n` +
        `- ${used}\n- Olive oil\n- Salt & pepper\n- Garlic (optional)\n\n` +
        `## Steps\n` +
        `1. Heat oil, add chopped ingredients.\n` +
        `2. Season and sauté until tender.\n` +
        `3. Deglaze with a splash of water/stock.\n` +
        `4. Finish with herbs or a squeeze of lemon.`
      );
    }
    return (
      `${title}\n` +
      `Serves 2 • ~20 min\n` +
      `Ingredients: ${used}, olive oil, salt, pepper, garlic (optional).\n` +
      `Steps: 1) Heat oil, add chopped ingredients. 2) Season and sauté until tender. 3) Splash of water/stock to deglaze. 4) Finish with herbs/acid to taste.`
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const basePrompt =
      `You are a helpful cooking assistant. Create ONE concise, tasty recipe using the provided ingredients.\n\n` +
      `Deep (freezer): ${deep.join(', ') || 'none'}\n` +
      `Normal (fridge/pantry): ${normal.join(', ') || 'none'}\n\n` +
      `Rules:\n` +
      `- Prefer fresh/perishable items first; use freezer items as protein/backup.\n` +
      `- You may assume basic pantry staples (water, oil, salt, pepper, sugar, soy sauce).\n` +
      `- Keep it SHORT (<= 120 words).\n` +
      `- If something key is missing, suggest a simple substitution.\n`;

    const prompt =
      output === 'markdown'
        ? basePrompt +
          `Format strictly as Markdown:\n` +
          `# Title (1 line)\n` +
          `Serves X • ~Y min (one line)\n` +
          `## Ingredients\n- inline, comma-separated key ingredients (include provided items)\n` +
          `## Steps\n1-5 short numbered steps\n` +
          `Output only Markdown.`
        : basePrompt +
          `Format: Title; Servings & time (one line); Ingredients (inline, comma-separated); Steps (3-5 short steps).\n` +
          `Output only the recipe text.`;

    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() || '';
    if (!text.trim()) throw new Error('Empty response from Gemini');
    return text.trim();
  } catch (err) {
    console.error('Gemini error:', err?.message || err);
    // Graceful fallback with a deterministic quick recipe (only used when API key exists but call fails)
    const title = `${normal[0] || deep[0]} One-Pan Stir-Fry`;
    const used = all.slice(0, 6).join(', ');
    if (output === 'markdown') {
      return (
        `# ${title}\n\n` +
        `Serves 2 • ~15–20 min\n\n` +
        `## Ingredients\n` +
        `- ${used}\n- Oil\n- Soy sauce\n- Garlic/ginger (optional)\n\n` +
        `## Steps\n` +
        `1. Heat oil in pan.\n` +
        `2. Add sliced ingredients, stir-fry on high.\n` +
        `3. Add soy + a splash of water.\n` +
        `4. Cook until crisp-tender.\n` +
        `5. Serve over rice or noodles.`
      );
    }
    return (
      `${title}\n` +
      `Serves 2 • ~15-20 min\n` +
      `Ingredients: ${used}, oil, soy sauce, garlic/ginger (optional).\n` +
      `Steps: 1) Heat oil in pan. 2) Add sliced ingredients, stir-fry on high. 3) Splash soy + a little water. 4) Cook until crisp-tender. 5) Serve over rice/noodles.`
    );
  }
}

// Enhanced endpoint (JSON): returns counts plus a concise recipe suggestion
app.post('/api/ingredients-json', async (req, res) => {
  const { deepIngredients = [], normalIngredients = [] } = req.body || {};

  try {
    const recipe = await generateConciseRecipe({ deepIngredients, normalIngredients });

    res.json({
      timestamp: new Date().toISOString(),
      model: process.env.GOOGLE_API_KEY ? 'gemini-2.5-flash' : 'fallback',
      recipe,
      received: {
        deepIngredients,
        normalIngredients,
      },
      counts: {
        deep: Array.isArray(deepIngredients) ? deepIngredients.length : 0,
        normal: Array.isArray(normalIngredients) ? normalIngredients.length : 0,
      },
    });
  } catch (e) {
    console.error('Unhandled error in /api/ingredients-json:', e);
    res.status(500).json({ ok: false, error: 'Failed to generate recipe' });
  }
});

// New endpoint: returns Markdown if API key is present, otherwise returns plain error text
app.post('/api/ingredients-md', async (req, res) => {
  const { deepIngredients = [], normalIngredients = [] } = req.body || {};

  try {
    const markdown = await generateConciseRecipe({
      deepIngredients,
      normalIngredients,
      output: 'markdown',
      requireApiKey: true,
    });
    res.set('Content-Type', 'text/markdown; charset=utf-8').status(200).send(markdown);
  } catch (e) {
    if (e && (e.code === 'NO_API_KEY' || /missing api key|no api key/i.test(e.message || ''))) {
      return res
        .status(400)
        .type('text/plain')
        .send('GOOGLE_API_KEY is missing. Please set it in the backend environment.');
    }
    console.error('Unhandled error in /api/ingredients-md:', e);
    res.status(500).type('text/plain').send('Failed to generate recipe');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
