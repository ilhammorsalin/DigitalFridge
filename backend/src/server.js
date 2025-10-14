require('dotenv').config(); // package to import and config for ENVIROMENT VARIABLES
const express = require('express'); // EXPRESS is a package to configure REST requests
const cors = require('cors'); // CORS allows to configure cross origin resource sharing
const { generateConciseRecipe } = require('./services/ai'); // Recipe generator helper

const app = express();

// Middleware - 
app.use(express.json());

// CORS: allow the deployed frontend and optional .env override
// You can set ALLOWED_ORIGINS as a comma-separated list in .env, e.g.:
// ALLOWED_ORIGINS=https://digitalfridge-frontend.onrender.com,http://localhost:5173
const configuredOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const defaultOrigins = ['https://digitalfridge-frontend.onrender.com'];

// In dev, it is convenient to allow Vite default origin
if (process.env.NODE_ENV !== 'production') {
  defaultOrigins.push('http://localhost:5173');
}

const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])]
  .filter(Boolean)
  .map((o) => o.replace(/\/$/, ''));

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without Origin header (e.g., curl, same-origin)
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(normalized)) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
  })
);

// Routes
app.get('/', (req, res) => {
  res.send('welcome to the default page');
});

app.get('/health', (req, res) => {
  const timestamp = new Date().toISOString();
  const hasApiKey = !!process.env.GOOGLE_API_KEY;
  
  const healthStatus = {
    status: 'healthy',
    timestamp,
    api: {
      running: true,
      port: process.env.PORT || 5000,
      env: process.env.NODE_ENV || 'development',
      allowedOrigins,
    },
    gemini: {
      configured: hasApiKey,
      model: hasApiKey ? 'gemini-2.5-flash' : 'unavailable'
    },
    uptime: process.uptime()
  };
  
  console.log(`[${timestamp}] API Status: Running, Gemini: ${hasApiKey ? 'Configured' : 'Not configured'}`);
  
  res.json(healthStatus);
});

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
