import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import ProjectModel from '../models/Project';
import logger from '../utils/logger';

/**
 * ProjectController for handling project-related requests
 */
export const ProjectController = {
  /**
   * Get all projects
   */
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tag } = req.query;
      
      let projects;
      if (tag && typeof tag === 'string') {
        projects = await ProjectModel.getByTag(tag);
      } else {
        projects = await ProjectModel.getAllApi();
      }
      
      res.status(StatusCodes.OK).json(projects);
    } catch (error) {
      logger.error('Error fetching projects', { error, query: req.query });
      next(error);
    }
  },

  /**
   * Get a project by ID
   */
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const project = await ProjectModel.getByIdApi(id);
      
      if (!project) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
      }
      
      res.status(StatusCodes.OK).json(project);
    } catch (error) {
      logger.error('Error fetching project', { error, projectId: req.params.id });
      next(error);
    }
  },

  /**
   * Create a new project
   */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newProject = await ProjectModel.createFromApi(req.body);
      res.status(StatusCodes.CREATED).json(newProject);
    } catch (error) {
      logger.error('Error creating project', { error, payload: req.body });
      next(error);
    }
  },

  /**
   * Update a project
   */
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const updatedProject = await ProjectModel.updateFromApi(id, req.body);
      
      if (!updatedProject) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
      }
      
      res.status(StatusCodes.OK).json(updatedProject);
    } catch (error) {
      logger.error('Error updating project', { error, projectId: req.params.id, payload: req.body });
      next(error);
    }
  },

  /**
   * Delete a project
   */
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const deleted = await ProjectModel.delete(id);
      
      if (!deleted) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
      }
      
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      logger.error('Error deleting project', { error, projectId: req.params.id });
      next(error);
    }
  },

  /**
   * Get the total count of projects
   */
  getCount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await ProjectModel.count();
      res.status(StatusCodes.OK).json({ count });
    } catch (error) {
      logger.error('Error fetching project count', { error });
      next(error);
    }
  },
};

export default ProjectController;