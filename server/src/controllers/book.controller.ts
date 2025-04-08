import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import BookModel from '../models/Book';
import logger from '../utils/logger';

/**
 * BookController for handling book-related requests
 */
export const BookController = {
  /**
   * Get all books
   */
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const books = await BookModel.getAll();
      res.status(StatusCodes.OK).json(books);
    } catch (error) {
      logger.error('Error fetching books', { error });
      next(error);
    }
  },

  /**
   * Get a book by ID
   */
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const book = await BookModel.getWithShelves(id);
      
      if (!book) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Book not found' });
      }
      
      res.status(StatusCodes.OK).json(book);
    } catch (error) {
      logger.error('Error fetching book', { error, bookId: req.params.id });
      next(error);
    }
  },

  /**
   * Create a new book
   */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newBook = await BookModel.create(req.body);
      res.status(StatusCodes.CREATED).json(newBook);
    } catch (error) {
      logger.error('Error creating book', { error, payload: req.body });
      next(error);
    }
  },

  /**
   * Update a book
   */
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const updatedBook = await BookModel.update(id, req.body);
      
      if (!updatedBook) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Book not found' });
      }
      
      res.status(StatusCodes.OK).json(updatedBook);
    } catch (error) {
      logger.error('Error updating book', { error, bookId: req.params.id, payload: req.body });
      next(error);
    }
  },

  /**
   * Delete a book
   */
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const deleted = await BookModel.delete(id);
      
      if (!deleted) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Book not found' });
      }
      
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      logger.error('Error deleting book', { error, bookId: req.params.id });
      next(error);
    }
  },
};

export default BookController;