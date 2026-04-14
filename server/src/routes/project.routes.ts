import express from 'express';
import ProjectController from '../controllers/project.controller';
import { validate } from '../middleware/validation';
import { param, query } from 'express-validator';

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

export default router;
