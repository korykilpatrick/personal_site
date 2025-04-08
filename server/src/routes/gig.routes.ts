import express from 'express';
import GigController from '../controllers/gig.controller';
import { validate } from '../middleware/validation';
import { body, param } from 'express-validator';

const router = express.Router();

/**
 * Gig routes
 */

/**
 * @route GET /api/gigs
 * @desc Get all gigs
 */
router.get('/', GigController.getAll);

/**
 * @route GET /api/gigs/:id
 * @desc Get a gig by ID
 */
router.get(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validate,
  GigController.getById
);

/**
 * @route POST /api/gigs
 * @desc Create a new gig
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
  GigController.create
);

/**
 * @route PUT /api/gigs/:id
 * @desc Update a gig
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
  GigController.update
);

/**
 * @route DELETE /api/gigs/:id
 * @desc Delete a gig
 */
router.delete(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validate,
  GigController.delete
);

export default router;