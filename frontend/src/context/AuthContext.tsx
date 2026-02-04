import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
import api from '@/services/api'; // Use the configured Axios instance
import type { User } from 'types/index'; // Use path relative to baseUrl
import {
  AUTH_TOKEN_KEY,
  getUserFromToken,
  isTokenExpired,
  readStoredToken,
} from '../utils/authToken';

// interface User { <-- REMOVED
//   // Define basic user info obtained from token (or fetched after login)
//   username: string;
//   // Add role or other relevant fields if needed
//   // role?: string;
// } <-- REMOVED

interface AuthContextType {
  token: string | null;
  user: User | null; // Use imported type
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameInput: string, passwordInput: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); // Use imported type
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading until initial check is done

  // Initial load: Check local storage for token
  useEffect(() => {
    const storedToken = readStoredToken();
    if (storedToken) {
      const decodedUser = getUserFromToken(storedToken);
      if (decodedUser && !isTokenExpired(storedToken)) {
        setToken(storedToken);
        setUser(decodedUser);
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (usernameInput: string, passwordInput: string) => {
    setIsLoading(true);
    try {
      const response = await api.post<{ token: string }>(`/auth/login`, { 
        username: usernameInput,
        password: passwordInput,
      });

      const newToken = response.data.token;
      const decodedUser = getUserFromToken(newToken);

      if (newToken && decodedUser && !isTokenExpired(newToken)) {
        setToken(newToken);
        setUser(decodedUser);
        localStorage.setItem(AUTH_TOKEN_KEY, newToken);
      } else {
        throw new Error('Login failed: Invalid token or user data received');
      }
    } catch (error) {
      console.error('Login error in context:', error);
      // Propagate error to be handled by the form
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    // Optional: Redirect to login or home page
    // navigate('/login'); // Requires access to navigate hook
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    token,
    user,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  }), [token, user, isLoading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
