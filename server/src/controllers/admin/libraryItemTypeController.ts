import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from '../../utils/logger';
import { LibraryItemTypeModel } from '../../models/LibraryItemType';
import { AuthenticatedRequest } from '../../middleware/authMiddleware'; // if needed for user data

export const AdminLibraryItemTypeController = {
  getAll: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const types = await LibraryItemTypeModel.getAll();
      res.status(StatusCodes.OK).json(types);
    } catch (error) {
      logger.error('Error fetching library item types', { error });
      next(error);
    }
  },

  getById: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const itemType = await LibraryItemTypeModel.getById(id);
      if (!itemType) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Library item type not found' });
      }
      res.status(StatusCodes.OK).json(itemType);
    } catch (error) {
      logger.error('Error fetching library item type by ID', { error });
      next(error);
    }
  },

  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Name is required' });
      }
      const newType = await LibraryItemTypeModel.create({ name } as any); // ignoring created_at for now
      res.status(StatusCodes.CREATED).json(newType);
    } catch (error) {
      logger.error('Error creating library item type', { error });
      next(error);
    }
  },

  update: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { name } = req.body;
      if (!name) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Name is required' });
      }
      const updatedType = await LibraryItemTypeModel.update(id, { name } as any);
      if (!updatedType) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Library item type not found' });
      }
      res.status(StatusCodes.OK).json(updatedType);
    } catch (error) {
      logger.error('Error updating library item type', { error });
      next(error);
    }
  },

  delete: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deleted = await LibraryItemTypeModel.delete(id);
      if (!deleted) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Library item type not found' });
      }
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      logger.error('Error deleting library item type', { error });
      next(error);
    }
  },
};

export default AdminLibraryItemTypeController;