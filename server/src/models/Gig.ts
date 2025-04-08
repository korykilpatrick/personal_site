import { db } from '../db/connection';

export interface GigLink {
  title: string;
  url: string;
}

export interface Gig {
  id: number;
  company: string;
  role: string;
  duration: string;
  achievements: string;
  links?: GigLink[];
  created_at: Date;
  updated_at: Date;
}

/**
 * Gig model with database operations
 */
export const GigModel = {
  /**
   * Get all gigs
   */
  getAll: async (): Promise<Gig[]> => {
    const gigs = await db('gigs').select('*').orderBy('created_at', 'desc');
    
    // Parse JSON fields
    return gigs.map((gig) => ({
      ...gig,
      links: JSON.parse(gig.gig_links || '[]'),
    }));
  },

  /**
   * Get a gig by ID
   */
  getById: async (id: number): Promise<Gig | null> => {
    const gig = await db('gigs').where({ id }).first();
    
    if (!gig) return null;
    
    // Parse JSON fields
    return {
      ...gig,
      links: JSON.parse(gig.gig_links || '[]'),
    };
  },

  /**
   * Create a new gig
   */
  create: async (gig: Omit<Gig, 'id' | 'created_at' | 'updated_at'>): Promise<Gig> => {
    // Stringify JSON fields
    const { links, ...rest } = gig;
    const gigData = {
      ...rest,
      gig_links: JSON.stringify(links || []),
    };
    
    const [newGig] = await db('gigs').insert(gigData).returning('*');
    
    // Parse JSON fields in the returned gig
    return {
      ...newGig,
      links: JSON.parse(newGig.gig_links || '[]'),
    };
  },

  /**
   * Update a gig
   */
  update: async (id: number, gig: Partial<Omit<Gig, 'id' | 'created_at' | 'updated_at'>>): Promise<Gig | null> => {
    // Extract links if they exist
    const { links, ...rest } = gig;
    
    // Prepare update data
    const updateData: any = { ...rest, updated_at: new Date() };
    
    // Stringify JSON fields if they exist
    if (links) updateData.gig_links = JSON.stringify(links);
    
    const [updatedGig] = await db('gigs')
      .where({ id })
      .update(updateData)
      .returning('*');
    
    if (!updatedGig) return null;
    
    // Parse JSON fields
    return {
      ...updatedGig,
      links: JSON.parse(updatedGig.gig_links || '[]'),
    };
  },

  /**
   * Delete a gig
   */
  delete: async (id: number): Promise<boolean> => {
    const deleted = await db('gigs').where({ id }).delete();
    return deleted > 0;
  },
};

export default GigModel;