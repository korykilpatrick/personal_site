import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { StatusCodes } from 'http-status-codes';
import logger from '../utils/logger';
// import { db } from '../db/connection'; // Uncomment if implementing DB check

// Define payload structure expected from JWT
export interface JwtPayload {
  id: number;
  username: string;
  // role?: string; // Add role if using role-based access control
}

// Define a custom request type that includes the user payload
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload; // Use the defined JwtPayload type
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => { // Make async if adding DB check
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Authorization attempt failed: No token provided');
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    logger.warn('Authorization attempt failed: Empty token');
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    // --- Attach user payload to the request object ---
    
    // TODO: (Security Enhancement) For higher security, especially with multiple users or changing roles/status,
    // uncomment the db import and add a check here:
    // 1. Extract `decoded.id`.
    // 2. Query the `users` table for the user with that ID.
    // 3. If user not found or is inactive, return 401 Unauthorized.
    // 4. Otherwise, attach the *fresh* user data (or just the validated payload) to `req.user`.
    // const user = await db('users').where({ id: decoded.id }).first();
    // if (!user) { return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'User not found' }); }

    // For now, trust the decoded payload (simpler for single-user scenario)
    req.user = decoded;

    return next(); // Proceed to the next middleware/route handler
  } catch (error) {
    logger.error('JWT verification failed', { error });
    // Handle different JWT errors specifically if needed (e.g., TokenExpiredError)
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Not authorized, token failed' });
  }
};

// Optional: Middleware to check for admin role (if roles are implemented)
// export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//   if (req.user && req.user.role === 'admin') {
//     next();
//   } else {
//     res.status(StatusCodes.FORBIDDEN).json({ message: 'Not authorized as an admin' });
//   }
// }; 
