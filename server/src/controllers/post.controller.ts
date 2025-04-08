import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import PostModel from '../models/Post';
import logger from '../utils/logger';

/**
 * PostController for handling blog post-related requests
 */
export const PostController = {
  /**
   * Get all posts
   */
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if we should filter by tag or search
      const { tag, q } = req.query;
      
      if (tag && typeof tag === 'string') {
        const posts = await PostModel.getByTag(tag);
        return res.status(StatusCodes.OK).json(posts);
      }
      
      if (q && typeof q === 'string') {
        const posts = await PostModel.search(q);
        return res.status(StatusCodes.OK).json(posts);
      }
      
      const posts = await PostModel.getAll();
      res.status(StatusCodes.OK).json(posts);
    } catch (error) {
      logger.error('Error fetching posts', { error, query: req.query });
      next(error);
    }
  },

  /**
   * Get a post by ID
   */
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const post = await PostModel.getById(id);
      
      if (!post) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Post not found' });
      }
      
      res.status(StatusCodes.OK).json(post);
    } catch (error) {
      logger.error('Error fetching post', { error, postId: req.params.id });
      next(error);
    }
  },

  /**
   * Create a new post
   */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newPost = await PostModel.create(req.body);
      res.status(StatusCodes.CREATED).json(newPost);
    } catch (error) {
      logger.error('Error creating post', { error, payload: req.body });
      next(error);
    }
  },

  /**
   * Update a post
   */
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const updatedPost = await PostModel.update(id, req.body);
      
      if (!updatedPost) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Post not found' });
      }
      
      res.status(StatusCodes.OK).json(updatedPost);
    } catch (error) {
      logger.error('Error updating post', { error, postId: req.params.id, payload: req.body });
      next(error);
    }
  },

  /**
   * Delete a post
   */
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const deleted = await PostModel.delete(id);
      
      if (!deleted) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Post not found' });
      }
      
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      logger.error('Error deleting post', { error, postId: req.params.id });
      next(error);
    }
  },
};

export default PostController;