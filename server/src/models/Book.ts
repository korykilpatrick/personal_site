import { db } from '../db/connection';

export interface Book {
  id: number;
  goodreads_id: number;
  img_url: string | null;
  img_url_small: string | null;
  title: string;
  book_link: string | null;
  author: string;
  author_link: string | null;
  num_pages: number | null;
  avg_rating: number | null;
  num_ratings: number | null;
  date_pub: string | null;
  rating: number | null;
  blurb: string | null;
  date_added: string | null;
  date_started: string | null;
  date_read: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface BookWithShelves extends Book {
  shelves: { id: number; name: string }[];
}

/**
 * Book model with database operations
 */
export const BookModel = {
  /**
   * Get all books
   */
  getAll: async (): Promise<Book[]> => {
    return db('books').select('*').orderBy('title');
  },

  /**
   * Get a book by ID
   */
  getById: async (id: number): Promise<Book | null> => {
    const book = await db('books').where({ id }).first();
    return book || null;
  },

  /**
   * Get a book with its shelves
   */
  getWithShelves: async (id: number): Promise<BookWithShelves | null> => {
    const book = await db('books').where('books.id', id).first();
    
    if (!book) return null;
    
    const shelves = await db('bookshelves')
      .join('books_shelves', 'bookshelves.id', '=', 'books_shelves.shelf_id')
      .where('books_shelves.book_id', id)
      .select('bookshelves.id', 'bookshelves.name');
    
    return { ...book, shelves };
  },

  /**
   * Create a new book
   */
  create: async (book: Omit<Book, 'id' | 'created_at' | 'updated_at'>): Promise<Book> => {
    const [newBook] = await db('books').insert(book).returning('*');
    return newBook;
  },

  /**
   * Update a book
   */
  update: async (id: number, book: Partial<Book>): Promise<Book | null> => {
    // Add updated_at timestamp
    const updateData = {
      ...book,
      updated_at: new Date(),
    };
    
    const [updatedBook] = await db('books')
      .where({ id })
      .update(updateData)
      .returning('*');
    
    return updatedBook || null;
  },

  /**
   * Delete a book
   */
  delete: async (id: number): Promise<boolean> => {
    const deleted = await db('books').where({ id }).delete();
    return deleted > 0;
  },
};

export default BookModel;