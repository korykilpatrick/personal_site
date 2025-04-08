import axios from 'axios';

// Define base API URL
const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api';

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
  getBooks: async () => {
    const response = await apiClient.get('/books');
    return response.data;
  },
  
  getBookById: async (id: number) => {
    const response = await apiClient.get(`/books/${id}`);
    return response.data;
  },
  
  getBookshelves: async () => {
    const response = await apiClient.get('/bookshelves');
    return response.data;
  },
  
  getBooksByShelf: async (shelfId: number) => {
    const response = await apiClient.get(`/bookshelves/${shelfId}/books`);
    return response.data;
  },
  
  // Project related endpoints
  getProjects: async () => {
    const response = await apiClient.get('/projects');
    return response.data;
  },
  
  getProjectById: async (id: number) => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },
  
  // Gig related endpoints
  getGigs: async () => {
    const response = await apiClient.get('/gigs');
    return response.data;
  },
  
  getGigById: async (id: number) => {
    const response = await apiClient.get(`/gigs/${id}`);
    return response.data;
  },
  
  // Blog related endpoints
  getPosts: async () => {
    const response = await apiClient.get('/posts');
    return response.data;
  },
  
  getPostById: async (id: number) => {
    const response = await apiClient.get(`/posts/${id}`);
    return response.data;
  },
};

export default apiService;