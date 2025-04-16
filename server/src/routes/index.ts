import express from 'express';
import bookRoutes from './book.routes';
import bookshelfRoutes from './bookshelf.routes';
import projectRoutes from './project.routes';
import workEntryRoutes from './work_entry.routes';
import authRoutes from './authRoutes';
import adminRoutes from './adminRoutes';
// import postRoutes from './post.routes'; // Removed
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
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/books', bookRoutes);
router.use('/bookshelves', bookshelfRoutes);
router.use('/projects', projectRoutes);
router.use('/work', workEntryRoutes);
// router.use('/posts', postRoutes); // Removed

export default router;