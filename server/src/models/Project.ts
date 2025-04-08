import { db } from '../db/connection';

export interface ProjectLink {
  title: string;
  url: string;
  icon?: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  media_urls: string[];
  links: ProjectLink[];
  writeup?: string;
  tags?: string[];
  created_at: Date;
  updated_at: Date;
}

/**
 * Project model with database operations
 */
export const ProjectModel = {
  /**
   * Get all projects
   */
  getAll: async (): Promise<Project[]> => {
    const projects = await db('projects').select('*').orderBy('created_at', 'desc');
    
    // Parse JSON fields
    return projects.map((project) => ({
      ...project,
      // media_urls is already in JSONB format, no need to parse
      media_urls: project.media_urls || [],
      links: JSON.parse(project.project_links || '[]'),
      tags: JSON.parse(project.project_tags || '[]'),
    }));
  },

  /**
   * Get a project by ID
   */
  getById: async (id: number): Promise<Project | null> => {
    const project = await db('projects').where({ id }).first();
    
    if (!project) return null;
    
    // Parse JSON fields
    return {
      ...project,
      // media_urls is already in JSONB format, no need to parse
      media_urls: project.media_urls || [],
      links: JSON.parse(project.project_links || '[]'),
      tags: JSON.parse(project.project_tags || '[]'),
    };
  },

  /**
   * Get projects by tag
   */
  getByTag: async (tag: string): Promise<Project[]> => {
    // Search for projects containing the tag in their tags text field
    const projects = await db('projects')
      .whereRaw("project_tags LIKE ?", [`%${tag}%`])
      .orderBy('created_at', 'desc');
    
    // Parse JSON fields
    return projects.map((project) => ({
      ...project,
      // media_urls is already in JSONB format, no need to parse
      media_urls: project.media_urls || [],
      links: JSON.parse(project.project_links || '[]'),
      tags: JSON.parse(project.project_tags || '[]'),
    }));
  },

  /**
   * Create a new project
   */
  create: async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> => {
    // Stringify JSON fields
    const { links, tags, ...rest } = project;
    const projectData = {
      ...rest,
      // media_urls should be passed directly as it's a JSONB field
      media_urls: project.media_urls || [],
      project_links: JSON.stringify(links || []),
      project_tags: JSON.stringify(tags || []),
    };
    
    
    const [newProject] = await db('projects').insert(projectData).returning('*');
    
    // Parse JSON fields in the returned project
    return {
      ...newProject,
      media_urls: newProject.media_urls || [],
      links: JSON.parse(newProject.project_links || '[]'),
      tags: JSON.parse(newProject.project_tags || '[]'),
    };
  },

  /**
   * Update a project
   */
  update: async (id: number, project: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>): Promise<Project | null> => {
    // Extract links and tags if they exist
    const { links, tags, ...rest } = project;
    
    // Prepare update data
    const updateData: any = { ...rest, updated_at: new Date() };
    
    // Stringify JSON fields if they exist
    // Pass media_urls directly as it's a JSONB field
    if (project.media_urls) updateData.media_urls = project.media_urls;
    if (links) updateData.project_links = JSON.stringify(links);
    if (tags) updateData.project_tags = JSON.stringify(tags);
    
    const [updatedProject] = await db('projects')
      .where({ id })
      .update(updateData)
      .returning('*');
    
    if (!updatedProject) return null;
    
    // Parse JSON fields
    return {
      ...updatedProject,
      media_urls: updatedProject.media_urls || [],
      links: JSON.parse(updatedProject.project_links || '[]'),
      tags: JSON.parse(updatedProject.project_tags || '[]'),
    };
  },

  /**
   * Delete a project
   */
  delete: async (id: number): Promise<boolean> => {
    const deleted = await db('projects').where({ id }).delete();
    return deleted > 0;
  },
};

export default ProjectModel;