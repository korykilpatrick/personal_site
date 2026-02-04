import {
  AUTH_TOKEN_KEY,
  getUserFromToken,
  isTokenExpired,
  readStoredToken,
} from '../authToken';

const encodeBase64Url = (value: object) =>
  btoa(JSON.stringify(value))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const createToken = (payload: object) =>
  `header.${encodeBase64Url(payload)}.signature`;

describe('authToken utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when no token is stored', () => {
    expect(readStoredToken()).toBeNull();
  });

  it('returns raw token when stored as a string', () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'raw-token');
    expect(readStoredToken()).toBe('raw-token');
  });

  it('returns parsed token when stored as JSON', () => {
    localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify('json-token'));
    expect(readStoredToken()).toBe('json-token');
  });

  it('extracts user from token payload', () => {
    const token = createToken({ username: 'kory' });
    expect(getUserFromToken(token)).toEqual({ username: 'kory' });
  });

  it('returns null when username is missing', () => {
    const token = createToken({ id: 1 });
    expect(getUserFromToken(token)).toBeNull();
  });

  it('detects expired tokens based on exp', () => {
    const expiredToken = createToken({ exp: Math.floor(Date.now() / 1000) - 60 });
    expect(isTokenExpired(expiredToken)).toBe(true);
  });

  it('allows tokens without exp', () => {
    const token = createToken({ username: 'tester' });
    expect(isTokenExpired(token)).toBe(false);
  });

  it('allows non-expired tokens', () => {
    const token = createToken({ exp: Math.floor(Date.now() / 1000) + 3600 });
    expect(isTokenExpired(token)).toBe(false);
  });
});
