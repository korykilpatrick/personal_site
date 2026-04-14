import express from 'express';
import BookController from '../controllers/book.controller';
import { validate } from '../middleware/validation';
import { param } from 'express-validator';

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

export default router;
