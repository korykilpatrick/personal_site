import { BaseService } from './BaseService';
import BookModel from '../models/Book';
import { Book, BookWithShelves, BookshelfSummary } from '@shared/index';
import logger from '../utils/logger';
import { db } from '../db/connection';

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

  /**
   * Get all books along with their shelves in a single DB query.
   * Returns an array of BookWithShelves.
   */
  async getAllWithShelves(): Promise<BookWithShelves[]> {
    try {
      // We'll left-join books_shelves -> bookshelves, collecting rows into a map
      // so each Book accumulates an array of {id, name} for shelves.
      const rows = await db('books')
        .leftJoin('books_shelves', 'books.id', 'books_shelves.book_id')
        .leftJoin('bookshelves', 'books_shelves.shelf_id', 'bookshelves.id')
        .select(
          'books.*',
          db.raw(`
            json_build_object(
              'id', bookshelves.id,
              'name', bookshelves.name
            ) as shelf
          `)
        );

      // Group shelves by book ID
      const map = new Map<number, BookWithShelves>();

      for (const row of rows) {
        const bookId = row.id;
        if (!map.has(bookId)) {
          // Start a new BookWithShelves record
          const shelves: BookshelfSummary[] = [];
          if (row.shelf && row.shelf.id) {
            shelves.push({
              id: row.shelf.id,
              name: row.shelf.name,
            });
          }

          map.set(bookId, {
            ...row,
            shelves,
          });
        } else {
          // Append shelf if valid
          const existing = map.get(bookId)!;
          if (row.shelf && row.shelf.id) {
            existing.shelves.push({
              id: row.shelf.id,
              name: row.shelf.name,
            });
          }
        }
      }

      return Array.from(map.values());
    } catch (error) {
      logger.error('Error fetching all books with shelves', { error });
      throw error;
    }
  }
}

export const BookService = new BookServiceClass();
export default BookService;