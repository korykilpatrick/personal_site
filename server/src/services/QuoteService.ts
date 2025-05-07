import { BaseService } from './BaseService';
import QuoteModel from '../models/Quote';
import { Quote } from '@shared/index';
import logger from '../utils/logger';

class QuoteServiceClass extends BaseService<Quote> {
  constructor() {
    super(QuoteModel, 'Quote');
  }

  /**
   * Get either all quotes or optionally only active quotes if active=true
   */
  async getAllFiltered(active?: boolean): Promise<Quote[]> {
    try {
      if (active === undefined) {
        return await this.model.getAll();
      }
      // if active param is given, filter by is_active
      return await this.model.query().where({ is_active: active }).orderBy('display_order', 'asc');
    } catch (error) {
      logger.error('Error fetching quotes', { error, active });
      throw error;
    }
  }

  /**
   * Get the total count of all quotes.
   */
  async getTotalCount(): Promise<number> {
    try {
      // Assuming BaseService has a countAll method or this.model allows direct count
      const result = await this.model.query().count({ count: '*' }).first() as any;
      return parseInt(result.count, 10) || 0;
    } catch (error) {
      logger.error('Error fetching total quotes count', { error });
      throw error;
    }
  }

  /**
   * Get the count of active quotes.
   */
  async getActiveCount(): Promise<number> {
    try {
      const result = await this.model.query().where({ is_active: true }).count({ count: '*' }).first() as any;
      return parseInt(result.count, 10) || 0;
    } catch (error) {
      logger.error('Error fetching active quotes count', { error });
      throw error;
    }
  }
}

export const QuoteService = new QuoteServiceClass();
export default QuoteService;