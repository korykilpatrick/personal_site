import { db } from '../db/connection';

export interface Post {
  id: number;
  title: string;
  content: string;
  date: Date;
  tags?: string[];
  excerpt?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Post model with database operations
 */
export const PostModel = {
  /**
   * Get all posts
   */
  getAll: async (): Promise<Post[]> => {
    const posts = await db('posts').select('*').orderBy('date', 'desc');
    
    // Parse JSON fields
    return posts.map((post) => ({
      ...post,
      tags: JSON.parse(post.post_tags || '[]'),
    }));
  },

  /**
   * Get a post by ID
   */
  getById: async (id: number): Promise<Post | null> => {
    const post = await db('posts').where({ id }).first();
    
    if (!post) return null;
    
    // Parse JSON fields
    return {
      ...post,
      tags: JSON.parse(post.post_tags || '[]'),
    };
  },

  /**
   * Get posts by tag
   */
  getByTag: async (tag: string): Promise<Post[]> => {
    // Search for posts containing the tag in their tags text field
    const posts = await db('posts')
      .whereRaw("post_tags LIKE ?", [`%${tag}%`])
      .orderBy('date', 'desc');
    
    // Parse JSON fields
    return posts.map((post) => ({
      ...post,
      tags: JSON.parse(post.post_tags || '[]'),
    }));
  },

  /**
   * Search posts by title or content
   */
  search: async (query: string): Promise<Post[]> => {
    // Basic search implementation
    const posts = await db('posts')
      .where('title', 'ilike', `%${query}%`)
      .orWhere('content', 'ilike', `%${query}%`)
      .orWhere('excerpt', 'ilike', `%${query}%`)
      .orderBy('date', 'desc');
    
    // Parse JSON fields
    return posts.map((post) => ({
      ...post,
      tags: JSON.parse(post.post_tags || '[]'),
    }));
  },

  /**
   * Create a new post
   */
  create: async (post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post> => {
    // Stringify JSON fields
    const { tags, ...rest } = post;
    const postData = {
      ...rest,
      post_tags: JSON.stringify(tags || []),
    };
    
    const [newPost] = await db('posts').insert(postData).returning('*');
    
    // Parse JSON fields in the returned post
    return {
      ...newPost,
      tags: JSON.parse(newPost.post_tags || '[]'),
    };
  },

  /**
   * Update a post
   */
  update: async (id: number, post: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at'>>): Promise<Post | null> => {
    // Extract tags if they exist
    const { tags, ...rest } = post;
    
    // Prepare update data
    const updateData: any = { ...rest, updated_at: new Date() };
    
    // Stringify JSON fields if they exist
    if (tags) updateData.post_tags = JSON.stringify(tags);
    
    const [updatedPost] = await db('posts')
      .where({ id })
      .update(updateData)
      .returning('*');
    
    if (!updatedPost) return null;
    
    // Parse JSON fields
    return {
      ...updatedPost,
      tags: JSON.parse(updatedPost.post_tags || '[]'),
    };
  },

  /**
   * Delete a post
   */
  delete: async (id: number): Promise<boolean> => {
    const deleted = await db('posts').where({ id }).delete();
    return deleted > 0;
  },
};

export default PostModel;