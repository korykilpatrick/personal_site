import { db } from '../db/connection';
import { Book } from './Book';

export interface Bookshelf {
  id: number;
  name: string;
  created_at: Date;
}

export interface BookshelfWithBooks extends Bookshelf {
  books: Book[];
}

/**
 * Bookshelf model with database operations
 */
export const BookshelfModel = {
  /**
   * Get all bookshelves
   */
  getAll: async (): Promise<Bookshelf[]> => {
    return db('bookshelves').select('*').orderBy('name');
  },

  /**
   * Get a bookshelf by ID
   */
  getById: async (id: number): Promise<Bookshelf | null> => {
    const bookshelf = await db('bookshelves').where({ id }).first();
    return bookshelf || null;
  },

  /**
   * Get a bookshelf with its books
   */
  getWithBooks: async (id: number): Promise<BookshelfWithBooks | null> => {
    const bookshelf = await db('bookshelves').where('bookshelves.id', id).first();
    
    if (!bookshelf) return null;
    
    const books = await db('books')
      .join('books_shelves', 'books.id', '=', 'books_shelves.book_id')
      .where('books_shelves.shelf_id', id)
      .select('books.*');
    
    return { ...bookshelf, books };
  },

  /**
   * Create a new bookshelf
   */
  create: async (bookshelf: Omit<Bookshelf, 'id' | 'created_at'>): Promise<Bookshelf> => {
    const [newBookshelf] = await db('bookshelves').insert(bookshelf).returning('*');
    return newBookshelf;
  },

  /**
   * Update a bookshelf
   */
  update: async (id: number, bookshelf: Partial<Bookshelf>): Promise<Bookshelf | null> => {
    const [updatedBookshelf] = await db('bookshelves')
      .where({ id })
      .update(bookshelf)
      .returning('*');
    
    return updatedBookshelf || null;
  },

  /**
   * Delete a bookshelf
   */
  delete: async (id: number): Promise<boolean> => {
    const deleted = await db('bookshelves').where({ id }).delete();
    return deleted > 0;
  },

  /**
   * Add a book to a shelf
   */
  addBook: async (shelfId: number, bookId: number): Promise<void> => {
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
  },

  /**
   * Remove a book from a shelf
   */
  removeBook: async (shelfId: number, bookId: number): Promise<boolean> => {
    const deleted = await db('books_shelves')
      .where({ book_id: bookId, shelf_id: shelfId })
      .delete();
    
    return deleted > 0;
  },
};

export default BookshelfModel;