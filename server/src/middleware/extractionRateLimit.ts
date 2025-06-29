import rateLimit from 'express-rate-limit';
import { StatusCodes } from 'http-status-codes';
import config from '../config/config';

export const extractionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.extraction.rateLimit || 10, // limit each IP to X requests per windowMs
  message: 'Too many extraction requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      success: false,
      error: 'Too many extraction requests. Please try again later.',
    });
  },
});