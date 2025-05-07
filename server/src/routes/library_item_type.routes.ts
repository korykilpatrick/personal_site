import express from 'express';
import LibraryItemTypeController from '../controllers/libraryItemType.controller';
import { validate } from '../middleware/validation';
import { param } from 'express-validator';

const router = express.Router();

/**
 * @route GET /api/library-item-types
 * @desc Get all library item types
 */
router.get('/', LibraryItemTypeController.getAll);

/**
 * @route GET /api/library-item-types/:id
 * @desc Get a library item type by ID
 */
router.get(
  '/:id',
  [ param('id').isInt().withMessage('ID must be an integer') ],
  validate,
  LibraryItemTypeController.getById
);

export default router;