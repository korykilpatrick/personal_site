import express from 'express';
import { login } from '../controllers/authController';
// Import input validation middleware if needed
// import { validateLogin } from '../middleware/validators/authValidator';

const router = express.Router();

// POST /api/auth/login
// router.post('/login', validateLogin, login); // Add validation later
router.post('/login', login);

export default router;
