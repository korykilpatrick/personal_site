import { BaseModel } from './BaseModel';
import { Project as SharedProject, ProjectLink } from '../../../types'; 

/**
 * Project model using BaseModel for CRUD operations.
 * Handles JSONB columns directly via Knex.
 */
class ProjectModelClass extends BaseModel<SharedProject> { // Use SharedProject directly
  constructor() {
    // Default sort by creation date, descending
    super('projects', 'created_at', 'desc'); 
  }

  // Remove toApiModel and toDbModel methods as Knex handles JSONB

  // --- Public API Methods ---
  // Simplification: The *Api methods are no longer strictly necessary
  // as BaseModel methods now return the correct SharedProject type directly.
  // We can keep them for semantic clarity or remove them and update controllers.
  // Let's keep them for now to minimize controller changes initially.

  /**
   * Get all projects, mapping DB columns to SharedProject fields.
   */
  async getAllApi(): Promise<SharedProject[]> {
    // Explicitly select columns and alias jsonb fields
    // Knex automatically parses JSONB when selected.
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
   * Create a new project.
   * (Alias for inherited create, takes and returns SharedProject)
   */
  async createFromApi(projectData: Omit<SharedProject, 'id' | 'created_at' | 'updated_at'>): Promise<SharedProject> {
    // Base create method works correctly as Knex maps SharedProject fields
    // to columns (including handling jsonb stringification) on insert.
    return super.create(projectData); 
  }

  /**
   * Update a project.
   * (Alias for inherited update, takes and returns SharedProject)
   */
  async updateFromApi(id: number, projectData: Partial<Omit<SharedProject, 'id' | 'created_at' | 'updated_at'>>): Promise<SharedProject | null> {
     // Base update method works correctly for the same reasons as create.
     if (Object.keys(projectData).length === 0) {
        // Fetch using the API-specific method to ensure correct mapping
        return this.getByIdApi(id);
    }
    // Need to fetch the updated record with correct mapping
    const updatedRecord = await super.update(id, projectData);
    if (!updatedRecord) return null;
    // Fetch the full record using getByIdApi to ensure correct field names
    return this.getByIdApi(id); 
  }

  /**
   * Get projects by tag (custom logic)
   */
  async getByTag(tag: string): Promise<SharedProject[]> {
    // Query needs to select and alias columns correctly as well.
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

  // Inherited methods now operate on SharedProject directly:
  // - getAll(): Promise<SharedProject[]>
  // - getById(id: number): Promise<SharedProject | null>
  // - create(data: Omit<SharedProject, 'id' | 'created_at' | 'updated_at'>): Promise<SharedProject>
  // - update(id: number, data: Partial<SharedProject>): Promise<SharedProject | null>
  // - delete(id: number): Promise<boolean>
  // - count(): Promise<number>
  // - getWhere(whereClause: Partial<SharedProject>): Promise<SharedProject[]>
  // - getOneWhere(whereClause: Partial<SharedProject>): Promise<SharedProject | null>
  // - query(): Knex.QueryBuilder<SharedProject>
}

// Export a singleton instance
export const ProjectModel = new ProjectModelClass();

export default ProjectModel;