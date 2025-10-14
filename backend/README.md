# Digital Fridge – Backend

Express API that accepts fridge/freezer ("deep") ingredient lists and returns an AI-generated concise recipe (JSON or Markdown) using Google Gemini.

Hosted API: https://digitalfridge-backend.onrender.com
Frontend (UI): https://digitalfridge-frontend.onrender.com

## Features
- CORS origin allow‑list with dynamic validation
- JSON and Markdown recipe endpoints
- Health/status endpoint with uptime + config snapshot
- LocalStorage persistence handled on frontend; backend is stateless
- Structured AI integration via `@google/generative-ai`

## Endpoints
| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/` | Basic welcome text |
| GET | `/health` | Health + config info (allowed origins, model availability) |
| POST | `/api/ingredients-json` | Returns JSON object with generated recipe & metadata |
| POST | `/api/ingredients-md` | Returns Markdown recipe (requires API key) |

### Request Body (POST endpoints)
```json
{
  "deepIngredients": ["frozen chicken"],
  "normalIngredients": ["tomato", "onion"]
}
```
All fields optional; empty or missing arrays trigger a validation error.

### Example cURL
```bash
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"deepIngredients":["frozen salmon"],"normalIngredients":["lemon","garlic"]}' \
  https://digitalfridge-backend.onrender.com/api/ingredients-json | jq
```

## Environment Variables
Copy `.env.example` to `.env`.

| Variable | Required | Purpose |
| -------- | -------- | ------- |
| `GOOGLE_API_KEY` | yes (for real recipes) | Auth for Gemini model |
| `PORT` | no | Server port (default 5000) |
| `ALLOWED_ORIGINS` | no | Comma-separated list of additional CORS origins |
| `NODE_ENV` | no | `production` disables localhost origin auto-add |

If `GOOGLE_API_KEY` is missing:
- `/api/ingredients-md` will return a 400 with guidance
- `/api/ingredients-json` will return `model: "fallback"` but still attempts generation (will error if model call needs key)

## Local Development
```bash
cd backend
npm install
npm run dev # nodemon
# or
npm start   # plain node
```
Health check: http://localhost:5000/health

## Project Layout
```
backend/
  src/
    server.js        # Express app & route wiring
    services/
      ai.js          # Gemini integration & recipe generation
  .env.example       # Template env vars
  package.json
```

## Error Handling
Errors produce JSON (or plain text for Markdown endpoint) with HTTP 4xx/5xx. User-facing errors are made friendly in `ai.js`.

## Security Notes
- CORS strictly checks origins (except same-origin / no-Origin requests)
- Do not log secrets. Current logs avoid printing the API key.

## Future Improvements
- Add rate limiting
- Add OpenAPI/Swagger spec
- Add tests & lint rules
- Structured logging (pino / winston)

---
MIT License (adjust if needed)
