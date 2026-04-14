// Mock OpenAI before any imports that use it
jest.mock('openai', () => ({
  default: jest.fn().mockImplementation(() => ({
    chat: { completions: { create: jest.fn() } },
  })),
}));

import { Request, Response, NextFunction } from 'express';
import { extractMetadata } from '../libraryExtraction.controller';
import { ContentExtractionService } from '../../services/contentExtraction/ContentExtractionService';
import { ApiError } from '../../middleware/error';
import { StatusCodes } from 'http-status-codes';
import type { ExtractedContent } from '@shared/contentExtraction';

jest.mock('../../services/contentExtraction/ContentExtractionService');
jest.mock('../../services/llm/OpenAIService');
jest.mock('../../services/cache/RedisCache');
jest.mock('../../utils/logger');
jest.mock('express-validator', () => ({
  validationResult: jest.fn(() => ({
    isEmpty: jest.fn(() => true),
    array: jest.fn(() => []),
  })),
}));

describe('libraryExtraction.controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let extractContentSpy: jest.SpiedFunction<ContentExtractionService['extractContent']>;

  beforeEach(() => {
    mockReq = {
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    extractContentSpy = jest.spyOn(ContentExtractionService.prototype, 'extractContent');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('extractMetadata', () => {
    const mockExtractedContent: ExtractedContent = {
      title: 'Test Article',
      author: 'John Doe',
      description: 'Test description',
      imageUrl: 'https://example.com/image.jpg',
      suggestedCategory: 'article',
      tags: ['test'],
      contentType: 'article',
      extractionMetadata: {
        confidence: 0.9,
        extractedAt: new Date(),
        llmModel: 'gpt-4',
        version: '1.0',
      },
    };

    it('should extract metadata successfully', async () => {
      mockReq.body = { url: 'https://example.com/article' };
      extractContentSpy.mockResolvedValue(mockExtractedContent);

      await extractMetadata(mockReq as Request, mockRes as Response, mockNext);

      expect(extractContentSpy).toHaveBeenCalledWith(
        'https://example.com/article',
        false
      );
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockExtractedContent,
      });
    });

    it('should handle forceRefresh parameter', async () => {
      mockReq.body = { 
        url: 'https://example.com/article',
        forceRefresh: true,
      };
      extractContentSpy.mockResolvedValue(mockExtractedContent);

      await extractMetadata(mockReq as Request, mockRes as Response, mockNext);

      expect(extractContentSpy).toHaveBeenCalledWith(
        'https://example.com/article',
        true
      );
    });

    it('should handle validation errors', async () => {
      const { validationResult } = jest.requireMock('express-validator');
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid URL' }],
      });

      await extractMetadata(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: StatusCodes.BAD_REQUEST,
          message: 'Validation failed',
        })
      );
    });

    it('should handle extraction errors', async () => {
      // Reset validationResult mock to pass validation (may have been modified by previous test)
      const { validationResult } = jest.requireMock('express-validator');
      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      });

      mockReq.body = { url: 'https://example.com/article' };
      const error = new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Extraction failed');
      extractContentSpy.mockRejectedValue(error);

      await extractMetadata(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle missing OpenAI API key', async () => {
      // Mock config to have no API key
      jest.doMock('../../config/config', () => ({
        __esModule: true,
        default: {
          openai: { apiKey: '' },
          redis: null,
          extraction: { cacheTTL: 3600 },
        },
      }));

      // Mock dependencies needed by fresh import
      jest.doMock('../../services/llm/OpenAIService', () => ({
        OpenAIService: jest.fn(),
      }));
      jest.doMock('../../services/cache/RedisCache', () => ({
        getCache: jest.fn(),
      }));
      jest.doMock('../../services/contentExtraction/ContentExtractionService', () => ({
        ContentExtractionService: jest.fn(),
      }));
      jest.doMock('../../utils/logger', () => ({
        __esModule: true,
        default: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
      }));
      jest.doMock('express-validator', () => ({
        validationResult: jest.fn(() => ({
          isEmpty: () => true,
          array: () => [],
        })),
      }));

      // Clear module cache and re-import with mocked config
      jest.resetModules();
      const { extractMetadata: extractMetadataWithoutKey } = await import('../libraryExtraction.controller');

      mockReq.body = { url: 'https://example.com/article' };

      await extractMetadataWithoutKey(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: StatusCodes.SERVICE_UNAVAILABLE,
          message: 'OpenAI API key not configured',
        })
      );
    });
  });
});
