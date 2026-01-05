import React, { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Shared form & UI components
import { FormInput, FormField } from '../forms';
import { Button } from '../common';
import { ErrorDisplay } from '../ui';
import { getErrorMessage, logError } from '@/utils/errorUtils';

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
    } catch (err: unknown) {
      logError('login', err);
      const errorMsg = getErrorMessage(err, 'An unexpected error occurred during login.');
      setError(errorMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-center">Admin Login</h2>

      {/* Username */}
      <FormField label="Username" htmlFor="username">
        <FormInput
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
        <FormInput
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