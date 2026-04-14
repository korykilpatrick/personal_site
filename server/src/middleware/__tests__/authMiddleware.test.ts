/** @jest-environment node */
import type { Response } from 'express';
import jwt from 'jsonwebtoken';
import { protect, type AuthenticatedRequest } from '../authMiddleware';
import config from '../../config/config';

jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

type MockResponse = Pick<Response, 'status' | 'json'> & {
  status: jest.Mock;
  json: jest.Mock;
};

const createMockResponse = (): MockResponse => {
  const res = {} as MockResponse;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('protect middleware', () => {
  it('returns 401 when no authorization header is provided', async () => {
    const req: Partial<AuthenticatedRequest> = { headers: {} };
    const res = createMockResponse();
    const next = jest.fn();

    await protect(req as AuthenticatedRequest, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when authorization header is not Bearer', async () => {
    const req: Partial<AuthenticatedRequest> = { headers: { authorization: 'Token abc' } };
    const res = createMockResponse();
    const next = jest.fn();

    await protect(req as AuthenticatedRequest, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when bearer token is empty', async () => {
    const req: Partial<AuthenticatedRequest> = { headers: { authorization: 'Bearer ' } };
    const res = createMockResponse();
    const next = jest.fn();

    await protect(req as AuthenticatedRequest, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token verification fails', async () => {
    const req: Partial<AuthenticatedRequest> = { headers: { authorization: 'Bearer not-a-valid-token' } };
    const res = createMockResponse();
    const next = jest.fn();

    await protect(req as AuthenticatedRequest, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' });
    expect(next).not.toHaveBeenCalled();
  });

  it('allows access with a valid token', async () => {
    const token = jwt.sign({ id: 1, username: 'tester' }, config.jwt.secret, {
      expiresIn: '1h',
    });
    const req: Partial<AuthenticatedRequest> = { headers: { authorization: `Bearer ${token}` } };
    const res = createMockResponse();
    const next = jest.fn();

    await protect(req as AuthenticatedRequest, res as unknown as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((req as AuthenticatedRequest).user).toMatchObject({ id: 1, username: 'tester' });
  });
});
