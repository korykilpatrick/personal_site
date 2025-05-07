import express, { Request, Response, NextFunction } from 'express';
import { protect } from '../middleware/authMiddleware';
import { body, param, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import * as workController from '../controllers/admin/workController';
import * as projectController from '../controllers/admin/projectController';
import * as siteNoteController from '../controllers/admin/siteNoteController';
import * as quoteController from '../controllers/admin/quoteController';
import logger from '../utils/logger';

// NEW library controllers
import { AdminLibraryItemTypeController } from '../controllers/admin/libraryItemTypeController';
import { AdminLibraryItemController } from '../controllers/admin/libraryItemController';

const router = express.Router();

// Middleware to handle validation results
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed for request:', { 
      path: req.path, 
      method: req.method, 
      errors: errors.array(),
      body: req.body
    }); 
    return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
  }
  next();
};

// Common ID validation
const validateIdParam = [
  param('id').isInt({ gt: 0 }).withMessage('ID must be a positive integer'),
  handleValidationErrors
];

// --- Work Routes ---
router.get('/work', protect, workController.getWorkEntries);
router.get('/work/:id', protect, validateIdParam, workController.getWorkEntryById);
router.post(
  '/work', 
  protect, 
  [
    body('company').optional().isString().trim(),
    body('role').trim().notEmpty().withMessage('Role is required'),
    body('duration').trim().notEmpty().withMessage('Duration is required'),
    body('achievements').isString().trim().notEmpty().withMessage('Achievements text is required'),
  ],
  handleValidationErrors,
  workController.createWorkEntry
);
router.put(
  '/work/:id', 
  protect, 
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid ID format'),
    body('company').optional().isString().trim(),
    body('role').optional().trim().notEmpty().withMessage('Role cannot be empty'),
    body('duration').optional().trim().notEmpty().withMessage('Duration cannot be empty'),
    body('achievements').optional().isString().trim().notEmpty().withMessage('Achievements cannot be empty'),
  ],
  handleValidationErrors,
  workController.updateWorkEntry
);
router.delete('/work/:id', protect, validateIdParam, workController.deleteWorkEntry);

// --- Project Routes ---
router.get('/projects', protect, projectController.getProjects);
router.get('/projects/:id', protect, validateIdParam, projectController.getProjectById);
router.post(
  '/projects', 
  protect, 
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('links').optional().isArray().withMessage('Links must be an array'),
    body('links.*.title').if(body('links').exists()).trim().notEmpty().withMessage('Link title is required'),
    body('links.*.url').if(body('links').exists()).trim().isURL().withMessage('Link URL must be valid'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('tags.*').if(body('tags').exists()).trim().notEmpty().withMessage('Each tag must be non-empty'),
    body('media_urls').optional().isArray().withMessage('Media URLs must be an array'),
    body('media_urls.*').if(body('media_urls').exists()).trim().isURL().withMessage('Each media URL must be valid'),
  ],
  handleValidationErrors,
  projectController.createProject
);
router.put(
  '/projects/:id', 
  protect, 
  validateIdParam,
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
    body('links').optional().isArray().withMessage('Links must be an array if provided'),
    body('links.*.title').if(body('links').exists()).optional().trim().notEmpty().withMessage('Link title is required'),
    body('links.*.url').if(body('links').exists()).optional().trim().isURL().withMessage('Link URL must be valid'),
    body('tags').optional().isArray().withMessage('Tags must be an array if provided'),
    body('tags.*').if(body('tags').exists()).optional().trim().notEmpty().withMessage('Each tag must be non-empty'),
    body('media_urls').optional().isArray().withMessage('Media URLs must be an array if provided'),
    body('media_urls.*').if(body('media_urls').exists()).optional().trim().isURL().withMessage('Each media URL must be valid'),
  ],
  handleValidationErrors,
  projectController.updateProject
);
router.delete('/projects/:id', protect, validateIdParam, projectController.deleteProject);

// --- SiteNote Routes ---
router.get('/site_notes', protect, siteNoteController.getSiteNotes);
router.get('/site_notes/:id', protect, validateIdParam, siteNoteController.getSiteNoteById);
router.post(
  '/site_notes',
  protect, 
  [
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('is_active').isBoolean().withMessage('is_active must be boolean'),
  ],
  handleValidationErrors,
  siteNoteController.createSiteNote
);
router.put(
  '/site_notes/:id',
  protect,
  validateIdParam,
  [
    body('content').optional().trim().notEmpty().withMessage('Content cannot be empty if provided'),
    body('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
  ],
  handleValidationErrors,
  siteNoteController.updateSiteNote
);
router.delete('/site_notes/:id', protect, validateIdParam, siteNoteController.deleteSiteNote);

// --- Quote Routes ---
router.get('/quotes', protect, quoteController.getQuotes);
router.get('/quotes/:id', protect, validateIdParam, quoteController.getQuoteById);
router.post(
  '/quotes',
  protect,
  [
    body('text').trim().notEmpty().withMessage('Quote text is required'),
    body('author').optional().trim(),
    body('source').optional().trim(),
    body('display_order').optional().isInt(),
    body('is_active').isBoolean().withMessage('is_active must be boolean'),
  ],
  handleValidationErrors,
  quoteController.createQuote
);
router.put(
  '/quotes/:id',
  protect,
  validateIdParam,
  [
    body('text').optional().trim().notEmpty().withMessage('Quote text cannot be empty if provided'),
    body('author').optional().trim(),
    body('source').optional().trim(),
    body('display_order').optional().isInt(),
    body('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
  ],
  handleValidationErrors,
  quoteController.updateQuote
);
router.delete('/quotes/:id', protect, validateIdParam, quoteController.deleteQuote);

// --- Library Item Types (Admin) ---
router.get('/library-item-types', protect, AdminLibraryItemTypeController.getAll);
router.get('/library-item-types/:id', protect, validateIdParam, AdminLibraryItemTypeController.getById);
router.post('/library-item-types', protect, [
  body('name').trim().notEmpty().withMessage('Name is required')
], handleValidationErrors, AdminLibraryItemTypeController.create);
router.put('/library-item-types/:id', protect, [
  param('id').isInt({ gt: 0 }).withMessage('ID must be a positive integer'),
  body('name').trim().notEmpty().withMessage('Name is required'),
], handleValidationErrors, AdminLibraryItemTypeController.update);
router.delete('/library-item-types/:id', protect, validateIdParam, AdminLibraryItemTypeController.delete);

// --- Library Items (Admin) ---
router.get('/library-items', protect, AdminLibraryItemController.getAll);
router.get('/library-items/:id', protect, validateIdParam, AdminLibraryItemController.getById);
router.post('/library-items', protect, [
  body('item_type_id').isInt({ gt: 0 }).withMessage('item_type_id must be a positive integer'),
  body('link').trim().notEmpty().withMessage('link is required'),
  body('title').trim().notEmpty().withMessage('title is required'),
], handleValidationErrors, AdminLibraryItemController.create);
router.put('/library-items/:id', protect, [
  param('id').isInt({ gt: 0 }).withMessage('ID must be positive'),
], handleValidationErrors, AdminLibraryItemController.update);
router.delete('/library-items/:id', protect, validateIdParam, AdminLibraryItemController.delete);

export default router;