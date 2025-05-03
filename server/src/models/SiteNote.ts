import { BaseModel } from './BaseModel';
import { SiteNote as ISiteNote } from '@shared/index';

class SiteNoteModelClass extends BaseModel<ISiteNote> {
  constructor() {
    super('site_notes', 'created_at', 'desc');
  }
}

export const SiteNoteModel = new SiteNoteModelClass();
export default SiteNoteModel;