import winston from 'winston';
import config from '../config/config';

const { combine, timestamp, printf, colorize } = winston.format;

// Custom format for logs
const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} [${level}]: ${message} ${
    Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
  }`;
});

// Create logger instance
const logger = winston.createLogger({
  level: config.logLevel,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
    // File transport for errors
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    // File transport for all logs
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

// If we're in production, don't log to console
if (config.env === 'production') {
  logger.transports.forEach(transport => {
    if (transport instanceof winston.transports.Console) {
      transport.silent = true;
    }
  });
}

export default logger;