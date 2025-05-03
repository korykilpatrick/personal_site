import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { StatusCodes } from 'http-status-codes';
import logger from '../../utils/logger';
import QuoteService from '../../services/QuoteService';
import { Quote } from '@shared/index';

/**
 * Admin Quote controller for full CRUD.
 */
export const getQuotes = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    logger.info('Admin fetching all quotes', { user: req.user?.username });
    // Maybe pass ?active= in query? But let's just fetch all for admin
    const quotes = await QuoteService.getAll();
    res.status(StatusCodes.OK).json(quotes);
  } catch (error) {
    logger.error('Error fetching quotes', { error });
    next(error);
  }
};

export const getQuoteById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const quoteId = parseInt(id, 10);

  try {
    logger.info('Admin fetching quote by ID', { user: req.user?.username, quoteId });
    const quote = await QuoteService.getById(quoteId);
    if (!quote) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Quote not found' });
    }
    res.status(StatusCodes.OK).json(quote);
  } catch (error) {
    logger.error('Error fetching quote by ID', { error });
    next(error);
  }
};

export const createQuote = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const quoteData: Omit<Quote, 'id' | 'created_at' | 'updated_at'> = req.body;
  try {
    logger.info('Admin creating quote', { user: req.user?.username });
    const newQuote = await QuoteService.create(quoteData);
    res.status(StatusCodes.CREATED).json(newQuote);
  } catch (error) {
    logger.error('Error creating quote', { error });
    next(error);
  }
};

export const updateQuote = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const quoteId = parseInt(id, 10);

  const quoteData: Partial<Quote> = req.body;
  try {
    logger.info('Admin updating quote', { user: req.user?.username, quoteId });
    const updated = await QuoteService.update(quoteId, quoteData);
    if (!updated) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Quote not found' });
    }
    res.status(StatusCodes.OK).json(updated);
  } catch (error) {
    logger.error('Error updating quote', { error });
    next(error);
  }
};

export const deleteQuote = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const quoteId = parseInt(id, 10);

  try {
    logger.info('Admin deleting quote', { user: req.user?.username, quoteId });
    const deleted = await QuoteService.delete(quoteId);
    if (!deleted) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Quote not found or could not be deleted' });
    }
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    logger.error('Error deleting quote', { error });
    next(error);
  }
};