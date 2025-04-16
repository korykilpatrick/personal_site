import React, { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import axios from 'axios'; // Keep for error type checking

// REMOVE useLocalStorage hook - no longer needed here
// const useLocalStorage = (key: string, initialValue: string | null) => { ... };

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth(); // Get login function and loading state from context

  // Determine where to redirect after login
  const from = location.state?.from?.pathname || "/admin";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(username, password); // Call login method from context
      navigate(from, { replace: true }); // Redirect to intended page or admin dashboard
    } catch (err: any) {
      console.error('Login error:', err);
      // Handle specific error messages from the backend/context
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Invalid credentials or server error');
      } else if (err instanceof Error) {
         setError(err.message || 'An unexpected error occurred during login.');
      } else {
        setError('An unexpected error occurred during login.');
      }
    }
  };

  return (
    <div>
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading} // Disable form when loading
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading} // Disable form when loading
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'} { /* Show loading state */}
        </button>
      </form>
    </div>
  );
};

export default LoginForm; 