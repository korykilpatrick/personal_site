# Code Improvement Implementation Plan

## Overview
This plan addresses three critical areas identified in the code quality audit:
1. Code Duplication (~1,500 lines can be eliminated)
2. Performance Optimizations (React rendering, database queries, API responses)
3. Type Safety Gaps (39 uses of 'any', missing return types)

## Phase 1: Code Duplication Elimination (Week 1)

### 1.1 Create Generic CRUD Controller (Day 1-2)
**Files to create:**
- `server/src/controllers/base/CRUDController.ts`

**Implementation:**
```typescript
export class CRUDController<T extends BaseModel> {
  constructor(
    protected model: typeof BaseModel,
    protected resourceName: string
  ) {}

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info(`Admin fetching all ${this.resourceName}`, { 
        user: req.user?.username 
      });
      const items = await this.model.getAll();
      res.status(StatusCodes.OK).json(items);
    } catch (error) {
      logger.error(`Error fetching ${this.resourceName}:`, { error });
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const item = await this.model.getById(id);
      if (!item) {
        return res.status(StatusCodes.NOT_FOUND).json({ 
          message: `${this.resourceName} not found` 
        });
      }
      res.status(StatusCodes.OK).json(item);
    } catch (error) {
      logger.error(`Error fetching ${this.resourceName} by ID:`, { error });
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const created = await this.model.create(req.body);
      res.status(StatusCodes.CREATED).json(created);
    } catch (error) {
      logger.error(`Error creating ${this.resourceName}:`, { error });
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await this.model.update(id, req.body);
      if (!updated) {
        return res.status(StatusCodes.NOT_FOUND).json({ 
          message: `${this.resourceName} not found` 
        });
      }
      res.status(StatusCodes.OK).json(updated);
    } catch (error) {
      logger.error(`Error updating ${this.resourceName}:`, { error });
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deleted = await this.model.delete(id);
      if (!deleted) {
        return res.status(StatusCodes.NOT_FOUND).json({ 
          message: `${this.resourceName} not found` 
        });
      }
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      logger.error(`Error deleting ${this.resourceName}:`, { error });
      next(error);
    }
  };
}
```

**Refactor existing controllers:**
- `libraryItemController.ts` → extends CRUDController
- `projectController.ts` → extends CRUDController
- `quoteController.ts` → extends CRUDController
- `siteNoteController.ts` → extends CRUDController
- `workController.ts` → extends CRUDController

### 1.2 Create Reusable React Hooks (Day 3-4)

**File to create:**
- `frontend/src/hooks/useAdminList.ts`

```typescript
interface UseAdminListOptions<T> {
  endpoint: string;
  entityName: string;
}

export function useAdminList<T extends { id: number }>({ 
  endpoint, 
  entityName 
}: UseAdminListOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<T[]>(endpoint);
      setItems(res.data);
    } catch (err: unknown) {
      const message = err instanceof Error 
        ? err.message 
        : `Failed to fetch ${entityName}`;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, entityName]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm(`Delete this ${entityName}?`)) return;
    
    setIsLoading(true);
    try {
      await api.delete(`${endpoint}/${id}`);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err: unknown) {
      const message = err instanceof Error 
        ? err.message 
        : `Failed to delete ${entityName}`;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, entityName]);

  return {
    items,
    isLoading,
    error,
    refetch: fetchItems,
    handleDelete
  };
}
```

**Refactor components to use hook:**
- `LibraryItemList.tsx`
- `QuoteList.tsx`
- `ProjectList.tsx`
- `SiteNoteList.tsx`
- `WorkList.tsx`

### 1.3 Abstract Service Count Methods (Day 5)

**Update `BaseService.ts`:**
```typescript
export class BaseService<T extends BaseModel> {
  constructor(protected model: typeof BaseModel) {}

  async getTotalCount(): Promise<number> {
    try {
      const result = await this.model.query()
        .count({ count: '*' })
        .first() as { count: string };
      return parseInt(result.count, 10) || 0;
    } catch (error) {
      logger.error(`Error fetching total ${this.model.name} count`, { error });
      throw error;
    }
  }

  async getActiveCount(): Promise<number> {
    try {
      const result = await this.model.query()
        .where({ is_active: true })
        .count({ count: '*' })
        .first() as { count: string };
      return parseInt(result.count, 10) || 0;
    } catch (error) {
      logger.error(`Error fetching active ${this.model.name} count`, { error });
      throw error;
    }
  }
}
```

## Phase 2: Performance Optimizations (Week 2)

### 2.1 React Component Optimizations (Day 1-2)

**Add React.memo to list components:**

```typescript
// LibraryItemCard.tsx
export default React.memo(LibraryItemCard, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id &&
         prevProps.item.updated_at === nextProps.item.updated_at;
});

// BookCard.tsx
export default React.memo(BookCard, (prevProps, nextProps) => {
  return prevProps.book.id === nextProps.book.id &&
         prevProps.book.updated_at === nextProps.book.updated_at;
});

// QuoteCarousel.tsx
export default React.memo(QuoteCarousel);
```

**Optimize event handlers with useCallback:**

```typescript
// LibraryPage.tsx
const onToggleType = useCallback((typeId: number) => {
  setSelectedTypes(prev => 
    prev.includes(typeId) 
      ? prev.filter(id => id !== typeId)
      : [...prev, typeId]
  );
}, []);

const onToggleTag = useCallback((tag: string) => {
  setSelectedTags(prev =>
    prev.includes(tag)
      ? prev.filter(t => t !== tag)
      : [...prev, tag]
  );
}, []);
```

### 2.2 Database Optimizations (Day 3)

**Create migration for indexes:**
```sql
-- migrations/20250629_add_performance_indexes.ts
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('library_items', (table) => {
    table.index('item_type_id');
    table.index('created_at');
    table.index('tags', 'idx_library_items_tags', 'GIN');
  });
}
```

**Add pagination to BaseModel:**
```typescript
// BaseModel.ts
interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

static async getAllPaginated<T extends BaseModel>(
  this: ModelConstructor<T>,
  options: PaginationOptions = {}
): Promise<{ data: T[]; total: number; page: number; totalPages: number }> {
  const { page = 1, limit = 20, orderBy = 'created_at', order = 'desc' } = options;
  
  const [data, countResult] = await Promise.all([
    this.query()
      .orderBy(orderBy, order)
      .offset((page - 1) * limit)
      .limit(limit),
    this.query().count({ count: '*' }).first()
  ]);
  
  const total = parseInt((countResult as any).count, 10);
  const totalPages = Math.ceil(total / limit);
  
  return { data, total, page, totalPages };
}
```

### 2.3 API Response Caching (Day 4-5)

**Create caching middleware:**
```typescript
// middleware/cache.ts
import { redis } from '../config/redis';

export function cacheMiddleware(ttl: number = 300) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!redis.isConnected() || req.method !== 'GET') {
      return next();
    }
    
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (error) {
      logger.warn('Cache read error', { error });
    }
    
    // Store original json method
    const originalJson = res.json;
    res.json = function(data) {
      // Cache the response
      redis.setex(key, ttl, JSON.stringify(data)).catch(err => 
        logger.warn('Cache write error', { err })
      );
      return originalJson.call(this, data);
    };
    
    next();
  };
}
```

**Add bundle optimization:**
```typescript
// Tooltip.tsx
import { Root, Trigger, Content, Arrow, Provider } from '@radix-ui/react-tooltip';
```

## Phase 3: Type Safety Improvements (Week 3)

### 3.1 Replace 'any' Types (Day 1-2)

**Create type definitions:**
```typescript
// types/database.ts
export interface DatabaseCountResult {
  count: string;
}

export interface DatabaseError extends Error {
  code?: string;
  constraint?: string;
}

// types/api.ts
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
```

**Update error handling:**
```typescript
// Replace all catch (error: any) with:
catch (error: unknown) {
  const err = error as DatabaseError;
  logger.error('Operation failed', { 
    error: err.message,
    code: err.code 
  });
}
```

### 3.2 Add Missing Return Types (Day 3)

**Script files:**
```typescript
// hash-password.ts
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

async function upsertUserPassword(): Promise<void> {
  // implementation
}

// create-db.ts
async function createDatabase(): Promise<void> {
  // implementation
}
```

### 3.3 Strict TypeScript Configuration (Day 4-5)

**Update tsconfig.json:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Implementation Timeline

### Week 1: Code Duplication
- Days 1-2: Generic CRUD Controller
- Days 3-4: Reusable React Hooks
- Day 5: Abstract Service Methods

### Week 2: Performance
- Days 1-2: React Optimizations
- Day 3: Database Indexes & Pagination
- Days 4-5: API Caching & Bundle Optimization

### Week 3: Type Safety
- Days 1-2: Replace 'any' types
- Day 3: Add missing return types
- Days 4-5: Strict TypeScript & cleanup

## Success Metrics

1. **Code Reduction**: ~1,500 lines removed
2. **Performance**: 
   - 50% reduction in unnecessary re-renders
   - <100ms API response time with caching
   - <3s initial page load
3. **Type Safety**: 
   - 0 uses of 'any' type
   - 100% of functions have explicit return types
   - No TypeScript errors with strict mode

## Testing Requirements

Each phase should include:
1. Unit tests for new abstractions
2. Integration tests for refactored endpoints
3. Performance benchmarks before/after
4. Type checking in CI pipeline

## Rollback Plan

1. Each refactor in separate PR
2. Feature flags for new implementations
3. Gradual rollout with monitoring
4. Keep old code until new code proven stable