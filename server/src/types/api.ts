/**
 * API-specific type definitions
 * Part of Phase 3.1 - Type safety improvements
 */

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

/**
 * Express error with additional properties
 */
export interface ExpressError extends Error {
  status?: number;
  statusCode?: number;
  response?: {
    data?: {
      message?: string;
    };
  };
}