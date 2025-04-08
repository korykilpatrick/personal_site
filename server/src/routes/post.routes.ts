import express from 'express';
import PostController from '../controllers/post.controller';
import { validate } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = express.Router();

/**
 * Post routes
 */

/**
 * @route GET /api/posts
 * @desc Get all posts or filter by tag or search
 */
router.get(
  '/',
  [
    query('tag').optional().isString().withMessage('Tag must be a string'),
    query('q').optional().isString().withMessage('Search query must be a string'),
  ],
  validate,
  PostController.getAll
);

/**
 * @route GET /api/posts/:id
 * @desc Get a post by ID
 */
router.get(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validate,
  PostController.getById
);

/**
 * @route POST /api/posts
 * @desc Create a new post
 */
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('excerpt').optional().isString().withMessage('Excerpt must be a string'),
  ],
  validate,
  PostController.create
);

/**
 * @route PUT /api/posts/:id
 * @desc Update a post
 */
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('ID must be an integer'),
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('content').optional().notEmpty().withMessage('Content cannot be empty'),
    body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('excerpt').optional().isString().withMessage('Excerpt must be a string'),
  ],
  validate,
  PostController.update
);

/**
 * @route DELETE /api/posts/:id
 * @desc Delete a post
 */
router.delete(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validate,
  PostController.delete
);

export default router;