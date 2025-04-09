import { db } from '../db/connection';
import { BaseModel } from './BaseModel';
import { Bookshelf, BookshelfWithBooks, Book } from '@shared/index';

/**
 * Bookshelf model with database operations
 */
class BookshelfModelClass extends BaseModel<Bookshelf> {
  constructor() {
    super('bookshelves', 'name');
  }

  /**
   * Get a bookshelf with its books
   */
  async getWithBooks(id: number): Promise<BookshelfWithBooks | null> {
    const bookshelf = await this.getById(id);
    
    if (!bookshelf) return null;
    
    const books = await db('books')
      .join('books_shelves', 'books.id', '=', 'books_shelves.book_id')
      .where('books_shelves.shelf_id', id)
      .select('books.*')
      .orderBy('books.title');
    
    return { ...bookshelf, books };
  }

  /**
   * Add a book to a shelf
   */
  async addBook(shelfId: number, bookId: number): Promise<void> {
    // Check if the relationship already exists
    const existing = await db('books_shelves')
      .where({ book_id: bookId, shelf_id: shelfId })
      .first();
    
    if (!existing) {
      await db('books_shelves').insert({
        book_id: bookId,
        shelf_id: shelfId,
      });
    }
  }

  /**
   * Remove a book from a shelf
   */
  async removeBook(shelfId: number, bookId: number): Promise<boolean> {
    const deleted = await db('books_shelves')
      .where({ book_id: bookId, shelf_id: shelfId })
      .delete();
    
    return deleted > 0;
  }
}

// Export a singleton instance
export const BookshelfModel = new BookshelfModelClass();

export default BookshelfModel;