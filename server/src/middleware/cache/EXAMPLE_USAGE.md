# Cache Middleware Usage Examples

## Basic Usage

### 1. Caching GET Endpoints

```typescript
import express from 'express';
import { cacheMiddleware, clearCacheMiddleware } from '../middleware/cache';
import QuoteController from '../controllers/quote.controller';

const router = express.Router();

// Cache quotes for 5 minutes (300 seconds)
router.get(
  '/',
  cacheMiddleware(300, 'quotes'),
  QuoteController.getAll
);

// Cache quote counts for 10 minutes
router.get(
  '/summary/count',
  cacheMiddleware(600, 'quotes:count'),
  QuoteController.getCounts
);
```

### 2. Clearing Cache on Mutations

```typescript
// Clear cache when quotes are modified
router.post(
  '/',
  authenticate,
  validate,
  clearCacheMiddleware(['quotes:*', 'quotes:count:*']),
  QuoteController.create
);

router.put(
  '/:id',
  authenticate,
  validate,
  clearCacheMiddleware(['quotes:*', 'quotes:count:*']),
  QuoteController.update
);

router.delete(
  '/:id',
  authenticate,
  clearCacheMiddleware(['quotes:*', 'quotes:count:*']),
  QuoteController.delete
);
```

## Advanced Usage

### 1. Different TTL for Different Endpoints

```typescript
// Cache library items for 5 minutes
router.get('/library-items', cacheMiddleware(300), controller.getAll);

// Cache individual items for 30 minutes
router.get('/library-items/:id', cacheMiddleware(1800), controller.getById);

// Cache rarely changing data for 1 hour
router.get('/library-item-types', cacheMiddleware(3600), controller.getTypes);
```

### 2. Conditional Caching

```typescript
// Only cache public endpoints, not admin
const publicRouter = express.Router();
const adminRouter = express.Router();

// Public endpoints with caching
publicRouter.get('/quotes', cacheMiddleware(300), QuoteController.getAll);
publicRouter.get('/projects', cacheMiddleware(600), ProjectController.getAll);

// Admin endpoints without caching (always fresh data)
adminRouter.get('/quotes', authenticate, QuoteController.getAll);
adminRouter.get('/projects', authenticate, ProjectController.getAll);
```

### 3. Manual Cache Invalidation

```typescript
import { clearCache } from '../middleware/cache';

// In a controller or service
async function updateQuote(id: number, data: any) {
  const result = await QuoteService.update(id, data);
  
  // Manually clear specific cache entries
  await clearCache('quotes:*');
  await clearCache(`quote:${id}`);
  
  return result;
}
```

## Cache Key Patterns

The middleware generates cache keys based on the URL and query parameters:

- `/api/quotes` → `api:/api/quotes`
- `/api/quotes?active=true` → `api:/api/quotes?active=true`
- `/api/quotes/123` → `api:/api/quotes/123`

With custom prefix:
- `cacheMiddleware(300, 'quotes')` + `/api/quotes` → `quotes:/api/quotes`

## Performance Tips

1. **Cache Duration**: 
   - Frequently changing data: 1-5 minutes
   - Semi-static data: 10-30 minutes
   - Static data: 1+ hours

2. **Cache Invalidation**:
   - Use wildcard patterns to clear related caches
   - Clear cache after successful mutations only
   - Consider using more specific patterns for better performance

3. **Monitoring**:
   - Check `X-Cache` header (HIT/MISS) to monitor cache effectiveness
   - Log cache hit rates for optimization

## Environment Setup

To enable caching, add Redis configuration to your `.env`:

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

Without these variables, the middleware will pass through without caching (graceful fallback).