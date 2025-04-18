# Personal Portfolio Backend Server

This is the backend server for the personal portfolio website, providing API endpoints for projects, blog posts, bookshelf, and professional experience data.

## Technology Stack

- **Node.js** with **Express** for the server framework
- **TypeScript** for static typing
- **PostgreSQL** for the database
- **Knex.js** for database queries and migrations
- **Express Validator** for request validation
- **Winston** for logging
- **Helmet** for security headers
- **Compression** for response compression
- **Jest** for testing

## Project Structure

```
server/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── db/             # Database migrations, seeds, and connection
│   ├── middleware/     # Express middleware
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   ├── scripts/        # Utility scripts
│   ├── utils/          # Utility functions
│   └── index.ts        # Entry point
├── .env                # Environment variables
└── package.json        # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- PostgreSQL (v12 or newer)

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Create a .env file based on the .env.example:
   ```
   cp .env.example .env
   ```

3. Update the .env file with your database credentials.

4. Create the database:
   ```
   npm run db:create
   ```

5. Run migrations and seed data:
   ```
   npm run migrate
   npm run seed
   ```

### Development

Start the development server:
```
npm run dev
```

The server will run at http://localhost:3001 by default.

### Available Scripts

- `npm run build` - Build the TypeScript code
- `npm run start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm run lint` - Lint the code
- `npm run format` - Format the code
- `npm run test` - Run tests
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed the database
- `npm run db:create` - Create the database
- `npm run db:reset` - Reset the database (drop, create, migrate, seed)

## API Endpoints

All endpoints are prefixed with `/api`.

### Health Check

- `GET /health` - Check server status

### Authentication

- `POST /auth/login` - Log in an administrator

### Books (Public)

- `GET /books` - Get all books
- `GET /books/:id` - Get a book by ID
// Note: POST, PUT, DELETE for books might be admin-only in practice, clarify if needed.
// Keeping them here for now as they are in book.routes.ts without explicit admin protection.
- `POST /books` - Create a new book
- `PUT /books/:id` - Update a book
- `DELETE /books/:id` - Delete a book

### Bookshelves (Public)

- `GET /bookshelves` - Get all bookshelves
- `GET /bookshelves/:id` - Get a bookshelf by ID
- `GET /bookshelves/:id/books` - Get books in a bookshelf
// Note: POST, PUT, DELETE for bookshelves might be admin-only in practice, clarify if needed.
- `POST /bookshelves` - Create a new bookshelf
- `PUT /bookshelves/:id` - Update a bookshelf
- `DELETE /bookshelves/:id` - Delete a bookshelf
- `POST /bookshelves/:id/books` - Add a book to a bookshelf
- `DELETE /bookshelves/:id/books/:bookId` - Remove a book from a bookshelf

### Projects (Public)

- `GET /projects` - Get all projects
- `GET /projects?tag=react` - Filter projects by tag (example)
- `GET /projects/summary/count` - Get the total count of projects
- `GET /projects/:id` - Get a project by ID
// Note: POST, PUT, DELETE for projects might be admin-only in practice, clarify if needed.
- `POST /projects` - Create a new project
- `PUT /projects/:id` - Update a project
- `DELETE /projects/:id` - Delete a project

### Work Entries (Public)

- `GET /work` - Get all work entries
- `GET /work/summary/count` - Get the total count of work entries
- `GET /work/:id` - Get a work entry by ID
// Note: POST, PUT, DELETE for work entries might be admin-only in practice, clarify if needed.
- `POST /work` - Create a new work entry
- `PUT /work/:id` - Update a work entry
- `DELETE /work/:id` - Delete a work entry

### Admin (Requires Authentication)

These endpoints require a valid JWT token obtained via `/api/auth/login`.

**Admin Projects:**
- `GET /admin/projects` - Get all projects (admin view)
- `POST /admin/projects` - Create a new project
- `GET /admin/projects/:id` - Get a specific project by ID (admin view)
- `PUT /admin/projects/:id` - Update a specific project
- `DELETE /admin/projects/:id` - Delete a specific project

**Admin Work Entries:**
- `GET /admin/work` - Get all work entries (admin view)
- `POST /admin/work` - Create a new work entry
- `GET /admin/work/:id` - Get a specific work entry by ID (admin view)
- `PUT /admin/work/:id` - Update a specific work entry
- `DELETE /admin/work/:id` - Delete a specific work entry