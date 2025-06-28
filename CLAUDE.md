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
- AI Integration: OpenAI API for metadata extraction

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

## Smart Link Metadata Extraction
The application includes an AI-powered metadata extraction feature for library items:

### Backend
- **Endpoint**: `POST /api/library/extract-metadata`
- **Service**: `ContentExtractionService` uses OpenAI to extract metadata from URLs
- **Caching**: Redis caching with 1-hour TTL (optional, graceful fallback)
- **Rate Limiting**: 10 requests per 15 minutes per IP (admin bypass)
- **Environment Variables**:
  - `OPENAI_API_KEY` - Required for extraction
  - `REDIS_*` - Optional Redis configuration

### Frontend
- **Hook**: `useContentExtraction` - Manual extraction with error handling
- **Hook**: `useContentExtractionWithDebounce` - Auto-extraction with debouncing
- **Component**: `SmartLinkInput` - URL input with automatic extraction
- **Features**:
  - Visual loading indicators
  - Success/error feedback
  - Auto-populate form fields
  - Field indicators for auto-filled data
  - Toast notifications

### Key Patterns
- Request deduplication with in-memory caching
- Proper cleanup with AbortController
- Categorized error handling
- Accessibility with ARIA attributes
- Consistent use of existing UI components