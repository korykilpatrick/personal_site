import { BaseModel } from './BaseModel';
import { Project as SharedProject, ProjectLink } from '../../../types'; 

// Helper type for DB representation
type ProjectDbRecord = Omit<SharedProject, 'links' | 'tags' | 'media_urls'> & {
  media_urls: string[] | string;
  project_links?: ProjectLink[] | string; // Use actual DB column name
  project_tags?: string[] | string;      // Use actual DB column name
};
type ProjectDbWriteRecord = Omit<ProjectDbRecord, 'id' | 'created_at' | 'updated_at'>;

// Helper function to map SharedProject to DB record structure
const mapToDbRecord = ({ links, tags, ...projectData }: Partial<SharedProject>): Partial<ProjectDbWriteRecord> => {
  return {
    ...projectData,
    ...(links !== undefined ? { project_links: links } : {}),
    ...(tags !== undefined ? { project_tags: tags } : {}),
  };
};

const stringifyProjectJsonFields = (
  projectData: Partial<ProjectDbWriteRecord>
): Partial<ProjectDbWriteRecord> => {
  const dbData = { ...projectData };

  if (Array.isArray(dbData.project_links)) {
    dbData.project_links = JSON.stringify(dbData.project_links);
  }
  if (Array.isArray(dbData.project_tags)) {
    dbData.project_tags = JSON.stringify(dbData.project_tags);
  }
  if (Array.isArray(dbData.media_urls)) {
    dbData.media_urls = JSON.stringify(dbData.media_urls);
  }

  return dbData;
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
    const dbDataForInsert = stringifyProjectJsonFields(mapToDbRecord(projectData));
    const [createdDbRecord] = await this.db(this.tableName)
      .insert(dbDataForInsert)
      .returning('id');
    const createdProjectId =
      typeof createdDbRecord === 'object' && createdDbRecord !== null
        ? createdDbRecord.id
        : createdDbRecord;
    
    // Fetch the newly created record using getByIdApi to ensure correct mapping back
    const newProject = await this.getByIdApi(Number(createdProjectId));
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
    const dbDataForUpdate = stringifyProjectJsonFields(dbDataInput);
    const [updatedRecord] = await this.db(this.tableName)
      .where({ id })
      .update({
        ...dbDataForUpdate,
        updated_at: new Date(),
      })
      .returning('id');
    
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
