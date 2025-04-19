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
    
    // Use the generic findRelated method from BaseModel
    const books = await this.findRelated<Book>(
      'books',          // relatedTableName
      'books_shelves', // joinTableName
      'shelf_id',      // foreignKey (in join table, points to this model's table - bookshelves)
      'book_id',       // relatedForeignKey (in join table, points to related table - books)
      id,              // id of the current bookshelf instance
      ['*'],           // columns to select from books table
      'title'          // Sort books by title
    );
    
    return { ...bookshelf, books };
  }

  /**
   * Add a book to a shelf using the generic attach method
   */
  async addBook(shelfId: number, bookId: number): Promise<void> {
    await this.attach(
      'books_shelves', // joinTableName
      'shelf_id',      // foreignKey (for this model - bookshelf)
      'book_id',       // relatedForeignKey (for the related model - book)
      shelfId,         // id of the current bookshelf instance
      bookId           // id of the related book instance
    );
  }

  /**
   * Remove a book from a shelf using the generic detach method
   */
  async removeBook(shelfId: number, bookId: number): Promise<boolean> {
    return this.detach(
      'books_shelves', // joinTableName
      'shelf_id',      // foreignKey (for this model - bookshelf)
      'book_id',       // relatedForeignKey (for the related model - book)
      shelfId,         // id of the current bookshelf instance
      bookId           // id of the related book instance
    );
  }
}

// Export a singleton instance
export const BookshelfModel = new BookshelfModelClass();

export default BookshelfModel;