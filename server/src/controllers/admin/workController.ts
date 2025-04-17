import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { StatusCodes } from 'http-status-codes';
import logger from '../../utils/logger';
import { WorkEntryModel } from '../../models/WorkEntry'; // Import the model
import { WorkEntry as SharedWorkEntry } from '../../../../types'; // Import shared type

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
    const workEntries = await WorkEntryModel.getAllApi();
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
  const workEntryId = parseInt(id, 10);

  if (isNaN(workEntryId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid work entry ID' });
  }

  try {
    logger.info('Admin fetching work entry by ID', { user: req.user?.username, id });
    const workEntry = await WorkEntryModel.getByIdApi(workEntryId);
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
  // Validation can remain similar, but might be adapted based on SharedWorkEntry structure
  // const validationError = validateWorkEntryInput(req.body); 
  // Let's assume req.body is now expected to match Omit<SharedWorkEntry, 'id' | 'created_at' | 'updated_at'>
  // We might need better validation based on the SharedWorkEntry type

  const workEntryData: Omit<SharedWorkEntry, 'id' | 'created_at' | 'updated_at'> = req.body; 

  // Basic check (improve this with a proper validation library like Zod or Joi)
  if (!workEntryData.company || !workEntryData.role || !workEntryData.duration || !workEntryData.achievements) {
    logger.warn('Work entry creation validation failed', { body: req.body });
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Missing required work entry fields' });
  }

  try {
    logger.info('Admin creating work entry', { user: req.user?.username, company: workEntryData.company, role: workEntryData.role });
    
    // Use the model's createFromApi method
    const newWorkEntry = await WorkEntryModel.createFromApi(workEntryData);
    
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
  const workEntryId = parseInt(id, 10);

  if (isNaN(workEntryId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid work entry ID' });
  }

  // Assume req.body is Partial<Omit<SharedWorkEntry, 'id' | 'created_at' | 'updated_at'>>
  const workEntryData: Partial<Omit<SharedWorkEntry, 'id' | 'created_at' | 'updated_at'>> = req.body;

  // Add basic validation if needed - check if body is empty or contains invalid fields
  if (Object.keys(workEntryData).length === 0) {
    logger.warn('Work entry update attempted with empty body', { id });
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No update data provided' });
  }

  try {
    logger.info('Admin updating work entry', { user: req.user?.username, id });

    // Use the model's updateFromApi method
    const updatedWorkEntry = await WorkEntryModel.updateFromApi(workEntryId, workEntryData);

    if (!updatedWorkEntry) {
      logger.warn('Work entry not found for update', { id });
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Work entry not found' });
    }

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
  const workEntryId = parseInt(id, 10);

  if (isNaN(workEntryId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid work entry ID' });
  }

  try {
    logger.info('Admin deleting work entry', { user: req.user?.username, id });
    // Use the model's delete method (assuming it returns the count or similar)
    // Check BaseModel or WorkEntryModel for the exact return type of delete
    const deleted = await WorkEntryModel.delete(workEntryId);

    // Check if the delete was successful. BaseModel's delete likely returns boolean or count.
    // Adjust this check based on the actual return value of WorkEntryModel.delete
    if (!deleted) { 
      logger.warn('Work entry not found for deletion', { id });
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Work entry not found or could not be deleted' });
    }

    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    logger.error('Error deleting work entry:', { id, error });
    next(error);
  }
}; 