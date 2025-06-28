# API Documentation

## Overview

The Personal Portfolio API provides endpoints for managing portfolio content including projects, work experience, books, and library items. It uses JWT authentication for protected routes.

## Base URL

```
http://localhost:5001/api
```

## Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

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

## CORS

CORS is enabled for all origins in development. In production, configure allowed origins in environment variables.