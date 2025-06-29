import { Quote } from '@shared/index';
import { CRUDController } from '../base/CRUDController';
import QuoteModel from '../../models/Quote';
import QuoteService from '../../services/QuoteService';

/**
 * Admin Quote controller for full CRUD.
 * Refactored to use generic CRUDController base class
 */
class AdminQuoteController extends CRUDController<Quote> {
  constructor() {
    super(QuoteModel, 'Quote', QuoteService);
  }
}

// Create instance
const controller = new AdminQuoteController();

// Export individual methods for route compatibility
export const getQuotes = controller.getAll;
export const getQuoteById = controller.getById;
export const createQuote = controller.create;
export const updateQuote = controller.update;
export const deleteQuote = controller.delete;