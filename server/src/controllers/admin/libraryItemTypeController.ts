import { Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CRUDController } from '../base/CRUDController';
import { LibraryItemTypeModel, LibraryItemType } from '../../models/LibraryItemType';
import LibraryItemTypeService from '../../services/LibraryItemTypeService';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import logger from '../../utils/logger';

/**
 * Admin LibraryItemType controller for full CRUD.
 * Extends CRUDController with custom validation
 */
class AdminLibraryItemTypeControllerClass extends CRUDController<LibraryItemType> {
  constructor() {
    super(LibraryItemTypeModel, 'Library Item Type', LibraryItemTypeService);
  }

  // Override create to add validation
  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name } = req.body;
      if (!name) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: 'Name is required' });
        return;
      }

      logger.info(`Admin creating new ${this.resourceName}`, { 
        user: req.user?.username,
        data: req.body
      });

      const created = await this.service.create(req.body);
      res.status(StatusCodes.CREATED).json(created);
    } catch (error) {
      logger.error(`Error creating ${this.resourceName}:`, { error });
      next(error);
    }
  };

  // Override update to add validation
  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
          message: 'Invalid ID format' 
        });
        return;
      }

      const { name } = req.body;
      if (!name) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: 'Name is required' });
        return;
      }

      logger.info(`Admin updating ${this.resourceName}`, { 
        id, 
        user: req.user?.username,
        data: req.body
      });

      const updated = await this.service.update(id, req.body);
      if (!updated) {
        res.status(StatusCodes.NOT_FOUND).json({ 
          message: `${this.resourceName} not found` 
        });
        return;
      }
      res.status(StatusCodes.OK).json(updated);
    } catch (error) {
      logger.error(`Error updating ${this.resourceName}:`, { error });
      next(error);
    }
  };
}

// Create instance
const controller = new AdminLibraryItemTypeControllerClass();

// Export as object for backward compatibility
export const AdminLibraryItemTypeController = {
  getAll: controller.getAll,
  getById: controller.getById,
  create: controller.create,
  update: controller.update,
  delete: controller.delete,
};

export default AdminLibraryItemTypeController;