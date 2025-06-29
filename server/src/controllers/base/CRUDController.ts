import { Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BaseRecord } from '@shared/index';
import { BaseModel } from '../../models/BaseModel';
import { BaseService } from '../../services/BaseService';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import logger from '../../utils/logger';

/**
 * Generic CRUD Controller for handling common CRUD operations
 * Eliminates duplicated code across entity controllers
 */
export class CRUDController<T extends BaseRecord> {
  protected service: BaseService<T>;

  constructor(
    protected model: BaseModel<T>,
    protected resourceName: string,
    service?: BaseService<T>
  ) {
    this.service = service || new BaseService<T>(model, resourceName);
  }

  /**
   * Get all resources
   */
  getAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info(`Admin fetching all ${this.resourceName}`, { 
        user: req.user?.username 
      });
      const items = await this.service.getAll();
      res.status(StatusCodes.OK).json(items);
    } catch (error) {
      logger.error(`Error fetching ${this.resourceName}:`, { error });
      next(error);
    }
  };

  /**
   * Get resource by ID
   */
  getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
          message: 'Invalid ID format' 
        });
        return;
      }

      logger.info(`Admin fetching ${this.resourceName} by ID`, { 
        id, 
        user: req.user?.username 
      });

      const item = await this.service.getById(id);
      if (!item) {
        res.status(StatusCodes.NOT_FOUND).json({ 
          message: `${this.resourceName} not found` 
        });
        return;
      }
      res.status(StatusCodes.OK).json(item);
    } catch (error) {
      logger.error(`Error fetching ${this.resourceName} by ID:`, { error });
      next(error);
    }
  };

  /**
   * Create new resource
   */
  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
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

  /**
   * Update existing resource
   */
  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
          message: 'Invalid ID format' 
        });
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

  /**
   * Delete resource
   */
  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
          message: 'Invalid ID format' 
        });
        return;
      }

      logger.info(`Admin deleting ${this.resourceName}`, { 
        id, 
        user: req.user?.username 
      });

      const deleted = await this.service.delete(id);
      if (!deleted) {
        res.status(StatusCodes.NOT_FOUND).json({ 
          message: `${this.resourceName} not found` 
        });
        return;
      }
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      logger.error(`Error deleting ${this.resourceName}:`, { error });
      next(error);
    }
  };

}