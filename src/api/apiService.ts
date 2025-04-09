import axios from 'axios';
import { Book, BookWithShelves, Bookshelf, Project, Gig, Post } from '../../types';

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
  }
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
  
  // Project related endpoints
  getProjects: async (tag?: string): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/projects', {
      params: tag ? { tag } : undefined
    });
    return response.data;
  },
  
  getProjectById: async (id: number): Promise<Project> => {
    const response = await apiClient.get<Project>(`/projects/${id}`);
    return response.data;
  },
  
  // Gig related endpoints
  getGigs: async (): Promise<Gig[]> => {
    const response = await apiClient.get<Gig[]>('/gigs');
    return response.data;
  },
  
  getGigById: async (id: number): Promise<Gig> => {
    const response = await apiClient.get<Gig>(`/gigs/${id}`);
    return response.data;
  },
  
  // Blog related endpoints
  getPosts: async (params?: { tag?: string; q?: string }): Promise<Post[]> => {
    const response = await apiClient.get<Post[]>('/posts', { params });
    return response.data;
  },
  
  getPostById: async (id: number): Promise<Post> => {
    const response = await apiClient.get<Post>(`/posts/${id}`);
    return response.data;
  },
};

export default apiService;