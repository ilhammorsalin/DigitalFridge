require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
// Allow frontend dev server to call the API
app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);

// Routes
app.get('/', (req, res) => {
  res.send('API running');
});

// Simple echo endpoint to receive ingredients and respond with summary
app.post('/api/ingredients', (req, res) => {
  const { deepIngredients = [], normalIngredients = [] } = req.body || {};

  // Respond with a summary and the data we received
  res.json({
    ok: true,
    received: {
      deepIngredients,
      normalIngredients,
    },
    counts: {
      deep: Array.isArray(deepIngredients) ? deepIngredients.length : 0,
      normal: Array.isArray(normalIngredients) ? normalIngredients.length : 0,
    },
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
