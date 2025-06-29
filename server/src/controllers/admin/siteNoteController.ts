import { SiteNote } from '@shared/index';
import { CRUDController } from '../base/CRUDController';
import SiteNoteModel from '../../models/SiteNote';
import SiteNoteService from '../../services/SiteNoteService';

/**
 * Admin SiteNote controller for full CRUD.
 * Refactored to use generic CRUDController base class
 */
class AdminSiteNoteController extends CRUDController<SiteNote> {
  constructor() {
    super(SiteNoteModel, 'Site Note', SiteNoteService);
  }
}

// Create instance
const controller = new AdminSiteNoteController();

// Export individual methods for route compatibility
export const getSiteNotes = controller.getAll;
export const getSiteNoteById = controller.getById;
export const createSiteNote = controller.create;
export const updateSiteNote = controller.update;
export const deleteSiteNote = controller.delete;