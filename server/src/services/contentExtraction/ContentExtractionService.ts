import { OpenAIService } from '../llm/OpenAIService';
import { ExtractedContent } from '../../../../types/contentExtraction';
import { ExtractedContentSchema, UrlSchema } from './schemas/extraction.schema';
import { createExtractionPrompt, CATEGORIES, EXTRACTION_PROMPT_VERSION } from './prompts/extractionPrompt';
import logger from '../../utils/logger';
import { ApiError } from '../../middleware/error';
import config from '../../config/config';

export interface ICache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
}

/**
 * Service for extracting metadata from web content using OpenAI
 * 
 * Features:
 * - URL validation and normalization
 * - Caching support with configurable TTL
 * - Graceful error handling
 * - Type-safe extraction using Zod schemas
 */
export class ContentExtractionService {
  private cache?: ICache;
  private cacheTTL: number = 3600; // 1 hour default

  constructor(
    private openAIService: OpenAIService,
    cache?: ICache,
    cacheTTL?: number
  ) {
    this.cache = cache;
    if (cacheTTL) {
      this.cacheTTL = cacheTTL;
    }
  }

  /**
   * Extract metadata from a URL
   * 
   * @param url - The URL to extract content from
   * @param forceRefresh - Force extraction even if cached
   * @returns Extracted content metadata
   * @throws {ApiError} If URL is invalid or extraction fails
   */
  async extractContent(url: string, forceRefresh = false): Promise<ExtractedContent> {
    try {
      // Validate URL
      const validationResult = UrlSchema.safeParse(url);
      if (!validationResult.success) {
        throw new ApiError(400, 'Invalid URL');
      }

      const normalizedUrl = this.normalizeUrl(url);
      const cacheKey = `extraction:${normalizedUrl}`;

      // Check cache if not forcing refresh
      if (!forceRefresh && this.cache) {
        const cached = await this.cache.get(cacheKey);
        if (cached) {
          logger.info('Returning cached extraction', { url: normalizedUrl });
          const parsed = JSON.parse(cached);
          // Convert date strings back to Date objects when retrieving from cache
          return {
            ...parsed,
            publicationDate: parsed.publicationDate ? new Date(parsed.publicationDate) : undefined,
            extractionMetadata: {
              ...parsed.extractionMetadata,
              extractedAt: new Date(parsed.extractionMetadata.extractedAt)
            }
          };
        }
      }

      // Extract content using OpenAI
      const prompt = createExtractionPrompt([...CATEGORIES]);
      const extracted = await this.openAIService.extractWebContent(
        url,
        prompt,
        ExtractedContentSchema
      );

      // Map to our domain type
      const content: ExtractedContent = {
        title: extracted.title,
        author: extracted.author,
        description: extracted.description,
        imageUrl: extracted.imageUrl,
        suggestedCategory: extracted.suggestedCategory,
        tags: extracted.tags,
        publicationDate: extracted.publicationDate ? new Date(extracted.publicationDate) : undefined,
        contentType: extracted.contentType,
        extractionMetadata: {
          confidence: 0.9, // You could implement confidence scoring based on completeness
          extractedAt: new Date(),
          llmModel: config.openai.model,
          version: EXTRACTION_PROMPT_VERSION,
        },
      };

      // Cache the result
      if (this.cache) {
        await this.cache.set(cacheKey, JSON.stringify(content), this.cacheTTL);
      }

      return content;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      logger.error('Content extraction failed', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new ApiError(500, 'Failed to extract content');
    }
  }

  private normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      // Remove trailing slashes and normalize
      parsed.pathname = parsed.pathname.replace(/\/$/, '');
      // Sort query parameters for consistent cache keys
      const params = new URLSearchParams(parsed.search);
      const sortedParams = new URLSearchParams([...params.entries()].sort());
      parsed.search = sortedParams.toString();
      return parsed.toString();
    } catch {
      return url;
    }
  }

  async validateUrl(url: string): Promise<boolean> {
    const result = UrlSchema.safeParse(url);
    return result.success;
  }
}