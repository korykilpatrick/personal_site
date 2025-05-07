import express from 'express';
import QuoteController from '../controllers/quote.controller';
import { validate } from '../middleware/validation';
import { query } from 'express-validator';

const router = express.Router();

/**
 * @route GET /api/quotes
 * @desc Get quotes. If ?active=true => only active quotes
 */
router.get(
  '/',
  [
    query('active').optional().isBoolean().withMessage('active must be a boolean'),
  ],
  validate,
  QuoteController.getAll
);

/**
 * @route GET /api/quotes/summary/count
 * @desc Get total quotes count, or active quotes count if active=true query param is present
 * @queryparam active {boolean} [Optional] If true, returns count of active quotes.
 */
router.get(
  '/summary/count',
  [
    query('active').optional().isBoolean().withMessage('active must be a boolean'),
  ],
  validate,
  QuoteController.getCounts
);

export default router;