import express from 'express';
import BookController from '../controllers/book.controller';
import { validate } from '../middleware/validation';
import { body, param } from 'express-validator';

const router = express.Router();

/**
 * Book routes
 */

/**
 * @route GET /api/books
 * @desc Get all books
 */
router.get('/', BookController.getAll);

/**
 * @route GET /api/books/:id
 * @desc Get a book by ID
 */
router.get(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validate,
  BookController.getById
);

/**
 * @route POST /api/books
 * @desc Create a new book
 */
router.post(
  '/',
  [
    body('goodreads_id').isInt().withMessage('Goodreads ID must be an integer'),
    body('title').notEmpty().withMessage('Title is required'),
    body('author').notEmpty().withMessage('Author is required'),
  ],
  validate,
  BookController.create
);

/**
 * @route PUT /api/books/:id
 * @desc Update a book
 */
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('ID must be an integer'),
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('author').optional().notEmpty().withMessage('Author cannot be empty'),
  ],
  validate,
  BookController.update
);

/**
 * @route DELETE /api/books/:id
 * @desc Delete a book
 */
router.delete(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validate,
  BookController.delete
);

export default router;