import axios from 'axios';
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
    const query: Record<string, any> = {};
    if (itemTypeId) query.item_type_id = itemTypeId;
    if (tag) query.tag = tag;
    const response = await api.get<LibraryItem[]>('/library-items', { params: query });
    return response.data;
  },

  /**
   * Extract metadata from a URL for library item creation.
   */
  extractMetadata: async (url: string, forceRefresh?: boolean): Promise<ExtractedContent> => {
    const response = await api.post<{ success: boolean; data: any }>('/library/extract-metadata', {
      url,
      forceRefresh
    });
    
    // Transform date strings back to Date objects and fix backend typo
    const data = response.data.data;
    const result = {
      ...data,
      suggestedCategory: data.suggestedCategor || data.suggestedCategory, // Handle backend typo
      publicationDate: data.publicationDate ? new Date(data.publicationDate) : undefined,
      extractionMetadata: {
        ...data.extractionMetadata,
        extractedAt: new Date(data.extractionMetadata.extractedAt)
      }
    };
    
    return result;
  },
};

export default apiService;