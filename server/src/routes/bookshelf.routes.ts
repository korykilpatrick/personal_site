import express from 'express';
import BookshelfController from '../controllers/bookshelf.controller';
import { validate } from '../middleware/validation';
import { body, param } from 'express-validator';

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

/**
 * @route POST /api/bookshelves
 * @desc Create a new bookshelf
 */
router.post(
  '/',
  [body('name').notEmpty().withMessage('Name is required')],
  validate,
  BookshelfController.create
);

/**
 * @route PUT /api/bookshelves/:id
 * @desc Update a bookshelf
 */
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('ID must be an integer'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  ],
  validate,
  BookshelfController.update
);

/**
 * @route DELETE /api/bookshelves/:id
 * @desc Delete a bookshelf
 */
router.delete(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validate,
  BookshelfController.delete
);

/**
 * @route POST /api/bookshelves/:id/books
 * @desc Add a book to a bookshelf
 */
router.post(
  '/:id/books',
  [
    param('id').isInt().withMessage('Bookshelf ID must be an integer'),
    body('bookId').isInt().withMessage('Book ID must be an integer'),
  ],
  validate,
  BookshelfController.addBook
);

/**
 * @route DELETE /api/bookshelves/:id/books/:bookId
 * @desc Remove a book from a bookshelf
 */
router.delete(
  '/:id/books/:bookId',
  [
    param('id').isInt().withMessage('Bookshelf ID must be an integer'),
    param('bookId').isInt().withMessage('Book ID must be an integer'),
  ],
  validate,
  BookshelfController.removeBook
);

export default router;