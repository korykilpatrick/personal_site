# Personal Portfolio Website

A modern, responsive personal portfolio website built with React, TypeScript, and Tailwind CSS, showcasing software projects, professional experience, and a digital bookshelf.

## Features

- **Project Portfolio** - Display software projects with detailed descriptions, tags, links, and media
- **Work Experience** - Showcase professional work history with company details and achievements
- **Digital Bookshelf** - Present books you've read with sorting and filtering capabilities
- **Library** - Curated collection of articles, videos, tools, and resources
- **Smart Link Extraction** - AI-powered metadata extraction from URLs for quick library additions
- **Responsive Design** - Fully responsive layout that works on all device sizes
- **Admin Dashboard** - Secure admin area to manage content (projects, work entries, books, library)
- **Authentication** - JWT-based authentication for admin functionality

## Tech Stack

### Frontend
- **React 18** - Component-based UI library
- **TypeScript** - Static typing for safer code
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client for API requests

### Backend
- **Node.js** with **Express** - Server framework
- **TypeScript** - Type safety on the server
- **PostgreSQL** - Relational database
- **Knex.js** - SQL query builder and migrations
- **JWT** - Authentication and authorization
- **Winston** - Structured logging
- **OpenAI API** - AI-powered content extraction
- **Redis** (optional) - Caching layer

### DevOps
- **Webpack** - Module bundling
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework

## Project Structure

```
/
├── docs/                # Project documentation
├── public/              # Static assets
├── server/              # Backend API
│   ├── src/
│   │   ├── config/      # Configuration
│   │   ├── controllers/ # Request handlers
│   │   ├── db/          # Database migrations & connections
│   │   ├── middleware/  # Express middleware
│   │   ├── models/      # Data models
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── utils/       # Utility functions
│   │   └── index.ts     # Entry point
├── frontend/            # Frontend application
│   ├── src/             
│   │   ├── api/         # API client services
│   │   ├── components/  # React components
│   │   ├── context/     # React context providers
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Page components
│   │   ├── styles/      # Global styles
│   │   ├── utils/       # Utility functions
│   │   ├── App.tsx      # Main app component
│   │   └── index.tsx    # Entry point
├── types/               # Shared TypeScript types
```

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- PostgreSQL (v12 or newer)

### Frontend Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/personal_site.git
   cd personal_site
   ```

2. Install dependencies
   ```
   npm run install:all # Installs for both frontend and server
   ```

3. Create a `.env` file from the example in both the root and server directories
   ```
   cp .env.example .env
   cd server
   cp .env.example .env
   cd .. 
   ```

4. Start the development server
   ```
   npm run dev:all # Starts both frontend and backend
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Backend Setup

1. Navigate to the server directory
   ```
   cd server
   ```

2. Install dependencies (if not done with `install:all`)
   ```
   npm install
   ```

3. Create a `.env` file from the example (if not done already)
   ```
   cp .env.example .env
   ```

4. Set up the database
   ```
   npm run db:create
   npm run migrate
   npm run seed
   ```

5. Create an admin user
   ```
   npm run hash:password -- admin yourpassword
   ```

6. Start the development server
   ```
   npm run dev
   ```

The API server will be available at [http://localhost:3001/api](http://localhost:3001/api)

## Available Scripts

### Frontend Scripts (Run from root directory)

- `npm run dev` - Start the frontend development server
- `npm run build` - Build frontend for production
- `npm run lint` - Lint the frontend codebase
- `npm run format` - Format frontend code with Prettier
- `npm run test` - Run frontend tests

### Backend Scripts (Run from server directory)

- `npm run dev` - Start the backend development server
- `npm run build` - Build for production
- `npm run start` - Start the production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed the database with initial data
- `npm run db:create` - Create the database
- `npm run db:reset` - Reset the database (drop and recreate)

### Root Scripts

- `npm run dev:all` - Start both frontend and backend servers
- `npm run install:all` - Install dependencies for both frontend and backend
- `npm run build:all` - Build both frontend and backend for production

## Environment Configuration

### Frontend (.env)

```
REACT_APP_API_BASE_URL=/api
```

### Backend (.env)

```
NODE_ENV=development
PORT=3001
API_PREFIX=/api
DB_HOST=localhost
DB_PORT=5432
DB_NAME=personal_site
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_SSL=false
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1h
```

## Admin Dashboard

Access the admin dashboard at `/admin` after starting the application. Use the credentials you created with the `hash:password` script to log in.

The admin dashboard allows you to:
- Manage projects
- Update work experience
- Curate your bookshelf

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [React Icons](https://react-icons.github.io/react-icons/)