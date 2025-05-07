import express from 'express';
import SiteNoteController from '../controllers/siteNote.controller';
import { validate } from '../middleware/validation';
import { query } from 'express-validator';

const router = express.Router();

/**
 * @route GET /api/site_notes
 * @desc Get all site notes or optionally only the active one (via ?active=true)
 */
router.get(
  '/',
  [
    query('active').optional().isBoolean().withMessage('active must be a boolean'),
  ],
  validate,
  SiteNoteController.getAll
);

/**
 * @route GET /api/site_notes/active
 * @desc Get only the active site note
 */
router.get('/active', SiteNoteController.getActive);

/**
 * @route GET /api/site_notes/summary/count
 * @desc Get total site notes count, or active site notes count if active=true query param is present
 * @queryparam active {boolean} [Optional] If true, returns count of active site notes.
 */
router.get(
  '/summary/count',
  [
    query('active').optional().isBoolean().withMessage('active must be a boolean'),
  ],
  validate,
  SiteNoteController.getCounts
);

export default router;