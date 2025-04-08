# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Build: `npm run build`
- Start dev server: `npm run dev`
- Lint: `npm run lint`
- Format: `npm run format`
- Test: `npm run test`
- Test single file: `npm run test -- path/to/test`

## Tech Stack & Guidelines
- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: PostgreSQL
- Styling: Tailwind CSS

## Code Style
- Use TypeScript for type safety
- Follow React functional component patterns with hooks
- Import order: React, external libraries, internal components, styles
- Use descriptive variable/function names
- Use async/await for asynchronous operations
- Implement proper error handling with try/catch blocks
- Use Axios for API requests
- Format dates consistently using a helper utility
- Modularize components for reusability
- Document complex logic with comments