import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { StatusCodes } from 'http-status-codes';
import logger from '../../utils/logger';
import { db as knex } from '../../db/connection'; // Use named import

const WORK_ENTRIES_TABLE = 'work_entries';

// Basic validation for Work Entry
const validateWorkEntryInput = (input: any) => {
  if (!input || typeof input !== 'object') return 'Invalid input: work entry data missing';
  const requiredFields = ['company', 'role', 'duration', 'achievements'];
  for (const field of requiredFields) {
    if (!input[field] || typeof input[field] !== 'string' || input[field].trim() === '') {
      return `Invalid input: ${field} is required and must be a non-empty string`;
    }
  }
  // Add optional field checks if needed (e.g., work_entry_links)
  return null; // No validation errors
};

// --- CRUD Operations ---

/**
 * GET /admin/work
 * Retrieves all work entries.
 */
export const getWorkEntries = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    logger.info('Admin fetching all work entries', { user: req.user?.username });
    const workEntries = await knex(WORK_ENTRIES_TABLE).select('*').orderBy('created_at', 'desc');
    res.status(StatusCodes.OK).json(workEntries);
  } catch (error) {
    logger.error('Error fetching work entries:', { error });
    next(error);
  }
};

/**
 * GET /admin/work/:id
 * Retrieves a single work entry by ID.
 */
export const getWorkEntryById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    logger.info('Admin fetching work entry by ID', { user: req.user?.username, id });
    const workEntry = await knex(WORK_ENTRIES_TABLE).where({ id }).first();
    if (!workEntry) {
      logger.warn('Work entry not found for getById', { id });
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Work entry not found' });
    }
    res.status(StatusCodes.OK).json(workEntry);
  } catch (error) {
    logger.error('Error fetching work entry by ID:', { id, error });
    next(error);
  }
};

/**
 * POST /admin/work
 * Creates a new work entry.
 */
export const createWorkEntry = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const validationError = validateWorkEntryInput(req.body);
  if (validationError) {
      logger.warn('Work entry creation validation failed', { error: validationError, body: req.body });
      return res.status(StatusCodes.BAD_REQUEST).json({ message: validationError });
  }

  const { company, role, duration, achievements, work_entry_links } = req.body;
  const workEntryData = {
    company,
    role,
    duration,
    achievements,
    work_entry_links: work_entry_links || null, // Ensure null if empty
    // created_at and updated_at have defaults
  };

  try {
    logger.info('Admin creating work entry', { user: req.user?.username, company, role });
    const [newWorkEntry] = await knex(WORK_ENTRIES_TABLE).insert(workEntryData).returning('*');
    res.status(StatusCodes.CREATED).json(newWorkEntry);
  } catch (error) {
    logger.error('Error creating work entry:', { error });
    next(error);
  }
};

/**
 * PUT /admin/work/:id
 * Updates an existing work entry.
 */
export const updateWorkEntry = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const validationError = validateWorkEntryInput(req.body);
  if (validationError) {
      logger.warn('Work entry update validation failed', { id, error: validationError, body: req.body });
      return res.status(StatusCodes.BAD_REQUEST).json({ message: validationError });
  }

  const { company, role, duration, achievements, work_entry_links } = req.body;
  const workEntryData = {
    company,
    role,
    duration,
    achievements,
    work_entry_links: work_entry_links || null,
    updated_at: knex.fn.now(), // Manually update timestamp
  };

  try {
    logger.info('Admin updating work entry', { user: req.user?.username, id });
    const updatedCount = await knex(WORK_ENTRIES_TABLE)
      .where({ id })
      .update(workEntryData);

    if (updatedCount === 0) {
      logger.warn('Work entry not found for update', { id });
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Work entry not found' });
    }

    const updatedWorkEntry = await knex(WORK_ENTRIES_TABLE).where({ id }).first();
    res.status(StatusCodes.OK).json(updatedWorkEntry);
  } catch (error) {
    logger.error('Error updating work entry:', { id, error });
    next(error);
  }
};

/**
 * DELETE /admin/work/:id
 * Deletes a specific work entry.
 */
export const deleteWorkEntry = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    logger.info('Admin deleting work entry', { user: req.user?.username, id });
    const deletedCount = await knex(WORK_ENTRIES_TABLE).where({ id }).del();

    if (deletedCount === 0) {
      logger.warn('Work entry not found for deletion', { id });
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Work entry not found' });
    }

    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    logger.error('Error deleting work entry:', { id, error });
    next(error);
  }
}; 