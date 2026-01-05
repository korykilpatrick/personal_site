import type {
  BookWithShelves,
  Bookshelf,
  Book,
  Project,
  WorkEntry,
  LibraryItem,
  ExtractedContent
} from 'types/index';
import api from '../services/api';

// Centralized API service
export const apiService = {
  /**
   * Fetch books. If includeShelves is true, returns BookWithShelves (each book has shelves).
   */
  getBooks: async (includeShelves?: boolean): Promise<(Book | BookWithShelves)[]> => {
    const response = await api.get<(Book | BookWithShelves)[]>('/books', {
      params: { includeShelves: includeShelves ? 'true' : 'false' },
    });
    return response.data;
  },

  /**
   * Fetch a single book by ID, including its shelves.
   */
  getBookById: async (id: number): Promise<BookWithShelves> => {
    const response = await api.get<BookWithShelves>(`/books/${id}`);
    return response.data;
  },

  /**
   * Fetch all bookshelves.
   */
  getBookshelves: async (): Promise<Bookshelf[]> => {
    const response = await api.get<Bookshelf[]>('/bookshelves');
    return response.data;
  },

  // Project endpoints
  getProjects: async (tag?: string): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects', {
      params: tag ? { tag } : undefined,
    });
    return response.data;
  },
  getProjectById: async (id: number): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  // Work entry endpoints
  getWorkEntries: async (): Promise<WorkEntry[]> => {
    const response = await api.get<WorkEntry[]>('/work');
    return response.data;
  },
  getWorkEntryById: async (id: number): Promise<WorkEntry> => {
    const response = await api.get<WorkEntry>(`/work/${id}`);
    return response.data;
  },

  /**
   * Fetch library items. Supports optional filtering by item_type_id and tag.
   */
  getLibraryItems: async (itemTypeId?: number, tag?: string): Promise<LibraryItem[]> => {
    const query: Record<string, string | number> = {};
    if (itemTypeId) query.item_type_id = itemTypeId;
    if (tag) query.tag = tag;
    const response = await api.get<LibraryItem[]>('/library-items', { params: query });
    return response.data;
  },

  /**
   * Extract metadata from a URL for library item creation.
   */
  extractMetadata: async (url: string, forceRefresh?: boolean): Promise<ExtractedContent> => {
    // API may return suggestedCategor (typo) instead of suggestedCategory
    interface ApiExtractedContent extends Omit<ExtractedContent, 'publicationDate' | 'extractionMetadata'> {
      suggestedCategor?: string;
      publicationDate?: string | Date;
      extractionMetadata: {
        confidence: number;
        extractedAt: string | Date;
        llmModel: string;
        version: string;
      };
    }

    const response = await api.post<{ success: boolean; data: ApiExtractedContent }>('/library/extract-metadata', {
      url,
      forceRefresh
    });

    // Transform date strings back to Date objects and fix backend typo
    const data = response.data.data;
    const result: ExtractedContent = {
      title: data.title,
      author: data.author,
      description: data.description,
      imageUrl: data.imageUrl,
      suggestedCategory: (data.suggestedCategor || data.suggestedCategory) as ExtractedContent['suggestedCategory'],
      tags: data.tags,
      contentType: data.contentType,
      publicationDate: data.publicationDate ? new Date(data.publicationDate) : undefined,
      extractionMetadata: {
        confidence: data.extractionMetadata.confidence,
        llmModel: data.extractionMetadata.llmModel,
        version: data.extractionMetadata.version,
        extractedAt: new Date(data.extractionMetadata.extractedAt)
      }
    };

    return result;
  },
};

export default apiService;