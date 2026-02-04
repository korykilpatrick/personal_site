/** @jest-environment node */
import jwt from 'jsonwebtoken';
import { protect } from '../authMiddleware';
import config from '../../config/config';

jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('protect middleware', () => {
  it('returns 401 when no authorization header is provided', async () => {
    const req: any = { headers: {} };
    const res = createMockResponse();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when authorization header is not Bearer', async () => {
    const req: any = { headers: { authorization: 'Token abc' } };
    const res = createMockResponse();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when bearer token is empty', async () => {
    const req: any = { headers: { authorization: 'Bearer ' } };
    const res = createMockResponse();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token verification fails', async () => {
    const req: any = { headers: { authorization: 'Bearer not-a-valid-token' } };
    const res = createMockResponse();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' });
    expect(next).not.toHaveBeenCalled();
  });

  it('allows access with a valid token', async () => {
    const token = jwt.sign({ id: 1, username: 'tester' }, config.jwt.secret, {
      expiresIn: '1h',
    });
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res = createMockResponse();
    const next = jest.fn();

    await protect(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ id: 1, username: 'tester' });
  });
});
