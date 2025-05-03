import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { StatusCodes } from 'http-status-codes';
import logger from '../../utils/logger';
import SiteNoteService from '../../services/SiteNoteService';
import { SiteNote } from '@shared/index';

/**
 * Admin SiteNote controller for full CRUD.
 */
export const getSiteNotes = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    logger.info('Admin fetching all site notes', { user: req.user?.username });
    const notes = await SiteNoteService.getAll();
    res.status(StatusCodes.OK).json(notes);
  } catch (error) {
    logger.error('Error fetching site notes', { error });
    next(error);
  }
};

export const getSiteNoteById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const noteId = parseInt(id, 10);

  try {
    logger.info('Admin fetching site note by ID', { user: req.user?.username, noteId });
    const note = await SiteNoteService.getById(noteId);
    if (!note) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Site note not found' });
    }
    res.status(StatusCodes.OK).json(note);
  } catch (error) {
    logger.error('Error fetching site note by ID', { error });
    next(error);
  }
};

export const createSiteNote = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const noteData: Omit<SiteNote, 'id' | 'created_at' | 'updated_at'> = req.body;
  try {
    logger.info('Admin creating site note', { user: req.user?.username });
    const newNote = await SiteNoteService.create(noteData);
    res.status(StatusCodes.CREATED).json(newNote);
  } catch (error) {
    logger.error('Error creating site note', { error });
    next(error);
  }
};

export const updateSiteNote = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const noteId = parseInt(id, 10);

  const noteData: Partial<SiteNote> = req.body;
  try {
    logger.info('Admin updating site note', { user: req.user?.username, noteId });
    const updated = await SiteNoteService.update(noteId, noteData);
    if (!updated) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Site note not found' });
    }
    res.status(StatusCodes.OK).json(updated);
  } catch (error) {
    logger.error('Error updating site note', { error });
    next(error);
  }
};

export const deleteSiteNote = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const noteId = parseInt(id, 10);

  try {
    logger.info('Admin deleting site note', { user: req.user?.username, noteId });
    const deleted = await SiteNoteService.delete(noteId);
    if (!deleted) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Site note not found or could not be deleted' });
    }
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    logger.error('Error deleting site note', { error });
    next(error);
  }
};