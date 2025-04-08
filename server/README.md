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

### Books

- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get a book by ID
- `POST /api/books` - Create a new book
- `PUT /api/books/:id` - Update a book
- `DELETE /api/books/:id` - Delete a book

### Bookshelves

- `GET /api/bookshelves` - Get all bookshelves
- `GET /api/bookshelves/:id` - Get a bookshelf by ID
- `GET /api/bookshelves/:id/books` - Get books in a bookshelf
- `POST /api/bookshelves` - Create a new bookshelf
- `PUT /api/bookshelves/:id` - Update a bookshelf
- `DELETE /api/bookshelves/:id` - Delete a bookshelf
- `POST /api/bookshelves/:id/books` - Add a book to a bookshelf
- `DELETE /api/bookshelves/:id/books/:bookId` - Remove a book from a bookshelf

### Projects

- `GET /api/projects` - Get all projects
- `GET /api/projects?tag=react` - Filter projects by tag
- `GET /api/projects/:id` - Get a project by ID
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Gigs (Professional Experience)

- `GET /api/gigs` - Get all gigs
- `GET /api/gigs/:id` - Get a gig by ID
- `POST /api/gigs` - Create a new gig
- `PUT /api/gigs/:id` - Update a gig
- `DELETE /api/gigs/:id` - Delete a gig

### Blog Posts

- `GET /api/posts` - Get all posts
- `GET /api/posts?tag=react` - Filter posts by tag
- `GET /api/posts?q=search` - Search posts
- `GET /api/posts/:id` - Get a post by ID
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post