import type { ExtractedContent } from 'types/index';

class ExtractionCacheManager {
  private cache = new Map<string, Promise<ExtractedContent>>();
  private cacheTimestamps = new Map<string, number>();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly CLEANUP_INTERVAL = 60 * 1000; // 1 minute

  constructor() {
    this.startCleanup();
  }

  private startCleanup() {
    if (this.cleanupInterval) return;
    
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      this.cache.forEach((_, key) => {
        const timestamp = this.cacheTimestamps.get(key);
        if (timestamp && now - timestamp > this.CACHE_TTL) {
          this.cache.delete(key);
          this.cacheTimestamps.delete(key);
        }
      });
    }, this.CLEANUP_INTERVAL);
  }

  get(url: string): Promise<ExtractedContent> | undefined {
    const now = Date.now();
    const timestamp = this.cacheTimestamps.get(url);
    
    if (timestamp && now - timestamp > this.CACHE_TTL) {
      this.cache.delete(url);
      this.cacheTimestamps.delete(url);
      return undefined;
    }
    
    return this.cache.get(url);
  }

  set(url: string, promise: Promise<ExtractedContent>) {
    this.cache.set(url, promise);
    this.cacheTimestamps.set(url, Date.now());
  }

  delete(url: string) {
    this.cache.delete(url);
    this.cacheTimestamps.delete(url);
  }

  clear() {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Singleton instance
export const extractionCache = new ExtractionCacheManager();