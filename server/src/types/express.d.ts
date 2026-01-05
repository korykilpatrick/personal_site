/**
 * Augment Express's built-in types to include our custom user payload.
 * This ensures type safety across all route handlers using authentication.
 */
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
    }
  }
}

export {};
