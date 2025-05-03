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

export default router;