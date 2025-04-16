import React, { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

// Shared form & UI components
import { Input, FormField } from '../forms';
import { Button } from '../common';
import { ErrorDisplay } from '../ui';

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-center">Admin Login</h2>

      {/* Username */}
      <FormField label="Username" htmlFor="username">
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={isLoading}
        />
      </FormField>

      {/* Password */}
      <FormField label="Password" htmlFor="password">
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </FormField>

      {/* Error message */}
      {error && <ErrorDisplay error={error} />}

      {/* Submit button */}
      <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
};

export default LoginForm; 