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

  /**
   * GET /quotes/summary/count
   * Return the total count of quotes, or count of active quotes if active=true.
   */
  getCounts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isActiveQuery = req.query.active === 'true';
      let count: number;

      if (isActiveQuery) {
        count = await QuoteService.getActiveCount();
      } else {
        count = await QuoteService.getTotalCount();
      }
      res.status(StatusCodes.OK).json({ count });
    } catch (error) {
      next(error);
    }
  },
};

export default QuoteController;