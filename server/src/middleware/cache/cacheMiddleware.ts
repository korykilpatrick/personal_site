import { Request, Response, NextFunction } from 'express';
import { getCache } from '../../services/cache/RedisCache';
import config from '../../config/config';
import logger from '../../utils/logger';

/**
 * Cache middleware for GET requests
 * Caches successful JSON responses with configurable TTL
 * 
 * @param ttl Time to live in seconds (default: 300 = 5 minutes)
 * @param keyPrefix Optional prefix for cache keys
 */
export function cacheMiddleware(ttl: number = 300, keyPrefix: string = 'api') {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip if:
    // - Redis is not configured
    // - Not a GET request
    // - Cache control header says no-cache
    if (!config.redis || req.method !== 'GET' || req.headers['cache-control'] === 'no-cache') {
      return next();
    }

    const cache = getCache();
    if (!cache || !cache.isConnected()) {
      return next();
    }

    // Generate cache key from URL and query params
    const cacheKey = `${keyPrefix}:${req.originalUrl || req.url}`;

    try {
      // Try to get cached response
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        logger.debug('Cache hit', { cacheKey });
        
        // Parse and send cached response
        const parsedData = JSON.parse(cachedData);
        
        // Set cache headers
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-TTL', ttl.toString());
        
        return res.json(parsedData);
      }
    } catch (error) {
      // Log but don't fail on cache read errors
      logger.warn('Cache read error', { error, cacheKey });
    }

    // Cache miss - store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache successful responses
    res.json = function(data: any) {
      // Only cache successful responses (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Set cache headers
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-TTL', ttl.toString());

        // Async cache write (don't block response)
        cache.set(cacheKey, JSON.stringify(data), ttl).catch((error: any) => {
          logger.warn('Cache write error', { error, cacheKey });
        });
      }

      // Call original json method
      return originalJson(data);
    };

    next();
  };
}

/**
 * Clear cache entries matching a pattern
 * Useful for invalidating cache after mutations
 * 
 * @param pattern Redis pattern (e.g., 'api:/admin/quotes*')
 */
export async function clearCache(pattern: string): Promise<void> {
  if (!config.redis) {
    return;
  }

  const cache = getCache();
  if (!cache || !cache.isConnected()) {
    return;
  }

  try {
    await cache.clear(pattern);
    logger.info('Cache cleared', { pattern });
  } catch (error) {
    logger.error('Error clearing cache', { error, pattern });
  }
}

/**
 * Middleware to clear cache after successful mutations
 * Use this on POST, PUT, PATCH, DELETE endpoints
 * 
 * @param patterns Array of cache key patterns to clear
 */
export function clearCacheMiddleware(patterns: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original json and send methods
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    const clearPatternsIfSuccessful = async () => {
      // Only clear cache on successful mutations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        for (const pattern of patterns) {
          await clearCache(pattern);
        }
      }
    };

    // Override json method
    res.json = function(data: any) {
      clearPatternsIfSuccessful().catch((error: any) => {
        logger.warn('Error clearing cache after json response', { error });
      });
      return originalJson(data);
    };

    // Override send method
    res.send = function(data: any) {
      clearPatternsIfSuccessful().catch((error: any) => {
        logger.warn('Error clearing cache after send response', { error });
      });
      return originalSend(data);
    };

    next();
  };
}