import { BaseService } from './BaseService';
import BookModel from '../models/Book';
import { Book, BookWithShelves } from '@shared/index';
import logger from '../utils/logger';

class BookServiceClass extends BaseService<Book> {
  constructor() {
    super(BookModel, 'Book');
  }

  /**
   * Get a book with its shelves
   */
  async getWithShelves(id: number): Promise<BookWithShelves | null> {
    try {
      const book = await BookModel.getWithShelves(id);
      
      if (!book) {
        logger.info('Book not found', { id });
      }
      
      return book;
    } catch (error) {
      logger.error('Error fetching book with shelves', { error, id });
      throw error;
    }
  }

  /**
   * Get books by shelf ID
   */
  async getByShelfId(shelfId: number): Promise<Book[]> {
    try {
      return await BookModel.getByShelfId(shelfId);
    } catch (error) {
      logger.error('Error fetching books by shelf', { error, shelfId });
      throw error;
    }
  }
}

// Export a singleton instance
export const BookService = new BookServiceClass();

export default BookService;