import { BaseModel } from './BaseModel';
import { BaseRecord } from '@shared/index';

export interface LibraryItem extends BaseRecord {
  item_type_id: number;
  link: string;
  title: string;
  blurb?: string | null;
  thumbnail_url?: string | null;
  tags?: string[];
  creators?: string[]; // NEW FIELD
}

type LibraryItemCreationData = Omit<LibraryItem, 'id' | 'created_at' | 'updated_at'>;

class LibraryItemModelClass extends BaseModel<LibraryItem> {
  constructor() {
    super('library_items', 'created_at', 'desc');
  }

  /**
   * Create a new library item, ensuring JSON fields are stringified.
   */
  async create(data: LibraryItemCreationData): Promise<LibraryItem> {
    const dataForDb: any = { ...data };

    if (data.tags) {
      dataForDb.tags = JSON.stringify(data.tags);
    }
    if (data.creators) {
      dataForDb.creators = JSON.stringify(data.creators);
    }

    return super.create(dataForDb as any);
  }

  /**
   * Get all library items with their type name, filtering by item_type_id or tag if provided.
   */
  async getAllWithType(filter?: { item_type_id?: number; tag?: string }): Promise<any[]> {
    const query = this.db('library_items')
      .select(
        'library_items.*',
        'library_item_types.name as type_name'
      )
      .join('library_item_types', 'library_items.item_type_id', 'library_item_types.id');

    if (filter?.item_type_id) {
      query.where('library_items.item_type_id', filter.item_type_id);
    }

    if (filter?.tag) {
      query.whereRaw('tags @> ?::jsonb', JSON.stringify([filter.tag]));
    }

    query.orderBy(this.sortField, this.sortOrder);
    return query;
  }
}

export const LibraryItemModel = new LibraryItemModelClass();
export default LibraryItemModel;