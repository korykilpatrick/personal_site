import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware'; // Import custom request type
import { StatusCodes } from 'http-status-codes';
import logger from '../../utils/logger';
// Import ProjectModel and shared types
import { ProjectModel, Project, ProjectLink } from '../../models/Project'; // Adjust path if needed
// Correct import path for shared type
import { Project as SharedProject } from '../../../../types'; // Import shared type

// --- CRUD Operations --- 

/**
 * GET /admin/projects
 * Retrieves all projects.
 */
export const getProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    logger.info('Admin fetching all projects', { user: req.user?.username });
    // Use model method
    const projects = await ProjectModel.getAll(); 
    res.status(StatusCodes.OK).json(projects);
  } catch (error) {
    logger.error('Error fetching projects:', { error });
    next(error);
  }
};

/**
 * GET /admin/projects/:id
 * Retrieves a single project by ID.
 */
export const getProjectById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid project ID' });
  }

  try {
    logger.info('Admin fetching project by ID', { user: req.user?.username, id });
    // Use model method
    const project = await ProjectModel.getById(projectId);
    if (!project) {
      logger.warn('Project not found for getById', { id });
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
    }
    res.status(StatusCodes.OK).json(project);
  } catch (error) {
    logger.error('Error fetching project by ID:', { id, error });
    next(error);
  }
};

/**
 * POST /admin/projects
 * Creates a new project.
 */
export const createProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Expect req.body to match Omit<SharedProject, 'id' | 'created_at' | 'updated_at'>
  const projectData: Omit<SharedProject, 'id' | 'created_at' | 'updated_at'> = req.body;

  // Basic validation (improve with Zod/Joi)
  if (!projectData.title || !projectData.description) {
      logger.warn('Project creation validation failed: Missing title or description', { body: req.body });
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Missing required project fields (title, description)' });
  }
  // Add validation for links and tags arrays if needed
  if (!Array.isArray(projectData.links)) projectData.links = [];
  if (!Array.isArray(projectData.tags)) projectData.tags = [];
  if (!Array.isArray(projectData.media_urls)) projectData.media_urls = [];

  try {
    logger.info('Admin creating project', { user: req.user?.username, title: projectData.title });
    
    // Use the model's create method
    // The model expects Project type from model file, ensure SharedProject matches or cast
    const newProject = await ProjectModel.create(projectData as Omit<Project, 'id' | 'created_at' | 'updated_at'>); 
    
    res.status(StatusCodes.CREATED).json(newProject);
  } catch (error) {
    logger.error('Error creating project:', { error });
    next(error);
  }
};

/**
 * PUT /admin/projects/:id
 * Updates an existing project.
 */
export const updateProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid project ID' });
  }

  // Expect req.body to be Partial<Omit<SharedProject, 'id' | 'created_at' | 'updated_at'>>
  const projectData: Partial<Omit<SharedProject, 'id' | 'created_at' | 'updated_at'>> = req.body;

  // Basic validation
  if (Object.keys(projectData).length === 0) {
    logger.warn('Project update attempted with empty body', { id });
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No update data provided' });
  }
  // Ensure arrays if present (model handles stringification)
  if (projectData.links !== undefined && !Array.isArray(projectData.links)) {
      logger.warn('Project update validation failed: Invalid links format', { id, body: req.body });
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid links format, expected array' });
  }
  if (projectData.tags !== undefined && !Array.isArray(projectData.tags)) {
      logger.warn('Project update validation failed: Invalid tags format', { id, body: req.body });
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid tags format, expected array' });
  }
   if (projectData.media_urls !== undefined && !Array.isArray(projectData.media_urls)) {
      logger.warn('Project update validation failed: Invalid media_urls format', { id, body: req.body });
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid media_urls format, expected array' });
  }

  try {
    logger.info('Admin updating project', { user: req.user?.username, id });
    
    // Use the model's update method
    const updatedProject = await ProjectModel.update(projectId, projectData as Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>);

    if (!updatedProject) {
      logger.warn('Project not found for update', { id });
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
    }

    res.status(StatusCodes.OK).json(updatedProject);
  } catch (error) {
    logger.error('Error updating project:', { id, error });
    next(error);
  }
};

/**
 * DELETE /admin/projects/:id
 * Deletes a specific project.
 */
export const deleteProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid project ID' });
  }

  try {
    logger.info('Admin deleting project', { user: req.user?.username, id });
    // Use model method
    const deleted = await ProjectModel.delete(projectId);

    // Adjust check based on model's delete return type (boolean)
    if (!deleted) { 
      logger.warn('Project not found for deletion or delete failed', { id });
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found or could not be deleted' });
    }

    res.status(StatusCodes.NO_CONTENT).send(); 
  } catch (error) {
    logger.error('Error deleting project:', { id, error });
    next(error);
  }
}; 