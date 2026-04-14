import express from 'express';
import BookshelfController from '../controllers/bookshelf.controller';
import { validate } from '../middleware/validation';
import { param } from 'express-validator';

const router = express.Router();

/**
 * Bookshelf routes
 */

/**
 * @route GET /api/bookshelves
 * @desc Get all bookshelves
 */
router.get('/', BookshelfController.getAll);

/**
 * @route GET /api/bookshelves/:id
 * @desc Get a bookshelf by ID
 */
router.get(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validate,
  BookshelfController.getById
);

/**
 * @route GET /api/bookshelves/:id/books
 * @desc Get books in a bookshelf
 */
router.get(
  '/:id/books',
  [param('id').isInt().withMessage('ID must be an integer')],
  validate,
  BookshelfController.getBooks
);

export default router;
