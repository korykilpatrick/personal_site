import { BaseModel } from '../models/BaseModel';
import { BaseRecord } from '@shared/index';
import logger from '../utils/logger';

/**
 * Base service with common business logic operations
 */
export class BaseService<T extends BaseRecord> {
  protected model: BaseModel<T>;
  protected entityName: string;

  constructor(model: BaseModel<T>, entityName: string) {
    this.model = model;
    this.entityName = entityName;
  }

  /**
   * Get all records
   */
  async getAll(): Promise<T[]> {
    try {
      return await this.model.getAll();
    } catch (error) {
      logger.error(`Error fetching all ${this.entityName}s`, { error });
      throw error;
    }
  }

  /**
   * Get record by ID
   */
  async getById(id: number): Promise<T | null> {
    try {
      const record = await this.model.getById(id);
      
      if (!record) {
        logger.info(`${this.entityName} not found`, { id });
      }
      
      return record;
    } catch (error) {
      logger.error(`Error fetching ${this.entityName} by ID`, { error, id });
      throw error;
    }
  }

  /**
   * Create a new record
   */
  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    try {
      const newRecord = await this.model.create(data);
      logger.info(`Created new ${this.entityName}`, { id: newRecord.id });
      return newRecord;
    } catch (error) {
      logger.error(`Error creating ${this.entityName}`, { error, data });
      throw error;
    }
  }

  /**
   * Update a record
   */
  async update(id: number, data: Partial<T>): Promise<T | null> {
    try {
      const updatedRecord = await this.model.update(id, data);
      
      if (!updatedRecord) {
        logger.info(`${this.entityName} not found for update`, { id });
      } else {
        logger.info(`Updated ${this.entityName}`, { id });
      }
      
      return updatedRecord;
    } catch (error) {
      logger.error(`Error updating ${this.entityName}`, { error, id, data });
      throw error;
    }
  }

  /**
   * Delete a record
   */
  async delete(id: number): Promise<boolean> {
    try {
      const deleted = await this.model.delete(id);
      
      if (!deleted) {
        logger.info(`${this.entityName} not found for delete`, { id });
      } else {
        logger.info(`Deleted ${this.entityName}`, { id });
      }
      
      return deleted;
    } catch (error) {
      logger.error(`Error deleting ${this.entityName}`, { error, id });
      throw error;
    }
  }

  /**
   * Get the total count of all records
   */
  async getTotalCount(): Promise<number> {
    try {
      return await this.model.count();
    } catch (error) {
      logger.error(`Error fetching total ${this.entityName} count`, { error });
      throw error;
    }
  }

  /**
   * Get count of records matching a where clause
   */
  async getCountWhere(whereClause: Partial<T>): Promise<number> {
    try {
      const result = await this.model.query()
        .where(whereClause as any)
        .count({ count: '*' })
        .first() as { count: string | number };
      return parseInt(result?.count?.toString() || '0', 10);
    } catch (error) {
      logger.error(`Error fetching ${this.entityName} count with conditions`, { error, whereClause });
      throw error;
    }
  }

  /**
   * Get count of active records (for tables with is_active field)
   * Note: This assumes the entity has an is_active field
   */
  async getActiveCount(): Promise<number> {
    return this.getCountWhere({ is_active: true } as unknown as Partial<T>);
  }
}