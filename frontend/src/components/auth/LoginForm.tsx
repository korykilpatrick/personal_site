import React, { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Shared form & UI components
import { FormInput, FormField } from '../forms';
import { Button } from '../common';
import { ErrorDisplay } from '../ui';
import { getErrorMessage, logError } from '@/utils/errorUtils';

interface LoginLocationState {
  from?:
    | string
    | {
        pathname?: unknown;
        search?: unknown;
        hash?: unknown;
      };
}

const UNSAFE_PATH_FRAGMENT = /\\|%5c/i;

export const normalizeLoginReturnTo = (
  value: unknown,
  origin: string = window.location.origin,
): string | undefined => {
  if (typeof value !== 'string') return undefined;

  const candidate = value.trim();
  if (!candidate || candidate.startsWith('//') || UNSAFE_PATH_FRAGMENT.test(candidate)) {
    return undefined;
  }

  try {
    const baseUrl = new URL(origin);
    const destination = new URL(candidate, baseUrl);

    if (destination.origin !== baseUrl.origin) return undefined;

    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return undefined;
  }
};

const getStateReturnTo = (state: unknown): string | undefined => {
  if (!state || typeof state !== 'object') return undefined;

  const { from } = state as LoginLocationState;
  if (typeof from === 'string') return from;
  if (!from || typeof from !== 'object' || typeof from.pathname !== 'string') {
    return undefined;
  }

  const search = typeof from.search === 'string' ? from.search : '';
  const hash = typeof from.hash === 'string' ? from.hash : '';
  return `${from.pathname}${search}${hash}`;
};

export const getLoginDestination = (
  search: string,
  state: unknown,
  origin: string = window.location.origin,
): string => {
  const requestedReturn = new URLSearchParams(search).get('returnTo');
  return (
    normalizeLoginReturnTo(requestedReturn, origin) ??
    normalizeLoginReturnTo(getStateReturnTo(state), origin) ??
    '/admin'
  );
};

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth(); // Get login function and loading state from context

  // Preserve the exact local review URL after an expired or missing preview token.
  const destination = getLoginDestination(location.search, location.state);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(username, password); // Call login method from context
      navigate(destination, { replace: true }); // Redirect to intended page or admin dashboard
    } catch (err: unknown) {
      logError('login', err);
      const errorMsg = getErrorMessage(err, 'An unexpected error occurred during login.');
      setError(errorMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form space-y-6">
      <p className="site-eyebrow">Admin</p>
      <h1>Sign in</h1>

      {/* Username */}
      <FormField label="Username" htmlFor="username" labelClassName="login-label">
        <FormInput
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={isLoading}
          className="login-input"
        />
      </FormField>

      {/* Password */}
      <FormField label="Password" htmlFor="password" labelClassName="login-label">
        <FormInput
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          className="login-input"
        />
      </FormField>

      {/* Error message */}
      {error && <ErrorDisplay error={error} />}

      {/* Submit button */}
      <Button type="submit" variant="primary" className="login-submit w-full" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
};

export default LoginForm;
