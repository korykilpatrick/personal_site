import { BaseModel } from './BaseModel';
import { BaseRecord } from '@shared/index';

export interface LibraryItemType extends BaseRecord {
  name: string;
}

class LibraryItemTypeModelClass extends BaseModel<LibraryItemType> {
  constructor() {
    super('library_item_types', 'name', 'asc');
  }
}

export const LibraryItemTypeModel = new LibraryItemTypeModelClass();
export default LibraryItemTypeModel;