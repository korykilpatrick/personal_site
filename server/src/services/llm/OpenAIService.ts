import OpenAI from 'openai';
import { z } from 'zod';
import logger from '../../utils/logger';
import { ApiError } from '../../middleware/error';

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export class OpenAIService {
  private client: OpenAI;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: OpenAIConfig) {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.client = new OpenAI({
      apiKey: config.apiKey,
      timeout: config.timeout || 30000,
    });

    this.model = config.model || 'gpt-4-turbo-preview';
    this.temperature = config.temperature || 0.3;
    this.maxTokens = config.maxTokens || 1000;
  }

  async extractWebContent(url: string, extractionPrompt: string, responseSchema: z.ZodSchema): Promise<any> {
    try {
      logger.info('Starting OpenAI content extraction', {
        url,
        model: this.model,
      });

      const completion = await this.client.chat.completions.create({
        model: this.model,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that extracts metadata from web pages. Always return valid JSON matching the requested schema.',
          },
          {
            role: 'user',
            content: `${extractionPrompt}\n\nURL: ${url}`,
          },
        ],
        functions: [
          {
            name: 'extract_content',
            description: 'Extract metadata from a webpage',
            parameters: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'The main title of the content' },
                author: { type: 'string', description: 'Author name if found' },
                description: { type: 'string', description: 'Brief description or summary' },
                imageUrl: { type: 'string', description: 'URL of the main image' },
                suggestedCategory: {
                  type: 'string',
                  enum: ['article', 'book', 'video', 'tool', 'other'],
                  description: 'Suggested category for the content',
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Relevant tags or keywords',
                },
                publicationDate: { type: 'string', description: 'Publication date if available' },
                contentType: {
                  type: 'string',
                  enum: ['article', 'video', 'book', 'paper', 'other'],
                  description: 'Type of content',
                },
              },
              required: ['title'],
            },
          },
        ],
        function_call: { name: 'extract_content' },
      });

      const functionCall = completion.choices[0]?.message?.function_call;
      if (!functionCall || !functionCall.arguments) {
        throw new ApiError(500, 'No function call in OpenAI response');
      }

      const parsedResponse = JSON.parse(functionCall.arguments);
      
      // Validate response against schema
      const validationResult = responseSchema.safeParse(parsedResponse);
      if (!validationResult.success) {
        logger.error('OpenAI response validation failed', {
          errors: validationResult.error.errors,
          response: parsedResponse,
        });
        throw new ApiError(500, 'Invalid response format from OpenAI');
      }

      logger.info('Successfully extracted content', {
        url,
        title: validationResult.data.title,
      });

      return validationResult.data;
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        logger.error('OpenAI API error', {
          status: error.status,
          message: error.message,
          code: error.code,
        });
        
        if (error.status === 429) {
          throw new ApiError(429, 'Rate limit exceeded');
        }
        
        throw new ApiError(500, 'OpenAI API error');
      }
      
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.models.list();
      return response.data.length > 0;
    } catch (error) {
      logger.error('OpenAI connection test failed', { error });
      return false;
    }
  }
}