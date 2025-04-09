// Shared types for both frontend and backend

/**
 * Base model interface that all models will extend
 */
export interface BaseRecord {
  id: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

/**
 * Book model
 */
export interface Book extends BaseRecord {
  goodreads_id: number;
  img_url: string | null;
  img_url_small: string | null;
  title: string;
  book_link: string | null;
  author: string;
  author_link: string | null;
  num_pages: number | null;
  avg_rating: number | null;
  num_ratings: number | null;
  date_pub: string | null;
  rating: number | null;
  blurb: string | null;
  date_added: string | null;
  date_started: string | null;
  date_read: string | null;
}

/**
 * Book with shelves
 */
export interface BookWithShelves extends Book {
  shelves: BookshelfSummary[];
}

/**
 * Bookshelf model
 */
export interface Bookshelf extends BaseRecord {
  name: string;
}

/**
 * Summary of a bookshelf (used in BookWithShelves)
 */
export interface BookshelfSummary {
  id: number;
  name: string;
}

/**
 * Bookshelf with books
 */
export interface BookshelfWithBooks extends Bookshelf {
  books: Book[];
}

/**
 * Project link interface
 */
export interface ProjectLink {
  title: string;
  url: string;
  icon?: string;
}

/**
 * Project model
 */
export interface Project extends BaseRecord {
  title: string;
  description: string;
  media_urls: string[];
  links: ProjectLink[];
  writeup?: string;
  tags?: string[];
}

/**
 * Gig link interface
 */
export interface GigLink {
  title: string;
  url: string;
}

/**
 * Gig model
 */
export interface Gig extends BaseRecord {
  company: string;
  role: string;
  duration: string;
  achievements: string;
  links?: GigLink[];
}

/**
 * Post model
 */
export interface Post extends BaseRecord {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  tags?: string[];
  status: 'draft' | 'published';
  published_at?: Date | string;
}

/**
 * API response with pagination
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}