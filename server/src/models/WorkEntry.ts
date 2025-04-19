import { BaseModel } from './BaseModel';
import { WorkEntry as SharedWorkEntry, WorkEntryLink } from '../../../types';

/**
 * WorkEntry model using BaseModel for CRUD operations.
 * Handles JSONB columns directly via Knex.
 */
class WorkEntryModelClass extends BaseModel<SharedWorkEntry> { // Use SharedWorkEntry directly
  constructor() {
    super('work_entries', 'created_at', 'desc');
  }

  // Remove toApiModel and toDbModel methods

  // --- Public API Methods ---
  // Keep *Api methods for consistency with ProjectModel for now

  /**
   * Get all work entries, mapping DB columns to SharedWorkEntry fields.
   */
  async getAllApi(): Promise<SharedWorkEntry[]> {
    // Select DB columns and alias only where necessary (links)
    return this.query()
      .select(
        'id',
        'company',             // Matches SharedWorkEntry.company
        'role',                // Matches SharedWorkEntry.role
        'duration',            // Matches SharedWorkEntry.duration
        'achievements',        // Matches SharedWorkEntry.achievements
        'work_entry_links as links', // Alias DB column to SharedWorkEntry.links
        'created_at', 
        'updated_at'
      )
      .orderBy('created_at', 'desc'); // Keep default sort or adjust as needed
  }

  /**
   * Get a work entry by ID, mapping DB columns to SharedWorkEntry fields.
   */
  async getByIdApi(id: number): Promise<SharedWorkEntry | null> {
    const workEntry = await this.query()
      .select(
        'id',
        'company',
        'role',
        'duration',
        'achievements',
        'work_entry_links as links',
        'created_at', 
        'updated_at'
      )
      .where({ id })
      .first();
    return workEntry || null;
  }

  /**
   * Create a new work entry.
   * (Alias for inherited create)
   */
  async createFromApi(workEntry: Omit<SharedWorkEntry, 'id' | 'created_at' | 'updated_at'>): Promise<SharedWorkEntry> {
    return super.create(workEntry); // Takes and returns SharedWorkEntry
  }

  /**
   * Update a work entry.
   * (Alias for inherited update)
   */
  async updateFromApi(id: number, workEntry: Partial<Omit<SharedWorkEntry, 'id' | 'created_at' | 'updated_at'>>): Promise<SharedWorkEntry | null> {
    if (Object.keys(workEntry).length === 0) {
        return this.getByIdApi(id);
    }
    const updatedRecord = await super.update(id, workEntry);
    if (!updatedRecord) return null;
    return this.getByIdApi(id);
  }
  
  // Inherited methods now operate on SharedWorkEntry directly
}

// Export a singleton instance
export const WorkEntryModel = new WorkEntryModelClass();

export default WorkEntryModel;