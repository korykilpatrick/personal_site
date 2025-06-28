import { useState, useCallback, useEffect, useRef } from 'react';
import { apiService } from '../api/apiService';
import type { ExtractedContent } from 'types/index';
import useDebouncedValue from './useDebouncedValue';
import { isUrl } from '../utils/validation';
import { ExtractionError, categorizeExtractionError } from '../utils/extractionErrors';

// Simple in-memory cache for request deduplication
const extractionCache = new Map<string, Promise<ExtractedContent>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cleanup old cache entries periodically
setInterval(() => {
  const now = Date.now();
  extractionCache.forEach((_, key) => {
    const [, timestamp] = key.split('::');
    if (now - parseInt(timestamp) > CACHE_TTL) {
      extractionCache.delete(key);
    }
  });
}, 60 * 1000); // Clean every minute

interface UseContentExtractionOptions {
  onSuccess?: (data: ExtractedContent) => void;
  onError?: (error: ExtractionError) => void;
  debounceDelay?: number;
}

interface UseContentExtractionReturn {
  extractMetadata: (url: string, forceRefresh?: boolean) => Promise<void>;
  data: ExtractedContent | null;
  loading: boolean;
  error: ExtractionError | null;
  reset: () => void;
}

/**
 * Hook for extracting metadata from URLs using the backend extraction service.
 * Provides loading states, error handling, and callbacks for success/error scenarios.
 * 
 * @param options - Optional callbacks for success and error events
 * @returns Object with extraction function, data, loading state, error, and reset function
 */
export default function useContentExtraction(
  options: UseContentExtractionOptions = {}
): UseContentExtractionReturn {
  const { onSuccess, onError } = options;
  const [data, setData] = useState<ExtractedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ExtractionError | null>(null);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const extractMetadata = useCallback(async (url: string, forceRefresh?: boolean) => {
    // Cancel any in-flight request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      let extractedData: ExtractedContent;
      
      // Check cache unless force refresh is requested
      const cacheKey = `${url}::${Date.now()}`;
      const cachedKey = Array.from(extractionCache.keys()).find(k => k.startsWith(`${url}::`));
      
      if (!forceRefresh && cachedKey) {
        // Use cached promise
        extractedData = await extractionCache.get(cachedKey)!;
      } else {
        // Clear old cache entry if exists
        if (cachedKey) {
          extractionCache.delete(cachedKey);
        }
        
        // Create new request and cache the promise
        const promise = apiService.extractMetadata(url, forceRefresh);
        extractionCache.set(cacheKey, promise);
        
        try {
          extractedData = await promise;
        } catch (err) {
          // Remove from cache on error
          extractionCache.delete(cacheKey);
          throw err;
        }
      }
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setData(extractedData);
        onSuccess?.(extractedData);
      }
    } catch (err) {
      // Don't update state if request was aborted or component unmounted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      if (isMountedRef.current) {
        const categorizedError = categorizeExtractionError(err);
        setError(categorizedError);
        onError?.(categorizedError);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    extractMetadata,
    data,
    loading,
    error,
    reset
  };
}

/**
 * Hook for automatically extracting metadata from a URL with debouncing.
 * This variant triggers extraction automatically when the URL changes.
 * 
 * @param url - The URL to extract metadata from
 * @param options - Optional configuration including debounce delay and callbacks
 * @returns Object with extraction data, loading state, error, and reset function
 */
export function useContentExtractionWithDebounce(
  url: string,
  options: UseContentExtractionOptions & { enabled?: boolean } = {}
): Omit<UseContentExtractionReturn, 'extractMetadata'> {
  const { debounceDelay = 500, enabled = true, ...hookOptions } = options;
  const debouncedUrl = useDebouncedValue(url, debounceDelay);
  const extraction = useContentExtraction(hookOptions);
  
  useEffect(() => {
    // Only extract if enabled and URL is valid (http/https only)
    if (enabled && debouncedUrl && isUrl(debouncedUrl)) {
      extraction.extractMetadata(debouncedUrl);
    }
  }, [debouncedUrl, enabled, extraction]);

  return {
    data: extraction.data,
    loading: extraction.loading,
    error: extraction.error,
    reset: extraction.reset
  };
}