import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { ContentExtractionService } from '../services/contentExtraction/ContentExtractionService';
import { OpenAIService } from '../services/llm/OpenAIService';
import { getCache } from '../services/cache/RedisCache';
import { ApiError } from '../middleware/error';
import logger from '../utils/logger';
import config from '../config/config';

let extractionService: ContentExtractionService | null = null;

const getExtractionService = (): ContentExtractionService => {
  if (!extractionService) {
    if (!config.openai.apiKey) {
      throw new ApiError(StatusCodes.SERVICE_UNAVAILABLE, 'OpenAI API key not configured');
    }
    
    const openAIService = new OpenAIService(config.openai);
    const cache = config.redis ? getCache() : undefined;
    extractionService = new ContentExtractionService(
      openAIService,
      cache,
      config.extraction.cacheTTL
    );
  }
  return extractionService;
};

/**
 * Extract metadata from a URL using OpenAI
 * 
 * @route POST /api/library/extract-metadata
 * @body {string} url - The URL to extract metadata from
 * @returns {ExtractedContent} Extracted metadata including title, author, description, etc.
 * 
 * @example
 * POST /api/library/extract-metadata
 * {
 *   "url": "https://example.com/article"
 * }
 * 
 * @throws {400} Invalid URL format
 * @throws {429} Rate limit exceeded
 * @throws {500} Extraction failed
 */
export const extractMetadata = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Validation failed');
    }

    const { url, forceRefresh = false } = req.body;

    logger.info('Extracting metadata', { url, forceRefresh });

    const service = getExtractionService();
    const extractedContent = await service.extractContent(url, forceRefresh);

    logger.info('Metadata extracted successfully', {
      url,
      title: extractedContent.title,
      category: extractedContent.suggestedCategory,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: extractedContent,
    });
  } catch (error) {
    next(error);
  }
};