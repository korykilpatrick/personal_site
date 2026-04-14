import fs from 'fs';
import path from 'path';

/**
 * Script to initialize the logs directory
 */
const log = (message: string): void => {
  process.stdout.write(`${message}\n`);
};

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logsDir)) {
  log('Creating logs directory...');
  fs.mkdirSync(logsDir, { recursive: true });
} else {
  log('Logs directory already exists.');
}

// Create empty log files if they don't exist
const errorLogPath = path.join(logsDir, 'error.log');
const combinedLogPath = path.join(logsDir, 'combined.log');

if (!fs.existsSync(errorLogPath)) {
  log('Creating error.log file...');
  fs.writeFileSync(errorLogPath, '');
} else {
  log('Error log file already exists.');
}

if (!fs.existsSync(combinedLogPath)) {
  log('Creating combined.log file...');
  fs.writeFileSync(combinedLogPath, '');
} else {
  log('Combined log file already exists.');
}

log('Log initialization complete.');
