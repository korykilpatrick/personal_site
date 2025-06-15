import { ContentExtractionService } from '../ContentExtractionService';
import { OpenAIService } from '../../llm/OpenAIService';
import { ICache } from '../ContentExtractionService';
import { ApiError } from '../../../middleware/error';
import { ExtractedContent } from '../../../../../types/contentExtraction';

jest.mock('../../llm/OpenAIService');
jest.mock('../../../utils/logger');

describe('ContentExtractionService', () => {
  let service: ContentExtractionService;
  let mockOpenAIService: jest.Mocked<OpenAIService>;
  let mockCache: jest.Mocked<ICache>;

  beforeEach(() => {
    mockOpenAIService = {
      extractWebContent: jest.fn(),
    } as any;

    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
    };

    service = new ContentExtractionService(mockOpenAIService, mockCache, 3600);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('extractContent', () => {
    const validUrl = 'https://example.com/article';
    const mockExtractedData = {
      title: 'Test Article',
      author: 'John Doe',
      description: 'A test article description',
      imageUrl: 'https://example.com/image.jpg',
      suggestedCategory: 'article',
      tags: ['test', 'example'],
      publicationDate: '2024-01-01',
      contentType: 'article',
    };

    it('should extract content from a valid URL', async () => {
      mockCache.get.mockResolvedValue(null);
      mockOpenAIService.extractWebContent.mockResolvedValue(mockExtractedData);

      const result = await service.extractContent(validUrl);

      expect(result).toMatchObject({
        title: mockExtractedData.title,
        author: mockExtractedData.author,
        description: mockExtractedData.description,
        imageUrl: mockExtractedData.imageUrl,
        suggestedCategory: mockExtractedData.suggestedCategory,
        tags: mockExtractedData.tags,
        contentType: mockExtractedData.contentType,
      });

      expect(result.extractionMetadata).toMatchObject({
        confidence: 0.9,
        version: expect.any(String),
      });

      expect(mockCache.set).toHaveBeenCalledWith(
        expect.stringContaining('extraction:'),
        expect.any(String),
        3600
      );
    });

    it('should return cached content when available', async () => {
      const cachedContent: ExtractedContent = {
        title: 'Cached Article',
        author: 'Jane Doe',
        description: 'Cached description',
        imageUrl: 'https://example.com/cached.jpg',
        suggestedCategory: 'article',
        tags: ['cached'],
        contentType: 'article',
        extractionMetadata: {
          confidence: 0.9,
          extractedAt: new Date(),
          llmModel: 'gpt-4',
          version: '1.0',
        },
      };

      mockCache.get.mockResolvedValue(JSON.stringify(cachedContent));

      const result = await service.extractContent(validUrl);

      expect(result).toEqual(cachedContent);
      expect(mockOpenAIService.extractWebContent).not.toHaveBeenCalled();
    });

    it('should bypass cache when forceRefresh is true', async () => {
      mockCache.get.mockResolvedValue(JSON.stringify({ title: 'Cached' }));
      mockOpenAIService.extractWebContent.mockResolvedValue(mockExtractedData);

      await service.extractContent(validUrl, true);

      expect(mockCache.get).not.toHaveBeenCalled();
      expect(mockOpenAIService.extractWebContent).toHaveBeenCalled();
    });

    it('should throw ApiError for invalid URL', async () => {
      const invalidUrl = 'not-a-valid-url';

      await expect(service.extractContent(invalidUrl)).rejects.toThrow(ApiError);
      await expect(service.extractContent(invalidUrl)).rejects.toThrow('Invalid URL');
    });

    it('should handle extraction failures gracefully', async () => {
      mockCache.get.mockResolvedValue(null);
      mockOpenAIService.extractWebContent.mockRejectedValue(new Error('OpenAI error'));

      await expect(service.extractContent(validUrl)).rejects.toThrow(ApiError);
      await expect(service.extractContent(validUrl)).rejects.toThrow('Failed to extract content');
    });

    it('should normalize URLs for consistent caching', async () => {
      mockCache.get.mockResolvedValue(null);
      mockOpenAIService.extractWebContent.mockResolvedValue(mockExtractedData);

      await service.extractContent('https://example.com/article/');
      await service.extractContent('https://example.com/article');

      expect(mockCache.set).toHaveBeenCalledTimes(2);
      const firstCall = mockCache.set.mock.calls[0][0];
      const secondCall = mockCache.set.mock.calls[1][0];
      expect(firstCall).toBe(secondCall);
    });

    it('should handle URLs with query parameters', async () => {
      mockCache.get.mockResolvedValue(null);
      mockOpenAIService.extractWebContent.mockResolvedValue(mockExtractedData);

      const urlWithParams = 'https://example.com/article?b=2&a=1';
      await service.extractContent(urlWithParams);

      expect(mockCache.set).toHaveBeenCalledWith(
        expect.stringContaining('a=1&b=2'),
        expect.any(String),
        3600
      );
    });
  });

  describe('validateUrl', () => {
    it('should return true for valid URLs', async () => {
      expect(await service.validateUrl('https://example.com')).toBe(true);
      expect(await service.validateUrl('http://localhost:3000')).toBe(true);
      expect(await service.validateUrl('https://example.com/path?query=1')).toBe(true);
    });

    it('should return false for invalid URLs', async () => {
      expect(await service.validateUrl('not-a-url')).toBe(false);
      expect(await service.validateUrl('ftp://example.com')).toBe(false);
      expect(await service.validateUrl('')).toBe(false);
    });
  });
});