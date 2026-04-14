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
type LibraryItemUpdateData = Partial<Omit<LibraryItem, 'id' | 'created_at' | 'updated_at'>> & {
  tags?: string[] | null;
  creators?: string[] | null;
};
type LibraryItemDbRecord = Omit<LibraryItemCreationData, 'tags' | 'creators'> & {
  tags?: string | null;
  creators?: string | null;
};

class LibraryItemModelClass extends BaseModel<LibraryItem> {
  constructor() {
    super('library_items', 'created_at', 'desc');
  }

  /**
   * Create a new library item, ensuring JSON fields are stringified.
   */
  async create(data: LibraryItemCreationData): Promise<LibraryItem> {
    const dataForDb: LibraryItemDbRecord = {
      item_type_id: data.item_type_id,
      link: data.link,
      title: data.title,
      blurb: data.blurb,
      thumbnail_url: data.thumbnail_url,
      ...(data.tags ? { tags: JSON.stringify(data.tags) } : {}),
      ...(data.creators ? { creators: JSON.stringify(data.creators) } : {}),
    };

    const [newRecord] = await this.db(this.tableName)
      .insert(dataForDb)
      .returning('*');

    return newRecord;
  }

  /**
   * Update an existing library item, ensuring JSON fields are stringified.
   */
  async update(id: number, data: LibraryItemUpdateData): Promise<LibraryItem | null> {
    const { tags, creators, ...rest } = data;
    const dataForDb: Partial<LibraryItemDbRecord> = { ...rest };

    // Ensure that if tags/creators are present, they are stringified.
    // If they are intended to be cleared, they should be passed as null or an empty array 
    // and the controller/service layer should handle this logic if super.update doesn't.
    // For now, we only stringify if they are present and are arrays.
    if (Array.isArray(tags)) {
      dataForDb.tags = JSON.stringify(tags);
    } else if (tags === null) {
      dataForDb.tags = null; // Allow clearing the field
    }


    if (Array.isArray(creators)) {
      dataForDb.creators = JSON.stringify(creators);
    } else if (creators === null) {
      dataForDb.creators = null; // Allow clearing the field
    }
    
    // If tags or creators are present in data but not as arrays (e.g. already stringified or incorrect format)
    // this won't attempt to re-stringify. This relies on controller sending correct array format.
    // The error 'invalid input syntax for type json' for '{"AI"}' suggests the input itself might be an issue
    // if it's coming from the client that way and not being parsed into an array of strings correctly.
    // However, the controller's Array.isArray(tags) check should prevent non-arrays from getting here.

    const [updatedRecord] = await this.db(this.tableName)
      .where({ id })
      .update({
        ...dataForDb,
        updated_at: new Date(),
      })
      .returning('*');

    return updatedRecord || null;
  }

  /**
   * Get all library items with their type name, filtering by item_type_id or tag if provided.
   */
  async getAllWithType(filter?: { item_type_id?: number; tag?: string }): Promise<(LibraryItem & { type_name: string })[]> {
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
