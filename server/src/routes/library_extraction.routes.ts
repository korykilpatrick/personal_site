import { Router } from 'express';
import { body } from 'express-validator';
import { extractMetadata } from '../controllers/libraryExtraction.controller';
import { extractionRateLimiter } from '../middleware/extractionRateLimit';
import { validate } from '../middleware/validation';

const router = Router();

router.post(
  '/extract-metadata',
  extractionRateLimiter,
  [
    body('url')
      .isURL({ protocols: ['http', 'https'], require_protocol: true })
      .withMessage('Must be a valid URL with http or https protocol')
      .isLength({ max: 2048 })
      .withMessage('URL must not exceed 2048 characters'),
    body('forceRefresh')
      .optional()
      .isBoolean()
      .withMessage('forceRefresh must be a boolean'),
  ],
  validate,
  extractMetadata
);

export default router;