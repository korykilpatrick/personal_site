import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../config/config';
import { StatusCodes } from 'http-status-codes';
import logger from '../utils/logger';

// TODO: Replace with actual user retrieval (e.g., from database)
const ADMIN_USERNAME = config.admin.username; 
const ADMIN_PASSWORD_HASH = config.admin.passwordHash; // Store hashed password

/**
 * Handles user login and JWT generation.
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  // Basic validation (improve later)
  if (!username || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Username and password are required' });
  }

  try {
    // Check username 
    if (username !== ADMIN_USERNAME) {
      logger.warn('Login attempt failed: Invalid username', { username });
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!isMatch) {
      logger.warn('Login attempt failed: Invalid password', { username });
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
    }

    // --- User authenticated, generate JWT ---
    const payload = {
      // Add relevant user info here (e.g., id, role) - just username for now
      username: ADMIN_USERNAME,
      // Add role for authorization later if needed
      // role: 'admin' 
    };

    const token = jwt.sign(
      payload,
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions // Explicitly type options
    );

    logger.info('Login successful', { username });
    res.status(StatusCodes.OK).json({ token });

  } catch (error) {
    logger.error('Login error', { error });
    next(error); // Pass to global error handler
  }
};