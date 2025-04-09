import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import GigModel from '../models/Gig';
import logger from '../utils/logger';

/**
 * GigController for handling gig-related requests
 */
export const GigController = {
  /**
   * Get all gigs
   */
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const gigs = await GigModel.getAllApi();
      res.status(StatusCodes.OK).json(gigs);
    } catch (error) {
      logger.error('Error fetching gigs', { error });
      next(error);
    }
  },

  /**
   * Get a gig by ID
   */
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const gig = await GigModel.getByIdApi(id);
      
      if (!gig) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Gig not found' });
      }
      
      res.status(StatusCodes.OK).json(gig);
    } catch (error) {
      logger.error('Error fetching gig', { error, gigId: req.params.id });
      next(error);
    }
  },

  /**
   * Create a new gig
   */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newGig = await GigModel.createFromApi(req.body);
      res.status(StatusCodes.CREATED).json(newGig);
    } catch (error) {
      logger.error('Error creating gig', { error, payload: req.body });
      next(error);
    }
  },

  /**
   * Update a gig
   */
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const updatedGig = await GigModel.updateFromApi(id, req.body);
      
      if (!updatedGig) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Gig not found' });
      }
      
      res.status(StatusCodes.OK).json(updatedGig);
    } catch (error) {
      logger.error('Error updating gig', { error, gigId: req.params.id, payload: req.body });
      next(error);
    }
  },

  /**
   * Delete a gig
   */
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const deleted = await GigModel.delete(id);
      
      if (!deleted) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Gig not found' });
      }
      
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      logger.error('Error deleting gig', { error, gigId: req.params.id });
      next(error);
    }
  },
};

export default GigController;