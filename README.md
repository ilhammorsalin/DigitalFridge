This project tracks your fridge ingredients and suggests a recipe based on them.

## Backend

Reorganized to a clearer structure:

- backend/src/server.js – Express app entry
- backend/src/services/ai.js – Gemini helper
- backend/.env.example – sample env variables

Create a `backend/.env` from the example and fill in:

- GOOGLE_API_KEY – Gemini API key
- PORT – optional (default 5000)
- NODE_ENV – optional (defaults to development)
- ALLOWED_ORIGINS – optional comma-separated origins for CORS (e.g. `https://digitalfridge-frontend.onrender.com,http://localhost:5173`)

Run backend locally:

```bash
cd backend
npm install
npm run dev
```

Health check: GET http://localhost:5000/health

JSON endpoint: POST http://localhost:5000/api/ingredients-json

Markdown endpoint: POST http://localhost:5000/api/ingredients-md

## Frontend

Frontend remains in `frontend/` (Vite). Configure the API base via `VITE_BACKEND_API` if needed.

```bash
cd frontend
npm install
npm run dev
```

Default dev URL: http://localhost:5173
