import express from 'express';
import bookRoutes from './book.routes';
import bookshelfRoutes from './bookshelf.routes';
import projectRoutes from './project.routes';
import workEntryRoutes from './work_entry.routes';
import authRoutes from './authRoutes';
import adminRoutes from './adminRoutes';
import siteNoteRoutes from './site_note.routes';
import quoteRoutes from './quote.routes';
import config from '../config/config';

// New library routes
import libraryItemTypeRoutes from './library_item_type.routes';
import libraryItemRoutes from './library_item.routes';
import libraryExtractionRoutes from './library_extraction.routes';

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
router.use('/site_notes', siteNoteRoutes);
router.use('/quotes', quoteRoutes);

// Add library routes
router.use('/library-item-types', libraryItemTypeRoutes);
router.use('/library-items', libraryItemRoutes);
router.use('/library', libraryExtractionRoutes);

export default router;