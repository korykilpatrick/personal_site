import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import PostService from '../../services/PostService';

export const AdminPostController = {
  getArchive: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const archive = await PostService.getArchive(true);
      res.set('Cache-Control', 'private, no-store');
      res.status(StatusCodes.OK).json(archive);
    } catch (error) {
      next(error);
    }
  },

  getBySlug: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const post = await PostService.getBySlug(req.params.slug, true);
      if (!post) {
        res.status(StatusCodes.NOT_FOUND).json({ message: 'Post not found' });
        return;
      }
      res.set('Cache-Control', 'private, no-store');
      res.status(StatusCodes.OK).json(post);
    } catch (error) {
      next(error);
    }
  },
};

export default AdminPostController;
