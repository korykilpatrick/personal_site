import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import LibraryItemTypeModel from '../models/LibraryItemType';

export const LibraryItemTypeController = {
  // e.g., GET /api/library-item-types
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const types = await LibraryItemTypeModel.getAll();
      return res.status(StatusCodes.OK).json(types);
    } catch (error) {
      next(error);
    }
  },

  // e.g., GET /api/library-item-types/:id
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const itemType = await LibraryItemTypeModel.getById(id);
      if (!itemType) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Library item type not found' });
      }
      return res.status(StatusCodes.OK).json(itemType);
    } catch (error) {
      next(error);
    }
  },
};

export default LibraryItemTypeController;