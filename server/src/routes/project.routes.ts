import express from 'express';
import ProjectController from '../controllers/project.controller';
import { validate } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = express.Router();

/**
 * Project routes
 */

/**
 * @route GET /api/projects/summary/count
 * @desc Get the total count of projects
 */
router.get(
  '/summary/count',
  ProjectController.getCount // No validation needed, assuming auth handled elsewhere
);

/**
 * @route GET /api/projects
 * @desc Get all projects or filter by tag
 */
router.get(
  '/',
  [query('tag').optional().isString().withMessage('Tag must be a string')],
  validate,
  ProjectController.getAll
);

/**
 * @route GET /api/projects/:id
 * @desc Get a project by ID
 */
router.get(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validate,
  ProjectController.getById
);

/**
 * @route POST /api/projects
 * @desc Create a new project
 */
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('media_urls').optional().isArray().withMessage('Media URLs must be an array'),
    body('links').optional().isArray().withMessage('Links must be an array'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
  ],
  validate,
  ProjectController.create
);

/**
 * @route PUT /api/projects/:id
 * @desc Update a project
 */
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('ID must be an integer'),
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('media_urls').optional().isArray().withMessage('Media URLs must be an array'),
    body('links').optional().isArray().withMessage('Links must be an array'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
  ],
  validate,
  ProjectController.update
);

/**
 * @route DELETE /api/projects/:id
 * @desc Delete a project
 */
router.delete(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validate,
  ProjectController.delete
);

export default router;