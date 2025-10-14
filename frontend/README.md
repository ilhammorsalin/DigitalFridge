# Digital Fridge – Frontend

React + Vite single-page app for tracking fridge / freezer ingredients and requesting concise AI-generated recipes from the backend.

Hosted UI: https://digitalfridge-frontend.onrender.com
Backend API: https://digitalfridge-backend.onrender.com

## Features
- Ingredient entry for two categories: Deep (freezer) & Normal (fridge/pantry)
- Local persistence via `localStorage`
- JSON recipe retrieval + display of structured metadata
- Markdown recipe retrieval + rendered preview + raw source
- Modular structure with components, hooks, services, and utilities
- Path aliases for cleaner imports

## Tech Stack
- React 19 + Vite
- Bootstrap 5 (styling/layout)
- `marked` for Markdown rendering
- ESLint (flat config) with React hooks & refresh plugins

## Environment Variables
Frontend reads only one custom variable (build-time):

| Variable | Purpose | Default |
| -------- | ------- | ------- |
| `VITE_BACKEND_API` | Base URL for API requests | `http://localhost:5000` |

Set it when running locally if backend not on default:
```bash
VITE_BACKEND_API=http://localhost:5001 npm run dev
```

## Scripts
```bash
npm run dev      # Start Vite dev server
npm run build    # Production build (dist/)
npm run preview  # Preview built app
npm run lint     # Lint source
```

## Project Layout
```
frontend/
  src/
    main.jsx          # Entry: mounts <App />
    App.jsx           # Top-level component
    Fridge.jsx        # Container with recipe flow
    components/       # Presentational / UI components
    hooks/            # Reusable hooks (e.g. localStorage persistence)
    services/         # API abstraction
    utils/            # Small helpers (storage)
  public/             # Static assets
  vite.config.js      # Vite + path aliases
  eslint.config.js    # Flat ESLint config
```

## Data Flow
1. User enters ingredients (Deep / Normal)
2. Arrays persist in localStorage via `usePersistentArray`
3. User requests recipe (JSON or Markdown)
4. Service layer (`services/api.js`) POSTs to backend
5. Response displayed in cards (JSON textarea or rendered Markdown)

## Path Aliases
Configured in `vite.config.js`:
- `@` → `src`
- `@components`, `@hooks`, `@services`, `@utils`

## Development
```bash
cd frontend
npm install
npm run dev
```
App defaults to http://localhost:5173

## Example API Usage (Dev)
```bash
curl -X POST http://localhost:5000/api/ingredients-json \
  -H 'Content-Type: application/json' \
  -d '{"deepIngredients":["frozen beef"],"normalIngredients":["onion","pepper"]}'
```

## Accessibility / UX Ideas (Future)
- Keyboard shortcuts for adding ingredients
- Editable / removable list items
- Dark mode toggle

## Future Enhancements
- Routing (e.g., history of recipes)
- TypeScript adoption
- Unit tests (Vitest / React Testing Library)

---
MIT License (adjust if needed)
