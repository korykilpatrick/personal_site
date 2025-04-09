import { db } from '../db/connection';
import { BaseModel } from './BaseModel';
import { Book, BookWithShelves, BookshelfSummary } from '@shared/index';

/**
 * Book model with database operations
 */
class BookModelClass extends BaseModel<Book> {
  constructor() {
    super('books', 'title');
  }

  /**
   * Get a book with its shelves
   */
  async getWithShelves(id: number): Promise<BookWithShelves | null> {
    const book = await this.getById(id);
    
    if (!book) return null;
    
    const shelves = await db('bookshelves')
      .join('books_shelves', 'bookshelves.id', '=', 'books_shelves.shelf_id')
      .where('books_shelves.book_id', id)
      .select('bookshelves.id', 'bookshelves.name') as BookshelfSummary[];
    
    return { ...book, shelves };
  }

  /**
   * Get books by shelf ID
   */
  async getByShelfId(shelfId: number): Promise<Book[]> {
    return db('books')
      .join('books_shelves', 'books.id', '=', 'books_shelves.book_id')
      .where('books_shelves.shelf_id', shelfId)
      .select('books.*')
      .orderBy('books.title');
  }
}

// Export a singleton instance
export const BookModel = new BookModelClass();

export default BookModel;