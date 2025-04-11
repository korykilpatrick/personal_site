import axios from 'axios';
import { Book, BookWithShelves, Bookshelf, Project, WorkEntry } from '../../types';

// Define base API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  },
);

// API service methods
export const apiService = {
  // Book related endpoints
  getBooks: async (): Promise<Book[]> => {
    const response = await apiClient.get<Book[]>('/books');
    return response.data;
  },

  getBookById: async (id: number): Promise<BookWithShelves> => {
    const response = await apiClient.get<BookWithShelves>(`/books/${id}`);
    return response.data;
  },

  getBookshelves: async (): Promise<Bookshelf[]> => {
    const response = await apiClient.get<Bookshelf[]>('/bookshelves');
    return response.data;
  },

  getBooksByShelf: async (shelfId: number | undefined): Promise<Book[]> => {
    if (shelfId === undefined) {
      return apiService.getBooks();
    }
    const response = await apiClient.get<Book[]>(`/bookshelves/${shelfId}/books`);
    return response.data;
  },

  getBooksByShelves: async (shelfIds: number[]): Promise<Book[]> => {
    if (shelfIds.length === 0) {
      return apiService.getBooks();
    }

    // Using Promise.all to fetch books from multiple shelves in parallel
    const promises = shelfIds.map((id) => apiClient.get<Book[]>(`/bookshelves/${id}/books`));

    const responses = await Promise.all(promises);

    // Combine books from all shelves and remove duplicates
    const allBooks = responses.flatMap((response) => response.data);
    const uniqueBooks = allBooks.filter(
      (book, index, self) => index === self.findIndex((b) => b.id === book.id),
    );

    return uniqueBooks;
  },

  getSortedBooks: async (sortBy: string = 'date_read'): Promise<Book[]> => {
    const response = await apiClient.get<Book[]>('/books', {
      params: { sort: sortBy },
    });
    return response.data;
  },

  // Project related endpoints
  getProjects: async (tag?: string): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/projects', {
      params: tag ? { tag } : undefined,
    });
    return response.data;
  },

  getProjectById: async (id: number): Promise<Project> => {
    const response = await apiClient.get<Project>(`/projects/${id}`);
    return response.data;
  },

  // Work Entry related endpoints
  getWorkEntries: async (): Promise<WorkEntry[]> => {
    const response = await apiClient.get<WorkEntry[]>('/work');
    return response.data;
  },

  getWorkEntryById: async (id: number): Promise<WorkEntry> => {
    const response = await apiClient.get<WorkEntry>(`/work/${id}`);
    return response.data;
  },
};

export default apiService;
