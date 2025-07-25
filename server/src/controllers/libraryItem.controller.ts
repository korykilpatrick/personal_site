import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { LibraryItemModel } from '../models/LibraryItem';
import logger from '../utils/logger';
import { DatabaseCountResult } from '../types/database';

export const LibraryItemController = {
  // GET /api/library-items
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item_type_id = req.query.item_type_id ? parseInt(req.query.item_type_id as string, 10) : undefined;
      const tag = req.query.tag ? String(req.query.tag) : undefined;

      const items = await LibraryItemModel.getAllWithType({ item_type_id, tag });
      return res.status(StatusCodes.OK).json(items);
    } catch (error) {
      logger.error('Error fetching library items', { error });
      next(error);
    }
  },

  // GET /api/library-items/:id
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const item = await LibraryItemModel.getById(id);
      if (!item) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Library item not found' });
      }
      return res.status(StatusCodes.OK).json(item);
    } catch (error) {
      logger.error('Error fetching library item by ID', { error });
      next(error);
    }
  },

  /**
   * GET /library-items/summary/count
   * Return the total count of library items.
   */
  getTotalCount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await LibraryItemModel.query().count({ count: '*' }).first() as DatabaseCountResult;
      const count = parseInt(result.count.toString(), 10) || 0;
      res.status(StatusCodes.OK).json({ count });
    } catch (error) {
      logger.error('Error fetching total library items count', { error });
      next(error);
    }
  },
};

export default LibraryItemController;