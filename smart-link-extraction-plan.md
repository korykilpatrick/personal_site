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

### Phase 2: Backend Implementation
1. **Implement extraction logic**
   - [ ] Create prompt templates with versioning
   - [ ] Implement URL validation and sanitization
   - [ ] Add extraction method with OpenAI function calling
   - [ ] Map OpenAI responses to our domain types

2. **Add caching layer**
   - [ ] Implement Redis caching service
   - [ ] Add cache key generation with URL normalization
   - [ ] Configure TTL based on content type

3. **Create API endpoint**
   - [ ] Add `POST /api/library/extract-metadata` route
   - [ ] Implement request validation with express-validator
   - [ ] Add rate limiting middleware
   - [ ] Return properly typed responses

4. **Error handling**
   - [ ] Create custom error classes hierarchy
   - [ ] Add proper error logging
   - [ ] Implement graceful degradation

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
│   └── library.controller.ts    # Add extraction endpoint
├── middleware/
│   └── rateLimiting.ts         # Update with new limits
└── routes/
    └── library.routes.ts       # Add new route

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
- `openai`: ^4.0.0 (OpenAI API client)
- `zod`: ^3.22.0 (Runtime type validation)
- `redis`: ^4.6.0 (Caching)
- `ioredis`: ^5.3.0 (Alternative Redis client)

## Environment Variables
```
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-4-turbo-preview
REDIS_URL=redis://localhost:6379
EXTRACTION_CACHE_TTL=3600
EXTRACTION_RATE_LIMIT=10
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