import express from 'express';
import { protect } from '../middleware/authMiddleware';
// Import admin controllers
import { getProjects, createProject, updateProject, deleteProject, getProjectById } from '../controllers/admin/projectController';
import { 
  getWorkEntries, 
  createWorkEntry, 
  updateWorkEntry, 
  deleteWorkEntry, 
  getWorkEntryById
} from '../controllers/admin/workController';

const router = express.Router();

// Apply protect middleware to all routes in this file
router.use(protect);

// Optional: Add admin role check if implemented
// import { isAdmin } from '../middleware/authMiddleware';
// router.use(isAdmin);

// --- Project Routes ---
router.route('/projects')
  .get(getProjects) // Get all projects
  .post(createProject); // Create a new project

router.route('/projects/:id')
  .get(getProjectById) // Add GET handler for single project
  .put(updateProject) // Update a specific project
  .delete(deleteProject); // Delete a specific project

// --- Work Entry Routes ---
router.route('/work')
  .get(getWorkEntries)       // Use implemented controller
  .post(createWorkEntry);      // Use implemented controller

router.route('/work/:id')
  .get(getWorkEntryById)     // Use implemented controller
  .put(updateWorkEntry)      // Use implemented controller
  .delete(deleteWorkEntry);   // Use implemented controller

export default router;
