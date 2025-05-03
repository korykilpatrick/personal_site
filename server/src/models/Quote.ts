import { BaseModel } from './BaseModel';
import { Quote as IQuote } from '@shared/index';

class QuoteModelClass extends BaseModel<IQuote> {
  constructor() {
    super('quotes', 'display_order', 'asc'); // sort by display_order ascending by default
  }
}

export const QuoteModel = new QuoteModelClass();
export default QuoteModel;