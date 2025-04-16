import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware'; // Import custom request type
import { StatusCodes } from 'http-status-codes';
import logger from '../../utils/logger';
import { db as knex } from '../../db/connection'; // Use named import and alias if desired

const PROJECTS_TABLE = 'projects';

// Helper function to update the updated_at timestamp
const updateTimestamp = (queryBuilder: any) => {
    queryBuilder.update({ updated_at: knex.fn.now() });
};

// Basic validation (can be expanded or moved to middleware)
const validateProjectInput = (input: any) => {
  if (!input || typeof input !== 'object') return 'Invalid input: project data missing';
  if (!input.title || typeof input.title !== 'string' || input.title.trim() === '') {
    return 'Invalid input: title is required';
  }
  if (!input.description || typeof input.description !== 'string' || input.description.trim() === '') {
    return 'Invalid input: description is required';
  }
  // Add more checks for other fields (types, formats) if needed
  // e.g., check if media_urls is valid JSON, links/tags are strings
  return null; // No validation errors
};

// --- CRUD Operations --- 

/**
 * GET /admin/projects
 * Retrieves all projects.
 */
export const getProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    logger.info('Admin fetching all projects', { user: req.user?.username });
    const projects = await knex(PROJECTS_TABLE).select('*').orderBy('created_at', 'desc');
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
  try {
    logger.info('Admin fetching project by ID', { user: req.user?.username, id });
    const project = await knex(PROJECTS_TABLE).where({ id }).first();
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
  const validationError = validateProjectInput(req.body);
  if (validationError) {
      logger.warn('Project creation validation failed', { error: validationError, body: req.body });
      return res.status(StatusCodes.BAD_REQUEST).json({ message: validationError });
  }

  const { title, description, media_urls, project_links, writeup, project_tags } = req.body;

  // Ensure jsonb fields are stringified if needed, though Knex might handle objects
  const projectData = {
    title,
    description,
    media_urls: media_urls ? JSON.stringify(media_urls) : null, // Assuming input is object
    project_links,
    writeup,
    project_tags,
    // created_at and updated_at have defaults
  };

  try {
    logger.info('Admin creating project', { user: req.user?.username, title });
    const [newProject] = await knex(PROJECTS_TABLE).insert(projectData).returning('*');
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
  const validationError = validateProjectInput(req.body);
  if (validationError) {
      logger.warn('Project update validation failed', { id, error: validationError, body: req.body });
      return res.status(StatusCodes.BAD_REQUEST).json({ message: validationError });
  }

  const { title, description, media_urls, project_links, writeup, project_tags } = req.body;
  const projectData = {
    title,
    description,
    media_urls: media_urls ? JSON.stringify(media_urls) : null, // Assuming input is object
    project_links,
    writeup,
    project_tags,
    updated_at: knex.fn.now(), // Manually update timestamp
  };

  try {
    logger.info('Admin updating project', { user: req.user?.username, id });
    const updatedCount = await knex(PROJECTS_TABLE)
      .where({ id })
      .update(projectData);

    if (updatedCount === 0) {
      logger.warn('Project not found for update', { id });
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
    }

    // Fetch the updated project to return it
    const updatedProject = await knex(PROJECTS_TABLE).where({ id }).first();
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

  try {
    logger.info('Admin deleting project', { user: req.user?.username, id });
    const deletedCount = await knex(PROJECTS_TABLE).where({ id }).del();

    if (deletedCount === 0) {
      logger.warn('Project not found for deletion', { id });
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
    }

    res.status(StatusCodes.NO_CONTENT).send(); // Standard practice for DELETE
  } catch (error) {
    logger.error('Error deleting project:', { id, error });
    next(error);
  }
}; 