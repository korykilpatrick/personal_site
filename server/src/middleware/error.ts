import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from '../utils/logger';

/**
 * Interface for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware for Not Found errors (404)
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(
    StatusCodes.NOT_FOUND,
    `Not Found - ${req.originalUrl}`
  );
  next(error);
};

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: ApiError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If the error is a known API error, use its status code
  const statusCode = 'statusCode' in err 
    ? err.statusCode 
    : StatusCodes.INTERNAL_SERVER_ERROR;
  
  // Log the error
  if (statusCode === StatusCodes.INTERNAL_SERVER_ERROR) {
    logger.error('Unhandled error', { 
      url: req.originalUrl,
      method: req.method,
      statusCode,
      message: err.message,
      stack: err.stack
    });
  } else {
    logger.warn('Request error', { 
      url: req.originalUrl,
      method: req.method,
      statusCode,
      message: err.message
    });
  }

  // Respond to the client
  res.status(statusCode).json({
    message: err.message,
    // Only include stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};