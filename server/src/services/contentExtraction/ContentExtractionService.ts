import { OpenAIService } from '../llm/OpenAIService';
import { ExtractedContent, ExtractionError } from '../../../../types/contentExtraction';
import { ExtractedContentSchema, UrlSchema } from './schemas/extraction.schema';
import { createExtractionPrompt, CATEGORIES, EXTRACTION_PROMPT_VERSION } from './prompts/extractionPrompt';
import logger from '../../utils/logger';
import { ApiError } from '../../middleware/error';

export interface ICache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
}

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
          return JSON.parse(cached);
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
          llmModel: 'gpt-4-turbo-preview',
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