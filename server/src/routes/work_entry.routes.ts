import express from 'express';
import WorkEntryController from '../controllers/work_entry.controller';
import { validate } from '../middleware/validation';
import { param } from 'express-validator';

const router = express.Router();

/**
 * Work Entry routes
 */

/**
 * @route GET /api/work/summary/count
 * @desc Get the total count of work entries
 */
router.get(
  '/summary/count',
  WorkEntryController.getCount // No validation needed, assuming auth handled elsewhere
);

/**
 * @route GET /api/work
 * @desc Get all work entries
 */
router.get('/', WorkEntryController.getAll);

/**
 * @route GET /api/work/:id
 * @desc Get a work entry by ID
 */
router.get(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validate,
  WorkEntryController.getById
);

export default router;
