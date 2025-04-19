import express from 'express';
import { login } from '../controllers/authController';
import rateLimit from 'express-rate-limit'; // Import rate-limit
// Import input validation middleware if needed
// import { validateLogin } from '../middleware/validators/authValidator';

// Define rate limiter options
const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 login requests per `window` (here, per 15 minutes)
	message: 'Too many login attempts from this IP, please try again after 15 minutes',
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const router = express.Router();

// POST /api/auth/login
// Apply the rate limiting middleware to the login route
// router.post('/login', validateLogin, login); // Add validation later
router.post('/login', loginLimiter, login); // Apply limiter before the login controller

export default router;
