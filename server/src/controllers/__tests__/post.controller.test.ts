/** @jest-environment node */
import type { NextFunction, Request, Response } from 'express';
import { AdminPostController } from '../admin/postController';
import { PostController } from '../post.controller';
import PostService from '../../services/PostService';

jest.mock('../../services/PostService', () => ({
  __esModule: true,
  default: {
    getArchive: jest.fn(),
    getBySlug: jest.fn(),
  },
}));

const mockedPostService = jest.mocked(PostService);

function responseDouble() {
  const response = {
    json: jest.fn(),
    set: jest.fn(),
    status: jest.fn(),
  } as unknown as Response;
  jest.mocked(response.status).mockReturnValue(response);
  jest.mocked(response.set).mockReturnValue(response);
  jest.mocked(response.json).mockReturnValue(response);
  return response;
}

const requestWithSlug = (slug: string) => ({ params: { slug } }) as unknown as Request;

describe('post controllers', () => {
  const next = jest.fn() as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses published-only archive reads without retaining review-phase responses', async () => {
    const archive = { posts: [{ slug: 'public-example' }] };
    mockedPostService.getArchive.mockResolvedValue(archive as never);
    const response = responseDouble();

    await PostController.getArchive({} as Request, response, next);

    expect(mockedPostService.getArchive).toHaveBeenCalledWith(false);
    expect(response.set).toHaveBeenCalledWith('Cache-Control', 'no-store');
    expect(response.json).toHaveBeenCalledWith(archive);
  });

  it('does not reveal whether a missing public slug is an unpublished draft', async () => {
    mockedPostService.getBySlug.mockResolvedValue(null);

    for (const slug of ['private-example', 'never-existed']) {
      const response = responseDouble();
      await PostController.getBySlug(requestWithSlug(slug), response, next);
      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({ message: 'Post not found' });
    }

    expect(mockedPostService.getBySlug).toHaveBeenNthCalledWith(1, 'private-example', false);
    expect(mockedPostService.getBySlug).toHaveBeenNthCalledWith(2, 'never-existed', false);
  });

  it('uses draft-inclusive reads and disables storage for authenticated preview responses', async () => {
    const archive = { posts: [{ slug: 'private-example' }] };
    mockedPostService.getArchive.mockResolvedValue(archive as never);
    const response = responseDouble();

    await AdminPostController.getArchive({} as Request, response, next);

    expect(mockedPostService.getArchive).toHaveBeenCalledWith(true);
    expect(response.set).toHaveBeenCalledWith('Cache-Control', 'private, no-store');
    expect(response.json).toHaveBeenCalledWith(archive);
  });
});
