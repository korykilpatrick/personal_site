// server/src/utils/logger.ts
import winston from 'winston';
import util from 'util';
import config from '../config/config';

const { combine, timestamp, printf, colorize } = winston.format;

/** Safely stringify anything, including circular/error objects */
const safe = (value: unknown): string => {
  if (value instanceof Error) return value.stack ?? value.message;
  if (typeof value === 'object')
    return util.inspect(value, { depth: null, colors: false, breakLength: 120 });
  return String(value);
};

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaStr = Object.keys(meta).length ? safe(meta) : '';
  return `${timestamp} [${level}]: ${safe(message)} ${metaStr}`;
});

const logger = winston.createLogger({
  level: config.logLevel,
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      silent: config.env === 'production',
      format: combine(colorize(), logFormat),
    }),
  ],
});

export default logger;
