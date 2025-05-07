import express from 'express';
import LibraryItemController from '../controllers/libraryItem.controller';
import { validate } from '../middleware/validation';
import { param } from 'express-validator';

const router = express.Router();

/**
 * @route GET /api/library-items
 * @desc Get all library items (supports ?item_type_id= &tag=)
 */
router.get('/', LibraryItemController.getAll);

/**
 * @route GET /api/library-items/:id
 * @desc Get a library item by ID
 */
router.get(
  '/:id',
  [ param('id').isInt().withMessage('ID must be an integer') ],
  validate,
  LibraryItemController.getById
);

/**
 * @route GET /api/library-items/summary/count
 * @desc Get total library items count
 */
router.get(
  '/summary/count',
  LibraryItemController.getTotalCount
);

export default router;