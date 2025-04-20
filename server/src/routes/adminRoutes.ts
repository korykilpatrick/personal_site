import express, { Request, Response, NextFunction } from 'express';
import { protect } from '../middleware/authMiddleware';
import { body, param, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import * as workController from '../controllers/admin/workController';
import * as projectController from '../controllers/admin/projectController';
// Potentially import other admin controllers if they exist
// import * as bookController from '../controllers/admin/bookController'; 
import logger from '../utils/logger'; // Import logger

const router = express.Router();

// Middleware to handle validation results
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Log the specific validation errors
    logger.warn('Validation failed for request:', { 
      path: req.path, 
      method: req.method, 
      errors: errors.array(),
      body: req.body // Log the request body for context
    }); 
    return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
  }
  next();
};

// Common ID validation middleware
const validateIdParam = [
  param('id').isInt({ gt: 0 }).withMessage('ID must be a positive integer'),
  handleValidationErrors
];


// --- Work Routes ---
router.get('/work', protect, workController.getWorkEntries);

router.get(
  '/work/:id', 
  protect, 
  validateIdParam, // Add ID validation
  workController.getWorkEntryById
);

router.post(
  '/work', 
  protect, 
  [ // Add body validation
    body('company').trim().notEmpty().withMessage('Company is required'),
    body('role').trim().notEmpty().withMessage('Role is required'),
    body('duration').trim().notEmpty().withMessage('Duration is required'),
    body('achievements').isArray({ min: 1 }).withMessage('Achievements must be a non-empty array'),
    body('achievements.*').trim().notEmpty().withMessage('Each achievement must be a non-empty string'), // Validate items within the array
    // Add other field validations as necessary based on SharedWorkEntry type
  ],
  handleValidationErrors, // Handle validation errors
  workController.createWorkEntry
);

router.put(
  '/work/:id', 
  protect, 
  validateIdParam, // Add ID validation
  [ // Add body validation (optional for updates)
    body('company').optional().trim().notEmpty().withMessage('Company cannot be empty if provided'),
    body('role').optional().trim().notEmpty().withMessage('Role cannot be empty if provided'),
    body('duration').optional().trim().notEmpty().withMessage('Duration cannot be empty if provided'),
    body('achievements').optional().isArray().withMessage('Achievements must be an array if provided'),
    body('achievements.*').if(body('achievements').exists()).trim().notEmpty().withMessage('Each achievement must be a non-empty string'),
    // Ensure at least one field is present for update (can be complex with express-validator, might keep a light check in controller or service)
    // Consider adding a check like:
    // body().custom((value, { req }) => {
    //   if (Object.keys(req.body).length === 0) {
    //     throw new Error('Update body cannot be empty');
    //   }
    //   return true;
    // })
  ],
  handleValidationErrors, // Handle validation errors
  workController.updateWorkEntry
);

router.delete(
  '/work/:id', 
  protect, 
  validateIdParam, // Add ID validation
  workController.deleteWorkEntry
);


// --- Project Routes ---
router.get('/projects', protect, projectController.getProjects);

router.get(
  '/projects/:id', 
  protect, 
  validateIdParam, // Add ID validation
  projectController.getProjectById
);

router.post(
  '/projects', 
  protect, 
  [ // Add body validation
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('links').optional().isArray().withMessage('Links must be an array'),
    body('links.*.title').if(body('links').exists()).trim().notEmpty().withMessage('Link title is required'),
    body('links.*.url').if(body('links').exists()).trim().isURL().withMessage('Link URL must be valid'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('tags.*').if(body('tags').exists()).trim().notEmpty().withMessage('Each tag must be a non-empty string'),
    body('media_urls').optional().isArray().withMessage('Media URLs must be an array'),
    body('media_urls.*').if(body('media_urls').exists()).trim().isURL().withMessage('Each media URL must be a valid URL'),
    // Add other field validations as necessary based on SharedProject type
  ],
  handleValidationErrors, // Handle validation errors
  projectController.createProject
);

router.put(
  '/projects/:id', 
  protect, 
  validateIdParam, // Add ID validation
  [ // Add body validation (optional for updates)
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty if provided'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty if provided'),
    body('links').optional().isArray().withMessage('Links must be an array if provided'),
    body('links.*.title').if(body('links').exists()).optional().trim().notEmpty().withMessage('Link title is required'),
    body('links.*.url').if(body('links').exists()).optional().trim().isURL().withMessage('Link URL must be valid'),
    body('tags').optional().isArray().withMessage('Tags must be an array if provided'),
    body('tags.*').if(body('tags').exists()).optional().trim().notEmpty().withMessage('Each tag must be a non-empty string'),
    body('media_urls').optional().isArray().withMessage('Media URLs must be an array if provided'),
    body('media_urls.*').if(body('media_urls').exists()).optional().trim().isURL().withMessage('Each media URL must be a valid URL'),
    // Add custom validation for non-empty body if desired
  ],
  handleValidationErrors, // Handle validation errors
  projectController.updateProject
);

router.delete(
  '/projects/:id', 
  protect, 
  validateIdParam, // Add ID validation
  projectController.deleteProject
);

// --- Add other Admin routes here following the same pattern ---
// Example: Book Routes (if they exist)
// router.get('/books', authenticateJWT, bookController.getBooks);
// router.post('/books', authenticateJWT, [/* book validation */], handleValidationErrors, bookController.createBook);
// ... etc.

export default router;
