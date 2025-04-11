import express from 'express';
import WorkEntryController from '../controllers/work_entry.controller';
import { validate } from '../middleware/validation';
import { body, param } from 'express-validator';

const router = express.Router();

/**
 * Work Entry routes
 */

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

/**
 * @route POST /api/work
 * @desc Create a new work entry
 */
router.post(
  '/',
  [
    body('company').notEmpty().withMessage('Company is required'),
    body('role').notEmpty().withMessage('Role is required'),
    body('duration').notEmpty().withMessage('Duration is required'),
    body('achievements').notEmpty().withMessage('Achievements are required'),
    body('links').optional().isArray().withMessage('Links must be an array'),
  ],
  validate,
  WorkEntryController.create
);

/**
 * @route PUT /api/work/:id
 * @desc Update a work entry
 */
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('ID must be an integer'),
    body('company').optional().notEmpty().withMessage('Company cannot be empty'),
    body('role').optional().notEmpty().withMessage('Role cannot be empty'),
    body('duration').optional().notEmpty().withMessage('Duration cannot be empty'),
    body('achievements').optional().notEmpty().withMessage('Achievements cannot be empty'),
    body('links').optional().isArray().withMessage('Links must be an array'),
  ],
  validate,
  WorkEntryController.update
);

/**
 * @route DELETE /api/work/:id
 * @desc Delete a work entry
 */
router.delete(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validate,
  WorkEntryController.delete
);

export default router;