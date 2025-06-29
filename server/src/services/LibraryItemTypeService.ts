import { BaseService } from './BaseService';
import { LibraryItemTypeModel, LibraryItemType } from '../models/LibraryItemType';

/**
 * Service for managing LibraryItemType entities
 */
class LibraryItemTypeService extends BaseService<LibraryItemType> {
  constructor() {
    super(LibraryItemTypeModel, 'LibraryItemType');
  }
}

export default new LibraryItemTypeService();