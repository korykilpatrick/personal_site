import { BaseModel } from './BaseModel';
import { Project as SharedProject, ProjectLink } from '../../../types'; 

// Helper type for DB representation
type ProjectDbRecord = Omit<SharedProject, 'links' | 'tags'> & {
  project_links?: ProjectLink[]; // Use actual DB column name
  project_tags?: string[];      // Use actual DB column name
};

// Helper function to map SharedProject to DB record structure
const mapToDbRecord = (projectData: Partial<SharedProject>): Partial<ProjectDbRecord> => {
  const dbRecord: Partial<ProjectDbRecord> = { ...projectData }; // Copy other fields
  
  if ('links' in projectData) {
    dbRecord.project_links = projectData.links; // Map links to project_links
    delete (dbRecord as Partial<SharedProject>).links; // Remove original key
  }
  if ('tags' in projectData) {
    dbRecord.project_tags = projectData.tags; // Map tags to project_tags
    delete (dbRecord as Partial<SharedProject>).tags; // Remove original key
  }
  return dbRecord;
};

/**
 * Project model using BaseModel for CRUD operations.
 * Handles JSONB columns directly via Knex.
 */
class ProjectModelClass extends BaseModel<SharedProject> { // Still uses SharedProject for external interface
  constructor() {
    // Default sort by creation date, descending
    super('projects', 'created_at', 'desc'); 
  }

  // --- Public API Methods ---
  // These methods handle the mapping between API structure (SharedProject) 
  // and the DB structure (using column aliases).

  /**
   * Get all projects, mapping DB columns to SharedProject fields.
   */
  async getAllApi(): Promise<SharedProject[]> {
    return this.query()
      .select(
        'id', 'title', 'description', 'media_urls', 'writeup', 
        'created_at', 'updated_at',
        'project_links as links', // Alias DB column to expected field name
        'project_tags as tags'      // Alias DB column to expected field name
      )
      .orderBy(this.sortField, this.sortOrder);
  }

  /**
   * Get a project by ID, mapping DB columns to SharedProject fields.
   */
  async getByIdApi(id: number): Promise<SharedProject | null> {
    const project = await this.query()
      .select(
        'id', 'title', 'description', 'media_urls', 'writeup', 
        'created_at', 'updated_at',
        'project_links as links',
        'project_tags as tags'
      )
      .where({ id })
      .first();
    return project || null;
  }

  /**
   * Create a new project, handling field mapping and JSON stringification.
   */
  async createFromApi(projectData: Omit<SharedProject, 'id' | 'created_at' | 'updated_at'>): Promise<SharedProject> {
    const dbDataInput = mapToDbRecord(projectData);

    // Explicitly stringify JSONB fields before passing to BaseModel.create
    const dbDataForInsert = { ...dbDataInput };
    if ('project_links' in dbDataForInsert && dbDataForInsert.project_links) {
      dbDataForInsert.project_links = JSON.stringify(dbDataForInsert.project_links) as any; 
    }
    if ('project_tags' in dbDataForInsert && dbDataForInsert.project_tags) {
      dbDataForInsert.project_tags = JSON.stringify(dbDataForInsert.project_tags) as any; 
    }
    
    // Call base create with the mapped and explicitly stringified data
    const createdDbRecord = await super.create(dbDataForInsert as any);
    
    // Fetch the newly created record using getByIdApi to ensure correct mapping back
    const newProject = await this.getByIdApi(createdDbRecord.id);
    if (!newProject) {
        throw new Error('Failed to fetch project immediately after creation.');
    }
    return newProject; 
  }

  /**
   * Update a project, handling field mapping and JSON stringification.
   */
  async updateFromApi(id: number, projectData: Partial<Omit<SharedProject, 'id' | 'created_at' | 'updated_at'>>): Promise<SharedProject | null> {
     if (Object.keys(projectData).length === 0) {
        return this.getByIdApi(id);
    }

    const dbDataInput = mapToDbRecord(projectData);

    // Explicitly stringify JSONB fields before passing to BaseModel.update
    const dbDataForUpdate = { ...dbDataInput };
     if ('project_links' in dbDataForUpdate && dbDataForUpdate.project_links) {
      dbDataForUpdate.project_links = JSON.stringify(dbDataForUpdate.project_links) as any;
    }
    if ('project_tags' in dbDataForUpdate && dbDataForUpdate.project_tags) {
      dbDataForUpdate.project_tags = JSON.stringify(dbDataForUpdate.project_tags) as any;
    }
    // Add stringification for media_urls
    if ('media_urls' in dbDataForUpdate && dbDataForUpdate.media_urls) {
      dbDataForUpdate.media_urls = JSON.stringify(dbDataForUpdate.media_urls) as any;
    }

    // Call base update with the mapped and explicitly stringified data
    const updatedRecord = await super.update(id, dbDataForUpdate as any);
    
    if (!updatedRecord) return null;
    // Fetch the full record using getByIdApi to ensure correct field names are returned
    return this.getByIdApi(id); 
  }

  /**
   * Get projects by tag (custom logic, already handles mapping on select)
   */
  async getByTag(tag: string): Promise<SharedProject[]> {
    const projects = await this.query()
      .select(
        'id', 'title', 'description', 'media_urls', 'writeup', 
        'created_at', 'updated_at',
        'project_links as links',
        'project_tags as tags'
      )
      .whereRaw('project_tags @> ?::jsonb', [JSON.stringify([tag])])
      .orderBy(this.sortField, this.sortOrder);
    return projects; 
  }

  // Note: Base model methods (getAll, getById, create, update, delete) 
  // if called directly, would NOT handle the links/tags mapping correctly.
  // Always use the *Api methods defined here for Project interactions.
}

// Export a singleton instance
export const ProjectModel = new ProjectModelClass();

export default ProjectModel;