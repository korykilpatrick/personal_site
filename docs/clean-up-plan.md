# Implementation Plan – Codebase Health Check (2025-04-18)

## Overview
The codebase is a well-structured monorepo with React/TypeScript frontend and Node.js/Express backend using shared types and PostgreSQL. While the component organization and code separation are good foundational elements, the project suffers from inconsistent architectural patterns, data handling approaches, and security vulnerabilities. Addressing these inconsistencies and implementation gaps is essential to achieve production readiness and long-term maintainability.

## Task Checklist
### Quick Wins (<1 hour)
- [x] `server/src/middleware/authMiddleware.ts:47` — Missing return statement in auth check — **Fix:** Add return statement to prevent execution after unauthorized
- [x] `server/src/controllers/authController.ts:58-64` — Dead commented code — **Fix:** Remove commented-out password hashing function
- [x] `server/src/models/Project.ts:133` — SQL injection risk in whereRaw — **Fix:** Use parameterized query properly
- [x] `server/src/db/knexfile.ts:56` — Redundant SSL configuration — **Fix:** Simplify SSL options
- [x] `server/src/controllers/admin/workController.ts` (Line 9) — Remove unused `validateWorkEntryInput` function — **Fix:** Delete the unused validation function
- [x] `server/README.md` (API Endpoints section) — Update outdated API endpoint documentation — **Fix:** Correct endpoint paths (e.g., `/work` instead of `/gigs`, remove `/posts`)

### Medium Fixes (1–4 hrs)
- [x] `src/api/apiService.ts` & `src/services/api.ts` — API service fragmentation — **Fix:** Consolidate into a single Axios instance in `src/services/api.ts` with unified configuration and interceptors (auth, error handling). (Subsequent step: Consider migrating fetches to React Query/SWR using this instance).
- [x] `server/src/models/*` — Inconsistent model patterns between files — **Fix:** Standardize on BaseModel class pattern throughout
- [x] `src/components/forms/*` — Duplicate form validation logic — **Fix:** Extract common validation to shared hook (implemented simple util function `isRequired` and applied to `TagInput.tsx`)
- [ ] `server/src/middleware/authMiddleware.ts` — No brute force login protection — **Fix:** Implement rate-limiting or slow-down strategies
- [ ] `server/src/controllers/admin/*` — Controllers directly use models — **Fix:** Create corresponding Service classes (extending BaseService) for consistency
- [ ] `server/src/controllers/admin/*`, `server/src/routes/adminRoutes.ts` — Inconsistent validation approaches — **Fix:** Replace manual validation with express-validator chains
- [x] `server/src/db/migrations/*` — `text` columns for JSON data — **Fix:** Create migration to alter text columns to jsonb with proper casting
- [ ] `src/context/AuthContext.tsx` (Line 25) — Manual JWT parsing — **Fix:** Use a standard library like jwt-decode for robustness

### Strategic Refactors (>4 hrs)
- [ ] `server/*` — Security vulnerabilities in authentication — **Fix:** Conduct thorough security audit and implement proper auth workflow
- [ ] `server/src/models/Book.ts` & DB migrations — Dates stored as varchar — **Fix:** Migrate database columns to proper DATE/TIMESTAMP types with data conversion
- [ ] `src/*` — Component state management complexity — **Fix:** Implement global state with context/reducers or state management library
- [ ] `webpack.config.js` — Bundle optimization needed — **Fix:** Add code splitting, dynamic imports, and performance optimizations

## Systemic Themes
- **Inconsistent Architectural Patterns**: The codebase mixes class-based models with object exports, has inconsistent service layer usage, and different API calling patterns. Standardizing these patterns would significantly improve maintainability.
- **Type Safety & Data Handling**: Issues with varchar dates, inconsistent JSON handling, and unsafe type assertions indicate areas where type safety and data integrity can be improved.
- **Security Vulnerabilities**: Several critical security issues exist, particularly in authentication flow, JWT handling, SQL injection risks, and missing rate-limiting. A systematic approach to security is needed.
- **Code Duplication**: Similar patterns are implemented multiple times instead of being abstracted into reusable utilities, particularly in forms, API calls, and validation logic.
- **Error Handling Gaps**: Error handling is inconsistent between components and backend routes, creating potential for uncaught exceptions and poor user experience.
- **Environment Configuration Repetition**: Environment variables are parsed in multiple places, risking divergence.

## Preventive Automation
- **Pre-commit Hooks**: Use Husky with lint-staged to run checks before code is committed.
- **ESLint Rules**: Enhance ESLint configuration with `@typescript-eslint/strict` and custom rules to enforce architectural patterns.
- **TypeScript Strictness**: Enable strictest TypeScript checks by updating `tsconfig.json` with `"strict": true, "noImplicitAny": true, "strictNullChecks": true`.
- **Dependency Scanning**: Add GitHub Dependabot or similar for automated vulnerability scanning of dependencies.
- **Bundle Analysis**: Integrate Webpack Bundle Analyzer to monitor bundle size and prevent performance regressions.
- **API Documentation Generation**: Set up automated OpenAPI/Swagger documentation generation from code annotations.
------
Constraints
– Preserve business logic unless a clear bug is identified.
– Follow project style guides if they exist.
– Don't rewrite code here—only list precise edits and tasks.