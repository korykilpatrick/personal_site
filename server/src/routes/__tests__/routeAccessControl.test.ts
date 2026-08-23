/** @jest-environment node */
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import type { Request, Response } from 'express';
import config from '../../config/config';
import adminRoutes from '../adminRoutes';
import bookRoutes from '../book.routes';
import bookshelfRoutes from '../bookshelf.routes';
import projectRoutes from '../project.routes';
import workEntryRoutes from '../work_entry.routes';

const mockAdminCreateProject = jest.fn((req: Request, res: Response) => {
  res.status(201).json({ id: 1, ...req.body });
});

jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('../../controllers/book.controller', () => ({
  __esModule: true,
  default: {
    getAll: (_req: Request, res: Response) => res.status(200).json([]),
    getById: (_req: Request, res: Response) => res.status(200).json({ id: 1 }),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../../controllers/bookshelf.controller', () => ({
  __esModule: true,
  default: {
    getAll: (_req: Request, res: Response) => res.status(200).json([]),
    getById: (_req: Request, res: Response) => res.status(200).json({ id: 1 }),
    getBooks: (_req: Request, res: Response) => res.status(200).json([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    addBook: jest.fn(),
    removeBook: jest.fn(),
  },
}));

jest.mock('../../controllers/project.controller', () => ({
  __esModule: true,
  default: {
    getAll: (_req: Request, res: Response) => res.status(200).json([]),
    getById: (_req: Request, res: Response) => res.status(200).json({ id: 1 }),
    getCount: (_req: Request, res: Response) => res.status(200).json({ count: 0 }),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../../controllers/work_entry.controller', () => ({
  __esModule: true,
  default: {
    getAll: (_req: Request, res: Response) => res.status(200).json([]),
    getById: (_req: Request, res: Response) => res.status(200).json({ id: 1 }),
    getCount: (_req: Request, res: Response) => res.status(200).json({ count: 0 }),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../../controllers/admin/projectController', () => ({
  getProjects: (_req: Request, res: Response) => res.status(200).json([]),
  getProjectById: (_req: Request, res: Response) => res.status(200).json({ id: 1 }),
  createProject: (...args: [Request, Response]) => mockAdminCreateProject(...args),
  updateProject: jest.fn(),
  deleteProject: jest.fn(),
}));

function createApp(basePath: string, router: express.Router) {
  const app = express();
  app.use(express.json());
  app.use(basePath, router);
  return app;
}

describe('route access control', () => {
  beforeEach(() => {
    mockAdminCreateProject.mockClear();
  });

  describe('public routes remain readable', () => {
    it.each([
      ['books', '/books', '/'],
      ['bookshelves', '/bookshelves', '/'],
      ['projects', '/projects', '/'],
      ['work', '/work', '/'],
    ])('allows GET on %s', async (_label, basePath, routePath) => {
      const app = createApp(basePath, basePath === '/books'
        ? bookRoutes
        : basePath === '/bookshelves'
          ? bookshelfRoutes
          : basePath === '/projects'
            ? projectRoutes
            : workEntryRoutes);

      const response = await request(app).get(`${basePath}${routePath}`);

      expect(response.status).toBe(200);
    });
  });

  describe('public mutation routes are not exposed', () => {
    it.each([
      ['POST', '/books', '/', { goodreads_id: 1, title: 'Test', author: 'Author' }],
      ['PUT', '/books', '/1', { title: 'Updated' }],
      ['DELETE', '/books', '/1', undefined],
      ['POST', '/bookshelves', '/', { name: 'Favorites' }],
      ['PUT', '/bookshelves', '/1', { name: 'Updated' }],
      ['DELETE', '/bookshelves', '/1', undefined],
      ['POST', '/bookshelves', '/1/books', { bookId: 1 }],
      ['DELETE', '/bookshelves', '/1/books/1', undefined],
      ['POST', '/projects', '/', { title: 'Test', description: 'Desc' }],
      ['PUT', '/projects', '/1', { title: 'Updated' }],
      ['DELETE', '/projects', '/1', undefined],
      ['POST', '/work', '/', { role: 'Engineer', duration: '2024', achievements: 'Built things' }],
      ['PUT', '/work', '/1', { role: 'Updated' }],
      ['DELETE', '/work', '/1', undefined],
    ])('returns 404 for anonymous %s %s%s', async (method, basePath, routePath, payload) => {
      const router = basePath === '/books'
        ? bookRoutes
        : basePath === '/bookshelves'
          ? bookshelfRoutes
          : basePath === '/projects'
            ? projectRoutes
            : workEntryRoutes;
      const app = createApp(basePath, router);

      let response;
      if (method === 'POST') {
        response = await request(app).post(`${basePath}${routePath}`).send(payload);
      } else if (method === 'PUT') {
        response = await request(app).put(`${basePath}${routePath}`).send(payload);
      } else {
        response = await request(app).delete(`${basePath}${routePath}`);
      }

      expect(response.status).toBe(404);
    });
  });

  describe('admin mutations stay authenticated', () => {
    const app = createApp('/admin', adminRoutes);
    const payload = {
      title: 'Secured project',
      description: 'Admin-only mutation path',
    };

    it('rejects unauthenticated admin writes', async () => {
      const response = await request(app).post('/admin/projects').send(payload);

      expect(response.status).toBe(401);
      expect(mockAdminCreateProject).not.toHaveBeenCalled();
    });

    it('rejects unauthenticated post previews', async () => {
      const archiveResponse = await request(app).get('/admin/posts');
      const detailResponse = await request(app).get('/admin/posts/private-example');

      expect(archiveResponse.status).toBe(401);
      expect(detailResponse.status).toBe(401);
    });

    it('allows authenticated admin writes', async () => {
      const token = jwt.sign({ id: 1, username: 'owner' }, config.jwt.secret, {
        expiresIn: '1h',
      });

      const response = await request(app)
        .post('/admin/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(payload);
      expect(mockAdminCreateProject).toHaveBeenCalledTimes(1);
    });
  });
});
