import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { StatusCodes } from 'http-status-codes';
import logger from '../utils/logger';

// Define a custom request type that includes the user payload
export interface AuthenticatedRequest extends Request {
  user?: { // Or a more specific UserPayload type
    username: string;
    // role?: string; // Add role if using role-based access control
  };
}

export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Bearer TOKEN)
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret) as { username: string /*, role?: string */ };

      // Attach user payload to the request object
      // In a real app, you might want to fetch the full user object from DB here
      req.user = decoded; 

      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      logger.error('JWT verification failed', { error });
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Not authorized, no token' });
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