import express from 'express';
import bookRoutes from './book.routes';
import bookshelfRoutes from './bookshelf.routes';
import projectRoutes from './project.routes';
import gigRoutes from './gig.routes';
import postRoutes from './post.routes';
import config from '../config/config';

const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: config.env });
});

/**
 * API routes
 */
router.use('/books', bookRoutes);
router.use('/bookshelves', bookshelfRoutes);
router.use('/projects', projectRoutes);
router.use('/gigs', gigRoutes);
router.use('/posts', postRoutes);

export default router;