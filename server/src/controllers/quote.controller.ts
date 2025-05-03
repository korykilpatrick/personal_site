import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import QuoteService from '../services/QuoteService';

export const QuoteController = {
  /**
   * GET /quotes
   * If ?active=true => only fetch active quotes
   */
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activeParam = req.query.active === 'true' ? true : undefined;
      const quotes = await QuoteService.getAllFiltered(activeParam);
      res.status(StatusCodes.OK).json(quotes);
    } catch (error) {
      next(error);
    }
  },
};

export default QuoteController;