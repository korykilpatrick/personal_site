import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import BookshelfService from '../services/BookshelfService';

/**
 * BookshelfController for handling bookshelf-related requests
 */
export const BookshelfController = {
  /**
   * Get all bookshelves
   */
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookshelves = await BookshelfService.getAll();
      res.status(StatusCodes.OK).json(bookshelves);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a bookshelf by ID
   */
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const bookshelf = await BookshelfService.getById(id);
      
      if (!bookshelf) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Bookshelf not found' });
      }
      
      res.status(StatusCodes.OK).json(bookshelf);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get books in a bookshelf
   */
  getBooks: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const bookshelfWithBooks = await BookshelfService.getWithBooks(id);
      
      if (!bookshelfWithBooks) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Bookshelf not found' });
      }
      
      res.status(StatusCodes.OK).json(bookshelfWithBooks.books);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a new bookshelf
   */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newBookshelf = await BookshelfService.create(req.body);
      res.status(StatusCodes.CREATED).json(newBookshelf);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a bookshelf
   */
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const updatedBookshelf = await BookshelfService.update(id, req.body);
      
      if (!updatedBookshelf) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Bookshelf not found' });
      }
      
      res.status(StatusCodes.OK).json(updatedBookshelf);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a bookshelf
   */
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const deleted = await BookshelfService.delete(id);
      
      if (!deleted) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Bookshelf not found' });
      }
      
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add a book to a bookshelf
   */
  addBook: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shelfId = parseInt(req.params.id, 10);
      const { bookId } = req.body;
      
      if (!bookId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Book ID is required' });
      }
      
      await BookshelfService.addBook(shelfId, bookId);
      
      res.status(StatusCodes.OK).json({ message: 'Book added to bookshelf' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remove a book from a bookshelf
   */
  removeBook: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shelfId = parseInt(req.params.id, 10);
      const bookId = parseInt(req.params.bookId, 10);
      
      const removed = await BookshelfService.removeBook(shelfId, bookId);
      
      if (!removed) {
        return res.status(StatusCodes.NOT_FOUND).json({ 
          message: 'Book not found in bookshelf' 
        });
      }
      
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },
};

export default BookshelfController;