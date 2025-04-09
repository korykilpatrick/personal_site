import { db } from '../db/connection';
import { Knex } from 'knex';
import { BaseRecord } from '@shared/index';

/**
 * Generic base model with common CRUD operations
 */
export class BaseModel<T extends BaseRecord> {
  protected tableName: string;
  protected db: Knex;
  protected sortField: string;
  protected sortOrder: 'asc' | 'desc';

  constructor(
    tableName: string, 
    sortField = 'id', 
    sortOrder: 'asc' | 'desc' = 'asc'
  ) {
    this.tableName = tableName;
    this.db = db;
    this.sortField = sortField;
    this.sortOrder = sortOrder;
  }

  /**
   * Get all records from the table
   */
  async getAll(): Promise<T[]> {
    return this.db(this.tableName)
      .select('*')
      .orderBy(this.sortField, this.sortOrder);
  }

  /**
   * Get a record by ID
   */
  async getById(id: number): Promise<T | null> {
    const record = await this.db(this.tableName).where({ id }).first();
    return record || null;
  }

  /**
   * Create a new record
   */
  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    const [newRecord] = await this.db(this.tableName)
      .insert(data)
      .returning('*');
    return newRecord;
  }

  /**
   * Update a record
   */
  async update(id: number, data: Partial<T>): Promise<T | null> {
    // Add updated_at timestamp
    const updateData = {
      ...data,
      updated_at: new Date(),
    };
    
    const [updatedRecord] = await this.db(this.tableName)
      .where({ id })
      .update(updateData)
      .returning('*');
    
    return updatedRecord || null;
  }

  /**
   * Delete a record
   */
  async delete(id: number): Promise<boolean> {
    const deleted = await this.db(this.tableName).where({ id }).delete();
    return deleted > 0;
  }

  /**
   * Get records with a where clause
   */
  async getWhere(whereClause: Partial<T>): Promise<T[]> {
    return this.db(this.tableName)
      .where(whereClause)
      .orderBy(this.sortField, this.sortOrder);
  }

  /**
   * Get a single record with a where clause
   */
  async getOneWhere(whereClause: Partial<T>): Promise<T | null> {
    const record = await this.db(this.tableName).where(whereClause).first();
    return record || null;
  }

  /**
   * Custom query builder - returns a Knex query builder for complex queries
   */
  query(): Knex.QueryBuilder<T> {
    return this.db(this.tableName);
  }
}