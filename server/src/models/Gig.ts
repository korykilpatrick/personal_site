import { BaseModel } from './BaseModel';
import { Gig as SharedGig, GigLink } from '@shared/index';

// Database model with gig_links as JSON string
export interface GigDB extends SharedGig {
  gig_links: string; // JSON string in DB
  links?: never; // Override links to make it never to avoid type conflicts
}

/**
 * Gig model with database operations
 */
class GigModelClass extends BaseModel<GigDB> {
  constructor() {
    super('gigs', 'created_at', 'desc');
  }

  /**
   * Convert DB record to API model
   */
  private toApiModel(dbRecord: GigDB): SharedGig {
    const { gig_links, ...rest } = dbRecord;
    return {
      ...rest,
      links: JSON.parse(gig_links || '[]'),
    };
  }

  /**
   * Convert API model to DB record
   */
  private toDbModel(apiModel: Partial<SharedGig>): Partial<GigDB> {
    const { links, ...rest } = apiModel;
    const dbModel: Partial<GigDB> = { ...rest };
    
    if (links !== undefined) {
      dbModel.gig_links = JSON.stringify(links || []);
    }
    
    return dbModel;
  }

  /**
   * Override the BaseModel methods to handle JSON conversion
   */

  /**
   * Get all gigs
   */
  override async getAll(): Promise<GigDB[]> {
    const gigs = await super.getAll();
    // Convert to API model and then back to DB model to ensure proper typing
    return gigs;
  }

  /**
   * Get all gigs as API model
   */
  async getAllApi(): Promise<SharedGig[]> {
    const gigs = await super.getAll();
    return gigs.map(gig => this.toApiModel(gig));
  }

  /**
   * Get a gig by ID
   */
  override async getById(id: number): Promise<GigDB | null> {
    return super.getById(id);
  }

  /**
   * Get a gig by ID as API model
   */
  async getByIdApi(id: number): Promise<SharedGig | null> {
    const gig = await super.getById(id);
    if (!gig) return null;
    return this.toApiModel(gig);
  }

  /**
   * Create a new gig
   */
  override async create(dbGig: Omit<GigDB, 'id' | 'created_at' | 'updated_at'>): Promise<GigDB> {
    return super.create(dbGig);
  }

  /**
   * Create a new gig from API model
   */
  async createFromApi(gig: Omit<SharedGig, 'id' | 'created_at' | 'updated_at'>): Promise<SharedGig> {
    const dbGig = this.toDbModel(gig) as Omit<GigDB, 'id' | 'created_at' | 'updated_at'>;
    const newGig = await super.create(dbGig);
    return this.toApiModel(newGig);
  }

  /**
   * Update a gig
   */
  override async update(id: number, data: Partial<GigDB>): Promise<GigDB | null> {
    return super.update(id, data);
  }

  /**
   * Update a gig from API model
   */
  async updateFromApi(id: number, gig: Partial<Omit<SharedGig, 'id' | 'created_at' | 'updated_at'>>): Promise<SharedGig | null> {
    const dbGig = this.toDbModel(gig);
    const updatedGig = await super.update(id, dbGig);
    if (!updatedGig) return null;
    return this.toApiModel(updatedGig);
  }
}

// Export a singleton instance
export const GigModel = new GigModelClass();

export default GigModel;