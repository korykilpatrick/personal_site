import { useState, useCallback, useEffect, useRef } from 'react';
import { apiService } from '../api/apiService';
import type { ExtractedContent } from 'types/index';
import useDebouncedValue from './useDebouncedValue';
import { isUrl } from '../utils/validation';
import { ExtractionError, categorizeExtractionError } from '../utils/extractionErrors';
import { extractionCache } from '../utils/extractionCache';

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
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
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
      const cachedPromise = extractionCache.get(url);
      
      if (!forceRefresh && cachedPromise) {
        // Use cached promise
        extractedData = await cachedPromise;
      } else {
        // Clear old cache entry if exists
        if (cachedPromise) {
          extractionCache.delete(url);
        }
        
        // Create new request and cache the promise
        const promise = apiService.extractMetadata(url, forceRefresh);
        extractionCache.set(url, promise);
        
        try {
          extractedData = await promise;
        } catch (err) {
          // Remove from cache on error
          extractionCache.delete(url);
          throw err;
        }
      }
      
      // Update state
      setData(extractedData);
      onSuccess?.(extractedData);
    } catch (err) {
      // Don't update state if request was aborted or component unmounted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      const categorizedError = categorizeExtractionError(err);
      setError(categorizedError);
      onError?.(categorizedError);
    } finally {
      setLoading(false);
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
  
  // Track the last extracted URL to prevent re-extraction
  const lastExtractedUrlRef = useRef<string>('');
  
  useEffect(() => {
    // Only extract if enabled, URL is valid, and we haven't already extracted this URL
    if (enabled && debouncedUrl && isUrl(debouncedUrl) && debouncedUrl !== lastExtractedUrlRef.current) {
      lastExtractedUrlRef.current = debouncedUrl;
      extraction.extractMetadata(debouncedUrl);
    }
  }, [debouncedUrl, enabled, extraction.extractMetadata]);

  return {
    data: extraction.data,
    loading: extraction.loading,
    error: extraction.error,
    reset: extraction.reset
  };
}