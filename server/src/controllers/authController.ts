import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../config/config';
import { StatusCodes } from 'http-status-codes';
import logger from '../utils/logger';
import { db } from '../db/connection'; // Import Knex instance

// Define a simple user type for clarity
interface User {
  id: number;
  username: string;
  password_hash: string;
}

// Remove hardcoded admin credentials
// const ADMIN_USERNAME = config.admin.username; 
// const ADMIN_PASSWORD_HASH = config.admin.passwordHash; // Store hashed password

/**
 * Handles user login and JWT generation.
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Username and password are required' });
  }

  try {
    // --- Find user in database ---
    const user: User | undefined = await db<User>('users')
      .where({ username: username })
      .first(); // Use .first() to get a single user or undefined

    if (!user) {
      logger.warn('Login attempt failed: Invalid username', { username });
      // Use the same generic message to prevent username enumeration
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' }); 
    }

    // --- Check password ---
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      logger.warn('Login attempt failed: Invalid password', { username });
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });
    }

    // --- User authenticated, generate JWT ---
    const payload = {
      id: user.id, // Include user ID
      username: user.username,
      // role: 'admin' // Add role if implementing roles later
    };

    const token = jwt.sign(
      payload,
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions 
    );

    logger.info('Login successful', { username });
    res.status(StatusCodes.OK).json({ token });

  } catch (error) {
    logger.error('Login error', { error });
    next(error); // Pass to global error handler
  }
};