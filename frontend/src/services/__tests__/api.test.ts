import api from '../api';
import { AUTH_TOKEN_KEY } from '../../utils/authToken';
import { redirectToLogin } from '../../utils/navigation';

type RequestHandler = (config: { headers?: Record<string, string> }) => { headers?: Record<string, string> };
type RequestErrorHandler = (error: Error) => Promise<never>;
type ResponseErrorHandler = (error: { response?: { status?: number } }) => Promise<never>;

type RequestInterceptorStore = {
  handlers: Array<{
    fulfilled: RequestHandler;
    rejected: RequestErrorHandler;
  }>;
};

type ResponseInterceptorStore = {
  handlers: Array<{
    rejected: ResponseErrorHandler;
  }>;
};

jest.mock('../../utils/navigation', () => ({
  redirectToLogin: jest.fn(),
}));

const encodeBase64Url = (value: object) =>
  btoa(JSON.stringify(value))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const createToken = (payload: object) =>
  `header.${encodeBase64Url(payload)}.signature`;

describe('api interceptors', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    localStorage.clear();
    window.location.href = 'http://localhost/';
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('adds Authorization header when token is valid', () => {
    const token = createToken({ exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem(AUTH_TOKEN_KEY, token);

    const requestHandlers = (api.interceptors.request as unknown as RequestInterceptorStore).handlers;
    const handler = requestHandlers[0].fulfilled;
    const config = handler({ headers: {} });

    expect(config.headers.Authorization).toBe(`Bearer ${token}`);
  });

  it('removes expired tokens and skips Authorization header', () => {
    const token = createToken({ exp: Math.floor(Date.now() / 1000) - 3600 });
    localStorage.setItem(AUTH_TOKEN_KEY, token);

    const requestHandlers = (api.interceptors.request as unknown as RequestInterceptorStore).handlers;
    const handler = requestHandlers[0].fulfilled;
    const config = handler({ headers: {} });

    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(config.headers.Authorization).toBeUndefined();
  });

  it('returns a rejected promise from request error handler', async () => {
    const requestHandlers = (api.interceptors.request as unknown as RequestInterceptorStore).handlers;
    const errorHandler = requestHandlers[0].rejected;
    await expect(errorHandler(new Error('boom'))).rejects.toThrow('boom');
  });

  it('clears token and redirects on 401 responses', async () => {
    const token = createToken({ exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem(AUTH_TOKEN_KEY, token);

    const responseHandlers = (api.interceptors.response as unknown as ResponseInterceptorStore).handlers;
    const responseHandler = responseHandlers[0].rejected;
    const error = { response: { status: 401 } };

    await responseHandler(error).catch(() => undefined);

    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(redirectToLogin).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Unauthorized! Redirecting to login.');
  });
});
