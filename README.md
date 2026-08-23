# Personal Site

This repo contains the React frontend and Express/Postgres backend for Kory Kilpatrick's personal site.

## Current Product Surface

Active public routes:

- `/`
- `/about`
- `/bookshelf`
- `/quotes`

Posts routes:

- `/posts`
- `/posts/:slug`

Posts are loaded at runtime from Postgres. Draft bodies, metadata, source maps, and
media are deliberately absent from this public repository. Public API routes expose
only published rows; explicit preview builds use authenticated admin endpoints. See
`frontend/src/content/posts/README.md` for the local import and review workflow.

Private routes:

- `/login`
- `/admin/*`

The repo also keeps non-production page work for future revival. Dormant pages live in `frontend/src/pages/dormant/` so they are preserved without cluttering the active route table.

## Stack

- Frontend: React 18, TypeScript, React Router, Tailwind, Webpack
- Backend: Express, TypeScript, PostgreSQL, Knex
- Auth: JWT admin login
- Tooling: Jest, Playwright, ESLint, GitHub Actions
- Content utilities: OpenAI-backed library metadata extraction

## Development

Prerequisites:

- Node.js 20+
- PostgreSQL 12+

Install dependencies:

```bash
npm run install:all
```

Run frontend and backend together:

```bash
npm run dev:all
```

Core checks:

- `npm run lint`
- `npm run typecheck`
- `npm test -- --runInBand`
- `npm run build`
- `npm run check:public-safety`
- `npm run validate:posts`
- `npm run build:posts-preview`
- `cd server && npm run lint`
- `cd server && npm test -- --runInBand`
- `cd server && npm run build`

## Environment

Frontend expects the API at `/api`.

Typical backend local settings:

```bash
PORT=3001
API_PREFIX=/api
DB_HOST=localhost
DB_PORT=5432
DB_NAME=personal_site
DB_USER=postgres
DB_PASSWORD=yourpassword
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=replace-me
JWT_EXPIRES_IN=1h
```

## API Model

- Public API routes are read-only.
- All content mutations happen under authenticated `/api/admin/*`.
- Library metadata extraction is authenticated admin tooling.
- Books and bookshelves are updated through the Goodreads sync/script path and database operations, not through a public write API.

See `docs/API.md` for the current route contract.
