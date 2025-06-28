# Smart Link Metadata Extraction Feature

## Overview

The Smart Link Metadata Extraction feature automatically extracts metadata from URLs when adding items to the library. This reduces the time to add library items from ~2 minutes to ~10 seconds by eliminating manual data entry.

## How It Works

1. User pastes or types a URL into the library form
2. After a 1-second debounce (immediate on paste), the system sends the URL to the backend
3. Backend uses OpenAI to visit the webpage and extract relevant metadata
4. Extracted data auto-populates the form fields
5. User can review and modify the data before saving

## Architecture

### Frontend Components

#### SmartLinkInput Component
- Intelligent URL input with auto-extraction
- Visual feedback: loading spinner, success checkmark, error messages
- Accessibility: ARIA attributes for screen readers
- Debounced extraction to avoid excessive API calls

#### React Hooks
- `useContentExtraction`: Core hook for manual extraction
- `useContentExtractionWithDebounce`: Automatic extraction with debouncing
- Features: request cancellation, error handling, caching

#### UI Enhancements
- Toast notifications for success/error feedback
- Auto-filled field indicators
- Loading states during extraction

### Backend Services

#### Content Extraction Service
- Uses OpenAI GPT-4 for intelligent metadata extraction
- Extracts: title, author, description, image, tags, content type
- Validates and sanitizes extracted data
- Returns confidence scores

#### API Endpoint
- Route: `POST /api/library/extract-metadata`
- Rate limited: 10 requests per 15 minutes
- Admin users bypass rate limits
- Comprehensive error handling

#### Caching Layer
- Redis caching (optional) with 1-hour TTL
- Frontend request deduplication
- Reduces API costs and improves performance

## Security Features

- URL validation (http/https only)
- SSRF protection via OpenAI (no direct web access)
- Input sanitization
- Rate limiting per IP address
- JWT authentication for admin features

## Error Handling

Categorized errors with user-friendly messages:
- Network errors: "Check your internet connection"
- Invalid URL: "URL is invalid or unsupported"
- Rate limiting: "Too many requests, please wait"
- Extraction failures: "Unable to extract, fill manually"
- Server errors: "Server error, please try again"

## Performance Optimizations

- Request deduplication prevents duplicate API calls
- In-memory caching on frontend (5-minute TTL)
- Redis caching on backend (1-hour TTL)
- Proper cleanup to prevent memory leaks
- AbortController for request cancellation

## User Experience

- Instant feedback with loading indicators
- Clear error messages with recovery options
- Manual override for all extracted fields
- Field indicators show auto-filled data
- Seamless integration with existing form

## Configuration

### Environment Variables

```bash
# Required
OPENAI_API_KEY=your-api-key

# Optional (Redis)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Configuration
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_TEMPERATURE=0.3
OPENAI_MAX_TOKENS=1000
EXTRACTION_CACHE_TTL=3600
EXTRACTION_RATE_LIMIT=10
```

### Supported Content Types

The system can extract metadata from:
- Articles and blog posts
- Academic papers
- Videos (YouTube, Vimeo, etc.)
- Books and publications
- Tools and software
- General web pages

## Usage Example

1. Navigate to Admin > Library Items > Create
2. Paste a URL into the Link field
3. Wait for the extraction (spinner appears)
4. Review auto-populated fields:
   - Title
   - Description (Blurb)
   - Thumbnail URL
   - Tags
   - Creators/Authors
   - Item Type (auto-matched)
5. Make any necessary adjustments
6. Save the library item

## Technical Implementation

### Type Safety
- Full TypeScript coverage
- Shared types between frontend and backend
- Runtime validation with express-validator

### Testing Considerations
- Mock OpenAI responses for unit tests
- Test error scenarios and edge cases
- Verify rate limiting behavior
- Check cache functionality

### Monitoring
- Track extraction success/failure rates
- Monitor API usage and costs
- Log extraction latency
- Alert on high error rates

## Future Enhancements

- Batch URL processing
- More granular content type detection
- Language detection and translation
- Duplicate content detection
- Browser extension for one-click saving
- Webhook support for automated imports