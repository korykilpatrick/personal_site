import type { User } from 'types';

export const AUTH_TOKEN_KEY = 'authToken';

interface JwtPayload {
  username?: string;
  exp?: number;
  [key: string]: unknown;
}

export const readStoredToken = (): string | null => {
  const raw = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') {
      return parsed;
    }
  } catch {
    // Ignore JSON parse errors; token might be stored as a raw string.
  }

  return raw;
};

const decodeBase64Url = (value: string): string => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const decoded = atob(padded);

  return decodeURIComponent(
    decoded
      .split('')
      .map((char) => `%${('00' + char.charCodeAt(0).toString(16)).slice(-2)}`)
      .join('')
  );
};

export const parseJwtPayload = (token: string): JwtPayload | null => {
  if (!token) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const payload = decodeBase64Url(parts[1]);
    const parsed = JSON.parse(payload) as JwtPayload;
    return parsed;
  } catch {
    return null;
  }
};

export const getUserFromToken = (token: string): User | null => {
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.username !== 'string') {
    return null;
  }

  return { username: payload.username };
};

export const isTokenExpired = (token: string): boolean => {
  const payload = parseJwtPayload(token);
  const exp = payload?.exp;
  if (typeof exp !== 'number') {
    return false;
  }

  return Date.now() >= exp * 1000;
};
