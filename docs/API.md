# API Documentation

## Base URL

```text
http://localhost:3001/api
```

## Access Model

- Public routes are read-only.
- Authentication happens through `POST /api/auth/login`.
- Content mutations live under authenticated `/api/admin/*`.
- Library metadata extraction is authenticated admin tooling.

Protected requests use:

```text
Authorization: Bearer <token>
```

## Public Routes

Health:
- `GET /api/health`

Books:
- `GET /api/books`
- `GET /api/books/:id`

Bookshelves:
- `GET /api/bookshelves`
- `GET /api/bookshelves/:id`
- `GET /api/bookshelves/:id/books`

Projects:
- `GET /api/projects`
- `GET /api/projects?tag=react`
- `GET /api/projects/summary/count`
- `GET /api/projects/:id`

Work:
- `GET /api/work`
- `GET /api/work/summary/count`
- `GET /api/work/:id`

Quotes:
- `GET /api/quotes`
- `GET /api/quotes?active=true`
- `GET /api/quotes/summary/count`
- `GET /api/quotes/summary/count?active=true`

Site notes:
- `GET /api/site_notes`
- `GET /api/site_notes?active=true`
- `GET /api/site_notes/active`
- `GET /api/site_notes/summary/count`

Library:
- `GET /api/library-item-types`
- `GET /api/library-item-types/:id`
- `GET /api/library-items`
- `GET /api/library-items?item_type_id=1&tag=programming`
- `GET /api/library-items/summary/count`
- `GET /api/library-items/:id`

## Authentication

Login:

```text
POST /api/auth/login
```

Example request body:

```json
{
  "username": "admin",
  "password": "password"
}
```

Example response:

```json
{
  "token": "jwt-token",
  "user": {
    "username": "admin"
  }
}
```

## Admin Routes

Projects:
- `GET /api/admin/projects`
- `GET /api/admin/projects/:id`
- `POST /api/admin/projects`
- `PUT /api/admin/projects/:id`
- `DELETE /api/admin/projects/:id`

Work:
- `GET /api/admin/work`
- `GET /api/admin/work/:id`
- `POST /api/admin/work`
- `PUT /api/admin/work/:id`
- `DELETE /api/admin/work/:id`

Quotes:
- `GET /api/admin/quotes`
- `GET /api/admin/quotes/:id`
- `POST /api/admin/quotes`
- `PUT /api/admin/quotes/:id`
- `DELETE /api/admin/quotes/:id`

Site notes:
- `GET /api/admin/site_notes`
- `GET /api/admin/site_notes/:id`
- `POST /api/admin/site_notes`
- `PUT /api/admin/site_notes/:id`
- `DELETE /api/admin/site_notes/:id`

Library items:
- `GET /api/admin/library-items`
- `GET /api/admin/library-items/:id`
- `POST /api/admin/library-items`
- `PUT /api/admin/library-items/:id`
- `DELETE /api/admin/library-items/:id`

Library item types:
- `GET /api/admin/library-item-types`
- `GET /api/admin/library-item-types/:id`
- `POST /api/admin/library-item-types`
- `PUT /api/admin/library-item-types/:id`
- `DELETE /api/admin/library-item-types/:id`

Library extraction:
- `POST /api/library/extract-metadata`

Example extraction request:

```json
{
  "url": "https://example.com/article",
  "forceRefresh": false
}
```

## Notes

- Public write routes for books, bookshelves, projects, and work do not exist.
- Books and bookshelves are currently updated outside the public site through the Goodreads sync/script path and database operations.
- Not every public API surface is currently linked from the live navbar, but the API contract above reflects what the backend serves today.
