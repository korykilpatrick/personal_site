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

  /**
   * Get the total count of records in the table
   */
  async count(): Promise<number> {
    const result = await this.query().count<{ count: string | number }>('id as count').first();
    // The count result might be a string or number depending on the DB driver, ensure it's a number
    return parseInt(result?.count?.toString() || '0', 10);
  }

  // --- Many-to-Many Relationship Helpers ---

  /**
   * Find related records through a join table.
   * @param relatedTableName - The name of the table for the related records.
   * @param joinTableName - The name of the join table.
   * @param foreignKey - The foreign key column name in the join table pointing to THIS model's table.
   * @param relatedForeignKey - The foreign key column name in the join table pointing to the RELATED model's table.
   * @param id - The ID of the current model instance.
   * @param relatedColumns - Columns to select from the related table (default: ['*']).
   * @param relatedSortField - Field to sort related records by (default: 'id').
   * @param relatedSortOrder - Sort order for related records (default: 'asc').
   * @returns Promise<RelatedType[]> - Array of related records.
   */
  async findRelated<RelatedType>(
    relatedTableName: string,
    joinTableName: string,
    foreignKey: string,
    relatedForeignKey: string,
    id: number,
    relatedColumns: string[] = ['*'],
    relatedSortField: string = 'id', // Default sort field for related items
    relatedSortOrder: 'asc' | 'desc' = 'asc' // Default sort order
  ): Promise<RelatedType[]> {
    // Use direct table name qualification instead of alias
    const selectColumns = relatedColumns.map(col => `${relatedTableName}.${col}`);
    
    return this.db(relatedTableName) // Query from the related table directly
      .join(joinTableName, `${relatedTableName}.id`, '=', `${joinTableName}.${relatedForeignKey}`)
      .where(`${joinTableName}.${foreignKey}`, id)
      .select(selectColumns)
      .orderBy(`${relatedTableName}.${relatedSortField}`, relatedSortOrder);
  }

  /**
   * Attach a related record by creating an entry in the join table.
   * @param joinTableName - The name of the join table.
   * @param foreignKey - The foreign key column name for THIS model.
   * @param relatedForeignKey - The foreign key column name for the RELATED model.
   * @param id - The ID of the current model instance.
   * @param relatedId - The ID of the related model instance to attach.
   * @returns Promise<void>
   */
  async attach(
    joinTableName: string,
    foreignKey: string,
    relatedForeignKey: string,
    id: number,
    relatedId: number
  ): Promise<void> {
    const existing = await this.db(joinTableName)
      .where({ [foreignKey]: id, [relatedForeignKey]: relatedId })
      .first();

    if (!existing) {
      await this.db(joinTableName).insert({ 
        [foreignKey]: id, 
        [relatedForeignKey]: relatedId 
      });
    }
  }

  /**
   * Detach a related record by removing the entry from the join table.
   * @param joinTableName - The name of the join table.
   * @param foreignKey - The foreign key column name for THIS model.
   * @param relatedForeignKey - The foreign key column name for the RELATED model.
   * @param id - The ID of the current model instance.
   * @param relatedId - The ID of the related model instance to detach.
   * @returns Promise<boolean> - True if a record was deleted, false otherwise.
   */
  async detach(
    joinTableName: string,
    foreignKey: string,
    relatedForeignKey: string,
    id: number,
    relatedId: number
  ): Promise<boolean> {
    const deleted = await this.db(joinTableName)
      .where({ [foreignKey]: id, [relatedForeignKey]: relatedId })
      .delete();
    return deleted > 0;
  }
}