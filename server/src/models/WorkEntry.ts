import { BaseModel } from './BaseModel';
// Import correct types from shared/root types location
import { WorkEntry as SharedWorkEntry, WorkEntryLink } from '../../../types';
import { db } from '../db/connection'; // Import db

// Database model with work_entry_links as JSON string
export interface WorkEntryDB extends SharedWorkEntry {
  work_entry_links: string; // JSON string in DB - updated column name
  links?: never; // Override links to make it never to avoid type conflicts
}

/**
 * WorkEntry model with database operations
 */
class WorkEntryModelClass extends BaseModel<WorkEntryDB> {
  constructor() {
    super('work_entries', 'created_at', 'desc');
  }

  /**
   * Convert DB record to API model
   */
  private toApiModel(dbRecord: WorkEntryDB): SharedWorkEntry {
    const { work_entry_links, ...rest } = dbRecord; // Updated column name
    let parsedLinks: WorkEntryLink[] = []; // Define WorkLink if not already defined, or use 'any[]'

    try {
      parsedLinks = JSON.parse(work_entry_links || '[]'); // Updated column name
    } catch (error) {
      console.error(`Error parsing work_entry_links for work entry ID ${dbRecord.id}:`, work_entry_links, error);
      // Default to an empty array if parsing fails
    }

    return {
      ...rest,
      links: parsedLinks,
    };
  }

  /**
   * Convert API model to DB record
   */
  private toDbModel(apiModel: Partial<SharedWorkEntry>): Partial<WorkEntryDB> {
    const { links, ...rest } = apiModel;
    const dbModel: Partial<WorkEntryDB> = { ...rest };
    
    if (links !== undefined) {
      dbModel.work_entry_links = JSON.stringify(links || []); // Updated column name
    }
    
    return dbModel;
  }

  /**
   * Override the BaseModel methods to handle JSON conversion
   */

  /**
   * Get all work entries
   */
  override async getAll(): Promise<WorkEntryDB[]> {
    const workEntries = await super.getAll();
    return workEntries;
  }

  /**
   * Get all work entries as API model
   */
  async getAllApi(): Promise<SharedWorkEntry[]> {
    const workEntries = await super.getAll();
    return workEntries.map(workEntry => this.toApiModel(workEntry));
  }

  /**
   * Get a work entry by ID
   */
  override async getById(id: number): Promise<WorkEntryDB | null> {
    return super.getById(id);
  }

  /**
   * Get a work entry by ID as API model
   */
  async getByIdApi(id: number): Promise<SharedWorkEntry | null> {
    const workEntry = await super.getById(id);
    if (!workEntry) return null;
    return this.toApiModel(workEntry);
  }

  /**
   * Create a new work entry
   */
  override async create(dbWorkEntry: Omit<WorkEntryDB, 'id' | 'created_at' | 'updated_at'>): Promise<WorkEntryDB> {
    return super.create(dbWorkEntry);
  }

  /**
   * Create a new work entry from API model
   */
  async createFromApi(workEntry: Omit<SharedWorkEntry, 'id' | 'created_at' | 'updated_at'>): Promise<SharedWorkEntry> {
    const dbWorkEntry = this.toDbModel(workEntry) as Omit<WorkEntryDB, 'id' | 'created_at' | 'updated_at'>;
    const newWorkEntry = await super.create(dbWorkEntry);
    return this.toApiModel(newWorkEntry);
  }

  /**
   * Update a work entry
   */
  override async update(id: number, data: Partial<WorkEntryDB>): Promise<WorkEntryDB | null> {
    return super.update(id, data);
  }

  /**
   * Update a work entry from API model
   */
  async updateFromApi(id: number, workEntry: Partial<Omit<SharedWorkEntry, 'id' | 'created_at' | 'updated_at'>>): Promise<SharedWorkEntry | null> {
    const dbWorkEntry = this.toDbModel(workEntry);
    const updatedWorkEntry = await super.update(id, dbWorkEntry);
    if (!updatedWorkEntry) return null;
    return this.toApiModel(updatedWorkEntry);
  }

  /**
   * Get the total count of work entries
   */
  async getCount(): Promise<number> {
    // Use the Knex instance directly via this.query() if BaseModel provides it,
    // otherwise use the imported db instance.
    const result = await this.query().count('id as count').first(); 
    // OR: const result = await db(this.tableName).count('id as count').first();
    
    return parseInt(result?.count?.toString() || '0', 10);
  }
}

// Export a singleton instance
export const WorkEntryModel = new WorkEntryModelClass();

export default WorkEntryModel;