import { BaseService } from './BaseService';
import SiteNoteModel from '../models/SiteNote';
import { SiteNote } from '@shared/index';
import logger from '../utils/logger';

class SiteNoteServiceClass extends BaseService<SiteNote> {
  constructor() {
    super(SiteNoteModel, 'SiteNote');
  }

  /**
   * Get the currently active site note (expecting only one, or possibly none).
   */
  async getActive(): Promise<SiteNote | null> {
    try {
      const activeNote = await this.model.query()
        .where({ is_active: true })
        .first();
      return activeNote || null;
    } catch (error) {
      logger.error('Error fetching active site note', { error });
      throw error;
    }
  }

}

export const SiteNoteService = new SiteNoteServiceClass();
export default SiteNoteService;