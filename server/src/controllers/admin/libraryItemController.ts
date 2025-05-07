import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from '../../utils/logger';
import { LibraryItemModel, LibraryItem } from '../../models/LibraryItem';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';

export const AdminLibraryItemController = {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const item_type_id = req.query.item_type_id ? parseInt(req.query.item_type_id as string, 10) : undefined;
      const tag = req.query.tag ? String(req.query.tag) : undefined;
      const items = await LibraryItemModel.getAllWithType({ item_type_id, tag });
      res.status(StatusCodes.OK).json(items);
    } catch (error) {
      logger.error('Error fetching library items (admin)', { error });
      next(error);
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const item = await LibraryItemModel.getById(id);
      if (!item) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Library item not found' });
      }
      res.status(StatusCodes.OK).json(item);
    } catch (error) {
      logger.error('Error fetching library item by ID (admin)', { error });
      next(error);
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { item_type_id, link, title, blurb, thumbnail_url, tags, creators } = req.body;
      if (!item_type_id || !link || !title) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'item_type_id, link, and title are required' });
      }

      const newItem: Omit<LibraryItem, 'id'|'created_at'|'updated_at'> = {
        item_type_id,
        link,
        title,
        blurb: blurb || null,
        thumbnail_url: thumbnail_url || null,
        tags: Array.isArray(tags) ? tags : [],
        creators: Array.isArray(creators) ? creators : [],
      };

      const created = await LibraryItemModel.create(newItem as any);
      res.status(StatusCodes.CREATED).json(created);
    } catch (error) {
      logger.error('Error creating library item', { error });
      next(error);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const { item_type_id, link, title, blurb, thumbnail_url, tags, creators } = req.body;

      const updateData: Partial<LibraryItem> = {};
      if (typeof item_type_id !== 'undefined') updateData.item_type_id = item_type_id;
      if (typeof link === 'string') updateData.link = link;
      if (typeof title === 'string') updateData.title = title;
      if (typeof blurb === 'string') updateData.blurb = blurb;
      if (typeof thumbnail_url === 'string') updateData.thumbnail_url = thumbnail_url;
      if (Array.isArray(tags)) updateData.tags = tags;
      if (Array.isArray(creators)) updateData.creators = creators;

      const updated = await LibraryItemModel.update(id, updateData as any);
      if (!updated) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Library item not found' });
      }
      res.status(StatusCodes.OK).json(updated);
    } catch (error) {
      logger.error('Error updating library item', { error });
      next(error);
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const deleted = await LibraryItemModel.delete(id);
      if (!deleted) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Library item not found' });
      }
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      logger.error('Error deleting library item', { error });
      next(error);
    }
  },
};
export default AdminLibraryItemController;