import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import BookService from '../services/BookService';

/**
 * BookController for handling book-related requests
 */
export const BookController = {
  /**
   * Get all books. If req.query.includeShelves === 'true', returns BookWithShelves.
   */
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const includeShelves = req.query.includeShelves === 'true';
      if (includeShelves) {
        const booksWithShelves = await BookService.getAllWithShelves();
        return res.status(StatusCodes.OK).json(booksWithShelves);
      } else {
        const books = await BookService.getAll();
        return res.status(StatusCodes.OK).json(books);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a book by ID
   */
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const bookWithShelves = await BookService.getWithShelves(id);
      if (!bookWithShelves) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Book not found' });
      }
      res.status(StatusCodes.OK).json(bookWithShelves);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a new book
   */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newBook = await BookService.create(req.body);
      res.status(StatusCodes.CREATED).json(newBook);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a book
   */
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updatedBook = await BookService.update(id, req.body);
      if (!updatedBook) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Book not found' });
      }
      res.status(StatusCodes.OK).json(updatedBook);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a book
   */
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deleted = await BookService.delete(id);
      if (!deleted) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Book not found' });
      }
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },
};

export default BookController;