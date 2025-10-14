require('dotenv').config(); // Load environment variables from .env file
const express = require('express'); // Express framework for REST API
const cors = require('cors'); // CORS middleware for cross-origin requests
const { generateConciseRecipe } = require('./services/ai'); // AI recipe generation service

const app = express();

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Configures allowed CORS origins based on environment and .env settings
 * @returns {Array<string>} Array of normalized allowed origin URLs
 */
function configureAllowedOrigins() {
  // Parse comma-separated origins from environment variable
  const configuredOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // Default production origin
  const defaultOrigins = ['https://digitalfridge-frontend.onrender.com'];

  // Add local development origin in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    defaultOrigins.push('http://localhost:5173');
  }

  // Combine and deduplicate origins, normalize by removing trailing slashes
  return [...new Set([...defaultOrigins, ...configuredOrigins])]
    .filter(Boolean)
    .map((o) => o.replace(/\/$/, ''));
}

/**
 * CORS origin validation callback
 * @param {string} origin - The origin of the incoming request
 * @param {Function} callback - CORS callback function
 */
function corsOriginHandler(origin, callback) {
  // Allow requests without Origin header (e.g., curl, same-origin, server-to-server)
  if (!origin) {
    return callback(null, true);
  }

  // Normalize origin and check against whitelist
  const normalizedOrigin = origin.replace(/\/$/, '');
  const allowedOrigins = configureAllowedOrigins();

  if (allowedOrigins.includes(normalizedOrigin)) {
    return callback(null, true);
  }

  // Reject unauthorized origins
  return callback(new Error(`Not allowed by CORS: ${origin}`));
}

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Parse incoming JSON payloads
app.use(express.json());

// Configure CORS with dynamic origin validation
app.use(cors({ origin: corsOriginHandler }));

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

/**
 * Root endpoint - Basic welcome message
 * GET /
 */
function handleRoot(req, res) {
  res.send('welcome to the default page');
}

/**
 * Health check endpoint - Returns API status and configuration
 * GET /health
 */
function handleHealthCheck(req, res) {
  const timestamp = new Date().toISOString();
  const hasApiKey = !!process.env.GOOGLE_API_KEY;

  const healthStatus = {
    status: 'healthy',
    timestamp,
    api: {
      running: true,
      port: process.env.PORT || 5000,
      env: process.env.NODE_ENV || 'development',
      allowedOrigins: configureAllowedOrigins(),
    },
    gemini: {
      configured: hasApiKey,
      model: hasApiKey ? 'gemini-2.5-flash' : 'unavailable',
    },
    uptime: process.uptime(),
  };

  // Log health check for monitoring
  console.log(
    `[${timestamp}] API Status: Running, Gemini: ${hasApiKey ? 'Configured' : 'Not configured'}`
  );

  res.json(healthStatus);
}

/**
 * Recipe generation endpoint - Returns JSON with recipe and metadata
 * POST /api/ingredients-json
 * Body: { deepIngredients: string[], normalIngredients: string[] }
 */
async function handleIngredientsJson(req, res) {
  const { deepIngredients = [], normalIngredients = [] } = req.body || {};

  try {
    // Generate recipe using AI service
    const recipe = await generateConciseRecipe({
      deepIngredients,
      normalIngredients,
    });

    // Return structured JSON response with recipe and metadata
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
  } catch (error) {
    console.error('Error in /api/ingredients-json:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to generate recipe',
    });
  }
}

/**
 * Recipe generation endpoint - Returns Markdown formatted recipe
 * POST /api/ingredients-md
 * Body: { deepIngredients: string[], normalIngredients: string[] }
 * Requires: GOOGLE_API_KEY environment variable
 */
async function handleIngredientsMd(req, res) {
  const { deepIngredients = [], normalIngredients = [] } = req.body || {};

  try {
    // Generate recipe in Markdown format, requiring API key
    const markdown = await generateConciseRecipe({
      deepIngredients,
      normalIngredients,
      output: 'markdown',
      requireApiKey: true,
    });

    // Return Markdown with proper content type
    res
      .set('Content-Type', 'text/markdown; charset=utf-8')
      .status(200)
      .send(markdown);
  } catch (error) {
    // Handle missing API key error specifically
    if (
      error &&
      (error.code === 'NO_API_KEY' ||
        /missing api key|no api key/i.test(error.message || ''))
    ) {
      return res
        .status(400)
        .type('text/plain')
        .send('GOOGLE_API_KEY is missing. Please set it in the backend environment.');
    }

    // Handle other errors
    console.error('Error in /api/ingredients-md:', error);
    res
      .status(500)
      .type('text/plain')
      .send('Failed to generate recipe');
  }
}

// ============================================================================
// ROUTE REGISTRATION
// ============================================================================

app.get('/', handleRoot);
app.get('/health', handleHealthCheck);
app.post('/api/ingredients-json', handleIngredientsJson);
app.post('/api/ingredients-md', handleIngredientsMd);

// ============================================================================
// SERVER STARTUP
// ============================================================================

/**
 * Starts the Express server on the configured port
 */
function startServer() {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`CORS Origins: ${configureAllowedOrigins().join(', ')}`);
  });
}

// Start the server
startServer();