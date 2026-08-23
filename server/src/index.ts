import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { testConnection } from './db/connection';
import config from './config/config';
import routes from './routes';
import { notFound, errorHandler } from './middleware/error';
import logger from './utils/logger';

// Create Express server
const app = express();

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Start server
    app.listen(app.get('port'), config.host, () => {
      logger.info(
        `Server running at http://${config.host}:${app.get('port')} in ${config.env} mode`
      );
      logger.info('Press CTRL-C to stop');
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

// Express configuration
app.set('port', config.port);

// Middleware
app.use(cors({ 
  origin: config.cors.origin,
  credentials: true
}));
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan('dev', { 
  stream: { 
    write: (message: string) => logger.info(message.trim()) 
  }
})); // HTTP request logging
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body

// API routes
app.use(config.apiPrefix, routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

void startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection', err);
});

export default app;
