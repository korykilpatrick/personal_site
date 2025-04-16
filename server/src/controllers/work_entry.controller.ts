import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import WorkEntryModel from '../models/WorkEntry';
import logger from '../utils/logger';

/**
 * WorkEntryController for handling work entry-related requests
 */
export const WorkEntryController = {
  /**
   * Get all work entries
   */
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workEntries = await WorkEntryModel.getAllApi();
      res.status(StatusCodes.OK).json(workEntries);
    } catch (error) {
      logger.error('Error fetching work entries', { error });
      next(error);
    }
  },

  /**
   * Get a work entry by ID
   */
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const workEntry = await WorkEntryModel.getByIdApi(id);
      
      if (!workEntry) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Work entry not found' });
      }
      
      res.status(StatusCodes.OK).json(workEntry);
    } catch (error) {
      logger.error('Error fetching work entry', { error, workEntryId: req.params.id });
      next(error);
    }
  },

  /**
   * Create a new work entry
   */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newWorkEntry = await WorkEntryModel.createFromApi(req.body);
      res.status(StatusCodes.CREATED).json(newWorkEntry);
    } catch (error) {
      logger.error('Error creating work entry', { error, payload: req.body });
      next(error);
    }
  },

  /**
   * Update a work entry
   */
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const updatedWorkEntry = await WorkEntryModel.updateFromApi(id, req.body);
      
      if (!updatedWorkEntry) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Work entry not found' });
      }
      
      res.status(StatusCodes.OK).json(updatedWorkEntry);
    } catch (error) {
      logger.error('Error updating work entry', { error, workEntryId: req.params.id, payload: req.body });
      next(error);
    }
  },

  /**
   * Delete a work entry
   */
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const deleted = await WorkEntryModel.delete(id);
      
      if (!deleted) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Work entry not found' });
      }
      
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      logger.error('Error deleting work entry', { error, workEntryId: req.params.id });
      next(error);
    }
  },

  /**
   * Get the total count of work entries
   */
  getCount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await WorkEntryModel.getCount(); // Assume this method exists on the model
      res.status(StatusCodes.OK).json({ count });
    } catch (error) {
      logger.error('Error fetching work entry count', { error });
      next(error);
    }
  },
};

export default WorkEntryController;