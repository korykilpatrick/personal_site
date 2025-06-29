/**
 * Database-specific type definitions
 * Part of Phase 3.1 - Type safety improvements
 */

/**
 * Result type for database count queries
 */
export interface DatabaseCountResult {
  count: string | number;
}

/**
 * Extended error type for database errors
 */
export interface DatabaseError extends Error {
  code?: string;
  constraint?: string;
  detail?: string;
  schema?: string;
  table?: string;
}

/**
 * Type for Knex query results that include count
 */
export type CountQueryResult = { count: string | number } | undefined;