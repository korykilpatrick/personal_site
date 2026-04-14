# API Documentation

## Overview

The Personal Portfolio API provides read-only public endpoints for published content and authenticated admin endpoints for private content management.

## Base URL

```
http://localhost:3001/api
```

## Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

Public content routes are read-only. Content mutations happen only through authenticated admin routes.

### Library

#### Extract Metadata from URL

Automatically extracts metadata from a provided URL using AI.

```
POST /api/library/extract-metadata
```

**Request Body:**
```json
{
  "url": "https://example.com/article",
  "forceRefresh": false  // Optional: bypass cache
}
```

**Response (200 OK):**
```json
{
  "title": "Article Title",
  "author": "Author Name",
  "description": "Article description...",
  "imageUrl": "https://example.com/image.jpg",
  "suggestedCategory": "article",
  "tags": ["technology", "programming"],
  "publicationDate": "2024-01-01T00:00:00Z",
  "contentType": "article",
  "extractionMetadata": {
    "confidence": 0.95,
    "extractedAt": "2024-01-01T12:00:00Z",
    "llmModel": "gpt-4-turbo-preview",
    "version": "1.0.0"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid URL format
- `401 Unauthorized` - Missing or invalid authentication
- `422 Unprocessable Entity` - Unable to extract metadata from URL
- `429 Too Many Requests` - Rate limit exceeded (10 requests per 15 minutes)
- `500 Internal Server Error` - Server error

**Rate Limiting:**
- 10 requests per 15-minute window per IP address
- Admin users bypass rate limiting

**Caching:**
- Results are cached for 1 hour by default
- Use `forceRefresh: true` to bypass cache

### Library Items

#### Get Library Items

```
GET /api/library-items?item_type_id=1&tag=programming
```

**Query Parameters:**
- `item_type_id` (optional) - Filter by item type
- `tag` (optional) - Filter by tag

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "item_type_id": 1,
    "link": "https://example.com",
    "title": "Example Article",
    "blurb": "Description...",
    "thumbnail_url": "https://example.com/thumb.jpg",
    "tags": ["programming", "web"],
    "creators": ["John Doe"],
    "type_name": "article",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### Books

#### Get Books

```
GET /api/books?includeShelves=true
```

**Query Parameters:**
- `includeShelves` (optional) - Include bookshelf associations

#### Get Book by ID

```
GET /api/books/:id
```

### Projects

#### Get Projects

```
GET /api/projects?tag=react
```

**Query Parameters:**
- `tag` (optional) - Filter by tag

#### Get Project by ID

```
GET /api/projects/:id
```

### Work Experience

#### Get Work Entries

```
GET /api/work
```

#### Get Work Entry by ID

```
GET /api/work/:id
```

### Authentication

#### Login

```
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "password"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "admin"
  }
}
```

### Admin Routes

All admin routes require authentication.

#### Projects Management

```
GET    /api/admin/projects
GET    /api/admin/projects/:id
POST   /api/admin/projects
PUT    /api/admin/projects/:id
DELETE /api/admin/projects/:id
```

#### Work Management

```
GET    /api/admin/work
GET    /api/admin/work/:id
POST   /api/admin/work
PUT    /api/admin/work/:id
DELETE /api/admin/work/:id
```

#### Library Items Management

```
GET    /api/admin/library-items
GET    /api/admin/library-items/:id
POST   /api/admin/library-items
PUT    /api/admin/library-items/:id
DELETE /api/admin/library-items/:id
```

#### Library Item Types

```
GET    /api/admin/library-item-types
POST   /api/admin/library-item-types
PUT    /api/admin/library-item-types/:id
DELETE /api/admin/library-item-types/:id
```

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "message": "Human-readable error message",
  "error": "ERROR_CODE",
  "details": {}  // Optional additional information
}
```

## Rate Limiting

- Public endpoints: 100 requests per 15 minutes per IP
- Metadata extraction: 10 requests per 15 minutes per IP
- Admin endpoints: No rate limiting

## Access Model

- Public routes expose only published, user-facing content.
- Admin and curation routes require authentication.
- Books and bookshelves are not writable through the public API.

## CORS

CORS is enabled for all origins in development. In production, configure allowed origins in environment variables.
