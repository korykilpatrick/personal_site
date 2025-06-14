import { OpenAIService } from '../llm/OpenAIService';
import { ContentExtractionService } from './ContentExtractionService';
import config from '../../config/config';

let extractionService: ContentExtractionService | null = null;

export function initializeExtractionService(cache?: any): ContentExtractionService {
  if (!extractionService) {
    // Initialize OpenAI service
    const openAIService = new OpenAIService({
      apiKey: config.openai.apiKey,
      model: config.openai.model,
      temperature: config.openai.temperature,
      maxTokens: config.openai.maxTokens,
    });

    // Initialize content extraction service
    extractionService = new ContentExtractionService(
      openAIService,
      cache,
      config.extraction.cacheTTL
    );
  }

  return extractionService;
}

export function getExtractionService(): ContentExtractionService {
  if (!extractionService) {
    throw new Error('Extraction service not initialized. Call initializeExtractionService first.');
  }
  return extractionService;
}