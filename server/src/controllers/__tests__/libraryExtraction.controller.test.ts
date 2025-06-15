import { Request, Response, NextFunction } from 'express';
import { extractMetadata } from '../libraryExtraction.controller';
import { ContentExtractionService } from '../../services/contentExtraction/ContentExtractionService';
import { ApiError } from '../../middleware/error';
import { StatusCodes } from 'http-status-codes';

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
  let mockContentExtractionService: jest.Mocked<ContentExtractionService>;

  beforeEach(() => {
    mockReq = {
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    mockContentExtractionService = {
      extractContent: jest.fn(),
    } as any;

    // Mock the service getter
    jest.spyOn(ContentExtractionService.prototype, 'extractContent')
      .mockImplementation(mockContentExtractionService.extractContent);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('extractMetadata', () => {
    const mockExtractedContent = {
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
      mockContentExtractionService.extractContent.mockResolvedValue(mockExtractedContent);

      await extractMetadata(mockReq as Request, mockRes as Response, mockNext);

      expect(mockContentExtractionService.extractContent).toHaveBeenCalledWith(
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
      mockContentExtractionService.extractContent.mockResolvedValue(mockExtractedContent);

      await extractMetadata(mockReq as Request, mockRes as Response, mockNext);

      expect(mockContentExtractionService.extractContent).toHaveBeenCalledWith(
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
      mockReq.body = { url: 'https://example.com/article' };
      const error = new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Extraction failed');
      mockContentExtractionService.extractContent.mockRejectedValue(error);

      await extractMetadata(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle missing OpenAI API key', async () => {
      // Mock config to have no API key
      jest.doMock('../../config/config', () => ({
        default: {
          openai: { apiKey: '' },
        },
      }));

      // Clear module cache and re-import
      jest.resetModules();
      const { extractMetadata: extractMetadataWithoutKey } = jest.requireActual('../libraryExtraction.controller');

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