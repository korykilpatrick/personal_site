import fs from 'fs';
import path from 'path';

/**
 * Script to initialize the logs directory
 */

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logsDir)) {
  console.log('Creating logs directory...');
  fs.mkdirSync(logsDir, { recursive: true });
} else {
  console.log('Logs directory already exists.');
}

// Create empty log files if they don't exist
const errorLogPath = path.join(logsDir, 'error.log');
const combinedLogPath = path.join(logsDir, 'combined.log');

if (!fs.existsSync(errorLogPath)) {
  console.log('Creating error.log file...');
  fs.writeFileSync(errorLogPath, '');
} else {
  console.log('Error log file already exists.');
}

if (!fs.existsSync(combinedLogPath)) {
  console.log('Creating combined.log file...');
  fs.writeFileSync(combinedLogPath, '');
} else {
  console.log('Combined log file already exists.');
}

console.log('Log initialization complete.');