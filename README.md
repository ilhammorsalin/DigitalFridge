## Digital Fridge

Track ingredients in two zones (Deep / Normal) and generate concise AI-powered recipes (JSON & Markdown) using Google Gemini.

Hosted UI: https://digitalfridge-frontend.onrender.com  
Hosted API: https://digitalfridge-backend.onrender.com

Sub-documentation:
- `frontend/README.md` – React/Vite app details
- `backend/README.md` – Express API & endpoints

---

## Quick Start

Clone repo then install both apps:

```bash
npm --prefix backend install
npm --prefix frontend install
```

### Backend (API)
```bash
cp backend/.env.example backend/.env # add GOOGLE_API_KEY
npm --prefix backend run dev
```
Health: http://localhost:5000/health

### Frontend (UI)
```bash
npm --prefix frontend run dev
```
Dev URL: http://localhost:5173

Optionally point frontend to a different API:
```bash
VITE_BACKEND_API=http://localhost:5001 npm --prefix frontend run dev
```

---

## Core Endpoints (API)
| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET | `/health` | Status + config snapshot |
| POST | `/api/ingredients-json` | JSON recipe + metadata |
| POST | `/api/ingredients-md` | Markdown recipe (requires key) |

Example JSON request:
```bash
curl -X POST http://localhost:5000/api/ingredients-json \
	-H 'Content-Type: application/json' \
	-d '{"deepIngredients":["frozen chicken"],"normalIngredients":["onion","tomato"]}'
```

---

## Architecture Overview

| Layer | Summary |
| ----- | ------- |
| Frontend | React (Vite) SPA, localStorage persistence, fetches recipes |
| Backend | Express API, Gemini integration, CORS allowlist |
| AI Service | `@google/generative-ai` model `gemini-2.5-flash` |

Data flow: User enters ingredients → frontend persists & POSTs → backend generates recipe → response (JSON/Markdown) rendered.

---

## Environment Variables
See `.env.example` in each subproject. Key values:
- Backend: `GOOGLE_API_KEY`, `ALLOWED_ORIGINS`, `PORT`
- Frontend: `VITE_BACKEND_API`

---

## Development Scripts
Common tasks (run from repo root):
```bash
npm --prefix backend run dev   # API with nodemon
npm --prefix frontend run dev  # UI dev server
npm --prefix frontend run build
```

---

## Future Improvements
- Delete/edit ingredients individually
- Recipe history & favorites
- Rate limiting / auth on API
- OpenAPI spec & testing (unit + e2e)
- TypeScript migration
