import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import BookshelfModel from '../models/Bookshelf';
import logger from '../utils/logger';

/**
 * BookshelfController for handling bookshelf-related requests
 */
export const BookshelfController = {
  /**
   * Get all bookshelves
   */
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookshelves = await BookshelfModel.getAll();
      res.status(StatusCodes.OK).json(bookshelves);
    } catch (error) {
      logger.error('Error fetching bookshelves', { error });
      next(error);
    }
  },

  /**
   * Get a bookshelf by ID
   */
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const bookshelf = await BookshelfModel.getById(id);
      
      if (!bookshelf) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Bookshelf not found' });
      }
      
      res.status(StatusCodes.OK).json(bookshelf);
    } catch (error) {
      logger.error('Error fetching bookshelf', { error, bookshelfId: req.params.id });
      next(error);
    }
  },

  /**
   * Get books in a bookshelf
   */
  getBooks: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const bookshelfWithBooks = await BookshelfModel.getWithBooks(id);
      
      if (!bookshelfWithBooks) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Bookshelf not found' });
      }
      
      res.status(StatusCodes.OK).json(bookshelfWithBooks.books);
    } catch (error) {
      logger.error('Error fetching books in bookshelf', { error, bookshelfId: req.params.id });
      next(error);
    }
  },

  /**
   * Create a new bookshelf
   */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newBookshelf = await BookshelfModel.create(req.body);
      res.status(StatusCodes.CREATED).json(newBookshelf);
    } catch (error) {
      logger.error('Error creating bookshelf', { error, payload: req.body });
      next(error);
    }
  },

  /**
   * Update a bookshelf
   */
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const updatedBookshelf = await BookshelfModel.update(id, req.body);
      
      if (!updatedBookshelf) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Bookshelf not found' });
      }
      
      res.status(StatusCodes.OK).json(updatedBookshelf);
    } catch (error) {
      logger.error('Error updating bookshelf', { error, bookshelfId: req.params.id, payload: req.body });
      next(error);
    }
  },

  /**
   * Delete a bookshelf
   */
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const deleted = await BookshelfModel.delete(id);
      
      if (!deleted) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Bookshelf not found' });
      }
      
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      logger.error('Error deleting bookshelf', { error, bookshelfId: req.params.id });
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
      
      await BookshelfModel.addBook(shelfId, bookId);
      
      res.status(StatusCodes.OK).json({ message: 'Book added to bookshelf' });
    } catch (error) {
      logger.error('Error adding book to bookshelf', { 
        error, 
        bookshelfId: req.params.id, 
        bookId: req.body.bookId 
      });
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
      
      const removed = await BookshelfModel.removeBook(shelfId, bookId);
      
      if (!removed) {
        return res.status(StatusCodes.NOT_FOUND).json({ 
          message: 'Book not found in bookshelf' 
        });
      }
      
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      logger.error('Error removing book from bookshelf', { 
        error, 
        bookshelfId: req.params.id, 
        bookId: req.params.bookId 
      });
      next(error);
    }
  },
};

export default BookshelfController;