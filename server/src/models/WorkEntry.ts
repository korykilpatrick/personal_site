import { BaseModel } from './BaseModel';
import { WorkEntry as SharedWorkEntry, WorkEntryLink } from '../../../types';

/**
 * Represents the structure of the work_entries table in the database,
 * acknowledging that links will be stringified before DB operations.
 */
interface WorkEntryDbRecord extends Omit<SharedWorkEntry, 'links'> {
  work_entry_links?: string | null; // Changed type to string | null
}

/**
 * Helper function to map SharedWorkEntry to DB record structure
 */
const mapToDbRecord = (workData: Partial<SharedWorkEntry>): Partial<WorkEntryDbRecord> => {
  const dbRecord: Partial<WorkEntryDbRecord> = { ...workData }; // Copy non-link fields
  
  // Map links to work_entry_links only if links is present in workData
  if ('links' in workData) {
    // Explicitly stringify the links array for the JSONB column
    dbRecord.work_entry_links = workData.links ? JSON.stringify(workData.links) : null;
    delete (dbRecord as Partial<SharedWorkEntry>).links; 
  }
  
  return dbRecord;
};

/**
 * Helper function to map DB record structure back to SharedWorkEntry
 * (used after create/update operations that return the DB record)
 */
const mapToSharedWorkEntry = (dbRecord: any | null): SharedWorkEntry | null => {
  // Accept 'any' here because the record returned by super.create/update might
  // not perfectly match WorkEntryDbRecord if base model returns generic T.
  if (!dbRecord) return null;
  
  // Perform a safer copy
  const { work_entry_links, ...rest } = dbRecord;
  const sharedEntry: SharedWorkEntry = { ...rest } as SharedWorkEntry;

  // Try to parse work_entry_links if it exists and is a string
  let parsedLinks: WorkEntryLink[] = [];
  if (typeof work_entry_links === 'string') {
    try {
      const parsed = JSON.parse(work_entry_links);
      if (Array.isArray(parsed)) {
        // Basic validation: Check if items look like WorkEntryLink (optional)
        parsedLinks = parsed; // Assume structure is correct for now
      }
    } catch (e) {
      console.error('Failed to parse work_entry_links from DB', e);
      // Keep parsedLinks as empty array
    }
  } else if (Array.isArray(work_entry_links)) {
    // If Knex/pg already parsed it into an array (common on read)
    parsedLinks = work_entry_links;
  }
  
  sharedEntry.links = parsedLinks;

  return sharedEntry;
};

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
   * Handles mapping `links` to `work_entry_links`.
   */
  async createFromApi(workEntry: Omit<SharedWorkEntry, 'id' | 'created_at' | 'updated_at'>): Promise<SharedWorkEntry> {
    const dbRecordData = mapToDbRecord(workEntry);
    
    // Ensure all required fields for creation are present (adjust if base model handles defaults)
    // Here, we assume workEntry provides all necessary fields for a new record.
    // The cast to Partial<SharedWorkEntry> for super.create might still be needed
    // depending on BaseModel's generic constraints, but the input *data* 
    // (dbRecordData) should represent a complete record for creation.
    
    // Use the inherited create method with the mapped data
    // Cast dbRecordData to the expected input type for super.create
    const createdDbRecord = await super.create(dbRecordData as Omit<SharedWorkEntry, 'id' | 'created_at' | 'updated_at'>); 

    // Map the returned DB record back to the shared type
    // Use a non-null assertion as create should always return a record or throw
    return mapToSharedWorkEntry(createdDbRecord)!; // Pass the raw returned record
  }

  /**
   * Update a work entry.
   * Handles mapping `links` to `work_entry_links`.
   */
  async updateFromApi(id: number, workEntryUpdate: Partial<Omit<SharedWorkEntry, 'id' | 'created_at' | 'updated_at'>>): Promise<SharedWorkEntry | null> {
    if (Object.keys(workEntryUpdate).length === 0) {
      return this.getByIdApi(id); // Return existing if update is empty
    }

    const dbRecordUpdate = mapToDbRecord(workEntryUpdate);
    
    // Use the inherited update method. Cast the update payload appropriately.
    const updatedDbRecord = await super.update(id, dbRecordUpdate as Partial<SharedWorkEntry>); 
    
    if (!updatedDbRecord) return null;
    
    // Map the returned DB record back to the shared type
    return mapToSharedWorkEntry(updatedDbRecord); // Pass the raw returned record
  }
  
  // Inherited methods now operate on SharedWorkEntry directly
}

// Export a singleton instance
export const WorkEntryModel = new WorkEntryModelClass();

export default WorkEntryModel;