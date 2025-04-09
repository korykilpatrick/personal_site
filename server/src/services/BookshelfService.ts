import { BaseService } from './BaseService';
import BookshelfModel from '../models/Bookshelf';
import { Bookshelf, BookshelfWithBooks } from '@shared/index';
import logger from '../utils/logger';

class BookshelfServiceClass extends BaseService<Bookshelf> {
  constructor() {
    super(BookshelfModel, 'Bookshelf');
  }

  /**
   * Get a bookshelf with its books
   */
  async getWithBooks(id: number): Promise<BookshelfWithBooks | null> {
    try {
      const bookshelf = await BookshelfModel.getWithBooks(id);
      
      if (!bookshelf) {
        logger.info('Bookshelf not found', { id });
      }
      
      return bookshelf;
    } catch (error) {
      logger.error('Error fetching bookshelf with books', { error, id });
      throw error;
    }
  }

  /**
   * Add a book to a shelf
   */
  async addBook(shelfId: number, bookId: number): Promise<void> {
    try {
      await BookshelfModel.addBook(shelfId, bookId);
      logger.info('Added book to shelf', { shelfId, bookId });
    } catch (error) {
      logger.error('Error adding book to shelf', { error, shelfId, bookId });
      throw error;
    }
  }

  /**
   * Remove a book from a shelf
   */
  async removeBook(shelfId: number, bookId: number): Promise<boolean> {
    try {
      const removed = await BookshelfModel.removeBook(shelfId, bookId);
      
      if (!removed) {
        logger.info('Book not found in shelf for removal', { shelfId, bookId });
      } else {
        logger.info('Removed book from shelf', { shelfId, bookId });
      }
      
      return removed;
    } catch (error) {
      logger.error('Error removing book from shelf', { error, shelfId, bookId });
      throw error;
    }
  }
}

// Export a singleton instance
export const BookshelfService = new BookshelfServiceClass();

export default BookshelfService;