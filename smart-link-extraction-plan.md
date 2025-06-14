# Smart Link Metadata Extraction Feature Plan

## Overview
Implement an intelligent system that automatically extracts and populates metadata when a URL is pasted into the library form. This feature will use OpenAI's API to visit the webpage and extract relevant information, eliminating manual data entry.

## Goals
- Reduce time to add library items from ~2 minutes to ~10 seconds
- Maintain code quality consistent with the rest of the codebase
- Create a robust, type-safe implementation
- Ensure the feature is well-tested and observable

## Technical Approach
- Use OpenAI's function calling to handle web browsing and extraction
- Implement strong TypeScript types throughout
- Add comprehensive error handling and validation
- Cache results to minimize API costs
- Progressive enhancement in the UI

## Implementation Phases

### Phase 1: Core Infrastructure Setup
1. **Create shared types**
   - [x] Define `ExtractedContent` interface in `/types/contentExtraction.ts`
   - [x] Define request/response types
   - [x] Define error types and codes

2. **Set up OpenAI integration**
   - [x] Create `backend/src/services/llm/OpenAIService.ts`
   - [x] Implement secure API key management
   - [x] Add configuration for model settings

3. **Create extraction service architecture**
   - [x] Create `backend/src/services/contentExtraction/` directory structure
   - [x] Implement `ContentExtractionService.ts` with dependency injection
   - [x] Add Zod schemas for runtime validation

### Phase 2: Backend Implementation ✅ COMPLETED
1. **Implement extraction logic**
   - [x] Create prompt templates with versioning
   - [x] Implement URL validation and sanitization
   - [x] Add extraction method with OpenAI function calling
   - [x] Map OpenAI responses to our domain types

2. **Add caching layer**
   - [x] Implement Redis caching service
   - [x] Add cache key generation with URL normalization
   - [x] Configure TTL based on content type

3. **Create API endpoint**
   - [x] Add `POST /api/library/extract-metadata` route
   - [x] Implement request validation with express-validator
   - [x] Add rate limiting middleware
   - [x] Return properly typed responses

4. **Error handling**
   - [x] Create custom error classes hierarchy (using existing ApiError)
   - [x] Add proper error logging
   - [x] Implement graceful degradation

## Phase 2 Completion Summary

Phase 2 has been successfully completed with the following implementations:

1. **API Endpoint**: `POST /api/library/extract-metadata`
   - Accepts `url` (required) and `forceRefresh` (optional) parameters
   - Returns extracted metadata in standardized format
   - Proper validation and error responses

2. **Redis Caching**:
   - Optional Redis integration (graceful fallback if not configured)
   - Configurable TTL (default 1 hour)
   - URL normalization for consistent cache keys

3. **Rate Limiting**:
   - 10 requests per 15-minute window per IP
   - Admin users bypass rate limiting
   - Clear error messages with retry information

4. **Architecture**:
   - Clean separation of concerns
   - Dependency injection for testability
   - Follows existing codebase patterns
   - TypeScript type safety throughout

5. **Security**:
   - URL validation with express-validator
   - SSRF protection via OpenAI (no direct web access)
   - Proper error handling without exposing internals

### Phase 3: Frontend Integration
1. **Create React hook**
   - [ ] Implement `useContentExtraction` hook
   - [ ] Handle loading, error, and success states
   - [ ] Add request debouncing

2. **Update library form**
   - [ ] Create `SmartLinkInput` component
   - [ ] Add URL paste detection
   - [ ] Show loading state during extraction
   - [ ] Auto-populate form fields on success
   - [ ] Allow manual override of extracted data

3. **Add UI feedback**
   - [ ] Success toast on extraction
   - [ ] Error messages for failures
   - [ ] Field indicators for auto-filled vs manual data

### Phase 4: Testing & Quality Assurance
1. **Unit tests**
   - [ ] Test extraction service with mocked OpenAI
   - [ ] Test URL validation edge cases
   - [ ] Test error scenarios
   - [ ] Test caching behavior

2. **Integration tests**
   - [ ] Test full extraction flow
   - [ ] Test API endpoint with various URLs
   - [ ] Test rate limiting

3. **Frontend tests**
   - [ ] Test hook behavior
   - [ ] Test form auto-population
   - [ ] Test error states

### Phase 5: Observability & Monitoring
1. **Logging**
   - [ ] Add structured logging for extraction requests
   - [ ] Log OpenAI API usage
   - [ ] Track extraction success/failure rates

2. **Metrics**
   - [ ] Add extraction latency tracking
   - [ ] Monitor cache hit rates
   - [ ] Track API costs

3. **Documentation**
   - [ ] Update API documentation
   - [ ] Add inline code documentation
   - [ ] Update CLAUDE.md with new commands

### Phase 6: Performance & Optimization
1. **Performance improvements**
   - [ ] Implement request queuing
   - [ ] Add circuit breaker for OpenAI failures
   - [ ] Optimize prompt for faster responses

2. **Cost optimization**
   - [ ] Monitor and alert on API usage
   - [ ] Implement smart caching strategies
   - [ ] Add option to disable for specific domains

## File Structure
```
types/
└── contentExtraction.ts         # Shared types

backend/src/
├── services/
│   ├── contentExtraction/
│   │   ├── index.ts
│   │   ├── ContentExtractionService.ts
│   │   ├── schemas/
│   │   │   └── extraction.schema.ts
│   │   ├── prompts/
│   │   │   └── extractionPrompt.ts
│   │   └── __tests__/
│   │       └── ContentExtractionService.test.ts
│   ├── llm/
│   │   ├── OpenAIService.ts
│   │   └── __tests__/
│   └── cache/
│       └── RedisCache.ts
├── controllers/
│   ├── library.controller.ts    # Existing controller
│   └── libraryExtraction.controller.ts  # ✅ New extraction controller
├── middleware/
│   ├── rateLimiting.ts         # Existing rate limiting
│   └── extractionRateLimit.ts  # ✅ New extraction-specific rate limiter
└── routes/
    ├── library.routes.ts       # Existing routes
    └── library_extraction.routes.ts  # ✅ New extraction route

frontend/src/
├── hooks/
│   ├── useContentExtraction.ts
│   └── __tests__/
├── components/
│   └── forms/
│       ├── SmartLinkInput.tsx
│       └── __tests__/
└── services/
    └── api/
        └── library.ts          # Add extraction API call
```

## Dependencies to Add
- `openai`: ^4.0.0 (OpenAI API client) ✅
- `zod`: ^3.22.0 (Runtime type validation) ✅
- `redis`: ^4.6.0 (Caching)
- `ioredis`: ^5.3.0 (Alternative Redis client) ✅

## Environment Variables
```
OPENAI_API_KEY=your-api-key              ✅
OPENAI_MODEL=gpt-4-turbo-preview         ✅
OPENAI_TEMPERATURE=0.3                   ✅
OPENAI_MAX_TOKENS=1000                   ✅
REDIS_HOST=localhost                     ✅
REDIS_PORT=6379                          ✅
REDIS_PASSWORD=                          ✅
REDIS_DB=0                               ✅
EXTRACTION_CACHE_TTL=3600                ✅
EXTRACTION_RATE_LIMIT=10                 ✅
```

## Success Criteria
- [ ] URL paste triggers automatic extraction
- [ ] Form fields auto-populate within 5 seconds
- [ ] 90%+ success rate for common websites
- [ ] Proper error handling for all failure modes
- [ ] No regression in existing functionality
- [ ] Test coverage > 80% for new code
- [ ] API costs < $10/month for typical usage

## Security Considerations
- Validate and sanitize all URLs
- Implement SSRF protection
- Rate limit per user, not just per IP
- Don't store sensitive extracted content
- Sanitize LLM responses before display

## Future Enhancements
- Support for batch URL processing
- Browser extension for one-click saving
- Duplicate detection
- Content summarization
- Automatic categorization improvements