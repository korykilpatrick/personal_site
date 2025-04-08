# Personal Portfolio Website

A modern, responsive personal portfolio website built with React, TypeScript, and Tailwind CSS. This site showcases software engineering projects, blog posts, and includes an integrated bookshelf feature.

## Features

- Responsive design that works on all devices
- Project portfolio with filtering and detailed project information
- Blog with tagging and search functionality
- Interactive professional timeline
- Bookshelf integrated with Goodreads data
- Clean, modern UI with Tailwind CSS

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Other tools**: Webpack, ESLint, Prettier, Jest

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/personal_site.git
   cd personal_site
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the app for production
- `npm run lint` - Lints the codebase
- `npm run format` - Formats code with Prettier
- `npm test` - Runs the test suite
- `npm run typecheck` - Runs TypeScript type checking

## Project Structure

```
/
├── public/           # Static files
├── src/
│   ├── api/          # API service functions
│   ├── components/   # Reusable UI components
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Page components
│   ├── styles/       # Global styles
│   ├── utils/        # Utility functions
│   ├── App.tsx       # Main app component
│   └── index.tsx     # Application entry point
├── docs/             # Documentation
└── package.json      # Project dependencies and scripts
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.