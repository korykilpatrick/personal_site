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
   * Update an existing library item, ensuring JSON fields are stringified.
   */
  async update(id: number, data: Partial<LibraryItem>): Promise<LibraryItem | null> {
    const dataForDb: any = { ...data };

    // Ensure that if tags/creators are present, they are stringified.
    // If they are intended to be cleared, they should be passed as null or an empty array 
    // and the controller/service layer should handle this logic if super.update doesn't.
    // For now, we only stringify if they are present and are arrays.
    if (data.tags && Array.isArray(data.tags)) {
      dataForDb.tags = JSON.stringify(data.tags);
    } else if (data.hasOwnProperty('tags') && data.tags === null) {
      dataForDb.tags = null; // Allow clearing the field
    }


    if (data.creators && Array.isArray(data.creators)) {
      dataForDb.creators = JSON.stringify(data.creators);
    } else if (data.hasOwnProperty('creators') && data.creators === null) {
      dataForDb.creators = null; // Allow clearing the field
    }
    
    // If tags or creators are present in data but not as arrays (e.g. already stringified or incorrect format)
    // this won't attempt to re-stringify. This relies on controller sending correct array format.
    // The error 'invalid input syntax for type json' for '{"AI"}' suggests the input itself might be an issue
    // if it's coming from the client that way and not being parsed into an array of strings correctly.
    // However, the controller's Array.isArray(tags) check should prevent non-arrays from getting here.

    return super.update(id, dataForDb);
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