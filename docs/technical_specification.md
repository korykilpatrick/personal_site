# Technical Specification

## Architecture

- Frontend: React SPA with TypeScript and React Router
- Backend: Express API with TypeScript
- Database: PostgreSQL
- Shared types: `types/`
- Build: Webpack
- Tests: Jest and Playwright
- CI: GitHub Actions

## Current Frontend Surface

Active routes:
- `/`
- `/about`
- `/bookshelf`
- `/quotes`
- `/login`
- `/admin/*`

Dormant, non-production pages are preserved under `frontend/src/pages/dormant/` so they remain revivable without leaving commented imports or route definitions in the live app shell.

## Backend Surface

Public read-only routes:
- books
- bookshelves
- projects
- work
- quotes
- site notes
- library item types
- library items

Authenticated routes:
- `/api/auth/login`
- `/api/admin/*`
- `/api/library/extract-metadata`

## Data Ownership

- Books and bookshelves are populated primarily through the Goodreads sync/script path and direct database updates.
- Admin CRUD for projects, work, quotes, site notes, library items, and library item types happens through authenticated API routes.
- Public visitors should never be able to mutate content through the API.

## Frontend Boundaries

- `frontend/src/api/` is the canonical frontend API layer.
- `frontend/src/context/` holds app-level providers.
- Complex UI features should live in module folders with colocated hooks, tests, and styles.
- Dormant page work belongs in `frontend/src/pages/dormant/`, not in `App.tsx` comments.

## Quality Gates

Frontend:
- `npm run lint`
- `npm run typecheck`
- `npm test -- --runInBand`
- `npm run build`

Server:
- `cd server && npm run lint`
- `cd server && npm test -- --runInBand`
- `cd server && npm run build`

The root Jest config is intentionally frontend-only so a clean frontend CI run does not depend on `server/node_modules`.

## Known Residuals

- The main frontend bundle still emits a webpack size warning.
- Browserslist data should be refreshed periodically.

- **Requirements:**
  - Fast navigation and data loading.
  - Optimized media handling.
- **Strategies:**
  - Code splitting with `React.lazy` and `Suspense` for routes.
  - Lazy loading for images and videos (`loading="lazy"`).
  - Minimize API calls and optimize data transfer.

## 10. Additional Considerations

- **Accessibility:** Use ARIA attributes and ensure keyboard navigation.
- **Maintenance:** Data updates are handled externally via scripts or direct database management.
- **Future Enhancements:** Consider adding authentication for admin features or integrating a CMS for content management.

---

### Summary of Key Decisions
- **Database-Driven:** All dynamic content (books, bookshelves, projects, gigs, timeline entries, blog posts, about info) is stored in PostgreSQL and accessed via API endpoints.
- **API Communication:** Axios is used for all HTTP requests from the frontend to the backend.
- **Navigation:** 'Work' in the navbar shows a dropdown on hover for Projects, Gigs, and Timeline.
- **About Page:** Includes contact information (email, social links) fetched from the database.
- **Styling:** Tailwind CSS ensures a consistent, responsive design.
- **No API Integration:** Goodreads data is pre-loaded into the database via a script, not fetched in real-time.

This PRD provides a comprehensive plan for building your personal website, ensuring it is database-powered, performant, and easy to maintain. Let me know if you need further clarification or adjustments!
