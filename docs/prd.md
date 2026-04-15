# Product Brief

## Purpose

This site is the public home for Kory Kilpatrick's profile, bookshelf, quotes, and privately managed content.

## Current Public Surface

Live public pages:
- About
- Bookshelf
- Quotes

Private surface:
- Admin login
- Admin content management

The product is intentionally narrower than the repo's earlier portfolio/blog ambitions.

## Goals

- Keep the public experience sharp and coherent.
- Keep the bookshelf fresh and worth revisiting.
- Support private curation through the admin interface.
- Preserve future-facing page work without leaving it half-wired into production.

## Dormant Work

The repo intentionally keeps non-production pages in `frontend/src/pages/dormant/`:
- `HomePage`
- `ProjectsPage`
- `WorkPage`
- `LibraryPage`

These are retained as assets for future revival, not as part of the current live information architecture.

## Near-Term Priorities

- Maintain a clean, truthful route and navigation model.
- Preserve the read-only public API / authenticated admin mutation boundary.
- Reduce bundle size.
- Only reintroduce dormant pages when route, navigation, tests, and docs are updated together.
