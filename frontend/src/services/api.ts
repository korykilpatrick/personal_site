import axios from 'axios';
import config from '../config'; // Assuming a frontend config file exists or create one
import { AUTH_TOKEN_KEY, isTokenExpired, readStoredToken } from '../utils/authToken';
import { redirectToLogin } from '../utils/navigation';

const api = axios.create({
  baseURL: config.apiBaseUrl, // e.g., '/api' or full URL like http://localhost:3001/api
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token header to requests
api.interceptors.request.use(
  (config) => {
    // Retrieve the token from local storage 
    // (or ideally from AuthContext later)
    const token = readStoredToken();
    if (token) {
      if (isTokenExpired(token)) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      } else {
        const headers = config.headers ?? {};
        headers.Authorization = `Bearer ${token}`;
        config.headers = headers;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (optional) - e.g., handle 401 errors globally
api.interceptors.response.use(
  (response) => response, // Simply return successful responses
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      // Clear token (e.g., from local storage / AuthContext)
      localStorage.removeItem(AUTH_TOKEN_KEY);
      // Redirect to login page
      // Use window.location or handle via routing context if possible
      redirectToLogin();
      // You might want to show a notification to the user
      console.error('Unauthorized! Redirecting to login.');
    }
    return Promise.reject(error); // Propagate the error
  }
);

export default api; 
