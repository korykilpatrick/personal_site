import { Book, BookWithShelves, Bookshelf, Project, WorkEntry } from '../../types';
import api from '../services/api';

// API service methods
export const apiService = {
  // Book related endpoints
  getBooks: async (): Promise<Book[]> => {
    const response = await api.get<Book[]>('/books');
    return response.data;
  },

  getBookById: async (id: number): Promise<BookWithShelves> => {
    const response = await api.get<BookWithShelves>(`/books/${id}`);
    return response.data;
  },

  getBookshelves: async (): Promise<Bookshelf[]> => {
    const response = await api.get<Bookshelf[]>('/bookshelves');
    return response.data;
  },

  getBooksByShelf: async (shelfId: number | undefined): Promise<Book[]> => {
    if (shelfId === undefined) {
      return apiService.getBooks();
    }
    const response = await api.get<Book[]>(`/bookshelves/${shelfId}/books`);
    return response.data;
  },

  getBooksByShelves: async (shelfIds: number[]): Promise<Book[]> => {
    if (shelfIds.length === 0) {
      return apiService.getBooks();
    }

    // Using Promise.all to fetch books from multiple shelves in parallel
    const promises = shelfIds.map((id) => api.get<Book[]>(`/bookshelves/${id}/books`));

    const responses = await Promise.all(promises);

    // Combine books from all shelves and remove duplicates
    const allBooks = responses.flatMap((response) => response.data);
    const uniqueBooks = allBooks.filter(
      (book, index, self) => index === self.findIndex((b) => b.id === book.id),
    );

    return uniqueBooks;
  },

  getSortedBooks: async (sortBy: string = 'date_read'): Promise<Book[]> => {
    const response = await api.get<Book[]>('/books', {
      params: { sort: sortBy },
    });
    return response.data;
  },

  // Project related endpoints
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

  // Work Entry related endpoints
  getWorkEntries: async (): Promise<WorkEntry[]> => {
    const response = await api.get<WorkEntry[]>('/work');
    return response.data;
  },

  getWorkEntryById: async (id: number): Promise<WorkEntry> => {
    const response = await api.get<WorkEntry>(`/work/${id}`);
    return response.data;
  },
};

export default apiService;
