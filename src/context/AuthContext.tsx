import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
import api from '../services/api'; // Use the configured Axios instance
import config from '../config'; // Use frontend config

interface User {
  // Define basic user info obtained from token (or fetched after login)
  username: string;
  // Add role or other relevant fields if needed
  // role?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameInput: string, passwordInput: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to parse JWT (simple example, consider using a library like jwt-decode)
const parseJwt = (token: string): User | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const decoded = JSON.parse(jsonPayload);
    // Assuming payload contains username, adjust as needed
    if (decoded && decoded.username) { 
      return { username: decoded.username };
    }
    return null;
  } catch (e) {
    console.error("Failed to parse JWT", e);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading until initial check is done

  // Initial load: Check local storage for token
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        const parsedToken = JSON.parse(storedToken);
        const decodedUser = parseJwt(parsedToken);
        // Optional: Add check for token expiry here
        if (decodedUser) {
          setToken(parsedToken);
          setUser(decodedUser);
        } else {
          localStorage.removeItem('authToken'); // Clear invalid token
        }
      } catch (e) {
        console.error("Error parsing stored token", e);
        localStorage.removeItem('authToken');
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
      const decodedUser = parseJwt(newToken);

      if (newToken && decodedUser) {
        setToken(newToken);
        setUser(decodedUser);
        localStorage.setItem('authToken', JSON.stringify(newToken));
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
    localStorage.removeItem('authToken');
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