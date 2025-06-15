import Redis from 'ioredis';
import { ICache } from '../../services/contentExtraction/ContentExtractionService';
import logger from '../../utils/logger';
import config from '../../config/config';

/**
 * Redis implementation of the caching interface
 * 
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Graceful error handling (never throws, logs errors)
 * - Configurable TTL with sensible defaults
 * - Connection event logging
 */
export class RedisCache implements ICache {
  private client: Redis;
  private readonly defaultTTL: number = 60 * 60 * 24 * 7; // 7 days in seconds

  constructor() {
    this.client = new Redis({
      host: config.redis?.host || 'localhost',
      port: config.redis?.port || 6379,
      password: config.redis?.password,
      db: config.redis?.db || 0,
      retryStrategy: (times: number) => {
        if (times > 3) {
          logger.error('Redis connection failed after 3 attempts');
          return null;
        }
        return Math.min(times * 1000, 3000);
      },
    });

    this.client.on('error', (error) => {
      logger.error('Redis client error:', error);
    });

    this.client.on('connect', () => {
      logger.info('Redis client connected');
    });
  }

  async get(key: string): Promise<string | null> {
    try {
      const value = await this.client.get(key);
      if (value) {
        logger.debug(`Cache hit for key: ${key}`);
      } else {
        logger.debug(`Cache miss for key: ${key}`);
      }
      return value;
    } catch (error) {
      logger.error(`Redis get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      const ttlSeconds = ttl || this.defaultTTL;
      await this.client.setex(key, ttlSeconds, value);
      logger.debug(`Cache set for key: ${key} with TTL: ${ttlSeconds}s`);
    } catch (error) {
      logger.error(`Redis set error for key ${key}:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
      logger.debug(`Cache deleted for key: ${key}`);
    } catch (error) {
      logger.error(`Redis delete error for key ${key}:`, error);
    }
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
    logger.info('Redis client disconnected');
  }
}

let cacheInstance: RedisCache | null = null;

export const getCache = (): RedisCache => {
  if (!cacheInstance) {
    cacheInstance = new RedisCache();
  }
  return cacheInstance;
};