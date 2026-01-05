/**
 * Centralized error handling utilities for type-safe error handling across the application.
 *
 * This module provides:
 * - Type definitions for API errors
 * - Type guards for error identification
 * - Utility functions for extracting error messages
 */

import { AxiosError } from 'axios';

/**
 * Structure of error responses from the API
 */
export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  stack?: string;
}

/**
 * Type guard to check if an error is an AxiosError
 */
export function isAxiosError(error: unknown): error is AxiosError<ApiErrorResponse> {
  return (
    error !== null &&
    typeof error === 'object' &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}

/**
 * Type guard to check if an error is a standard Error object
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Type guard to check if error was cancelled/aborted
 */
export function isCancelledError(error: unknown): boolean {
  // Check for AbortError
  if (isError(error) && (error.name === 'AbortError' || error.name === 'CanceledError')) {
    return true;
  }

  // Check for Axios cancel
  if (isAxiosError(error) && error.code === 'ERR_CANCELED') {
    return true;
  }

  return false;
}

/**
 * Type guard for network errors
 */
export function isNetworkError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return error.code === 'ECONNABORTED' || error.message?.includes('Network');
  }
  return false;
}

/**
 * Extract a user-friendly error message from an unknown error
 *
 * @param error - The caught error (unknown type)
 * @param fallback - Fallback message if no message can be extracted
 * @returns A string message suitable for displaying to users
 */
export function getErrorMessage(error: unknown, fallback: string = 'An unexpected error occurred'): string {
  // Handle cancelled requests silently
  if (isCancelledError(error)) {
    return '';
  }

  // Handle Axios errors with API response
  if (isAxiosError(error)) {
    const apiMessage = error.response?.data?.message;
    if (apiMessage) {
      return apiMessage;
    }
    // Fall through to check error.message
  }

  // Handle standard Error objects
  if (isError(error)) {
    return error.message || fallback;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  return fallback;
}

/**
 * Get HTTP status code from an error, if available
 */
export function getErrorStatusCode(error: unknown): number | undefined {
  if (isAxiosError(error)) {
    return error.response?.status;
  }
  return undefined;
}

/**
 * Check if an error indicates an authentication failure
 */
export function isAuthError(error: unknown): boolean {
  const statusCode = getErrorStatusCode(error);
  return statusCode === 401 || statusCode === 403;
}

/**
 * Check if an error indicates the resource was not found
 */
export function isNotFoundError(error: unknown): boolean {
  return getErrorStatusCode(error) === 404;
}

/**
 * Check if an error indicates a validation failure
 */
export function isValidationError(error: unknown): boolean {
  const statusCode = getErrorStatusCode(error);
  return statusCode === 400 || statusCode === 422;
}

/**
 * Check if an error indicates rate limiting
 */
export function isRateLimitError(error: unknown): boolean {
  return getErrorStatusCode(error) === 429;
}

/**
 * Check if an error indicates a server error
 */
export function isServerError(error: unknown): boolean {
  const statusCode = getErrorStatusCode(error);
  return statusCode !== undefined && statusCode >= 500;
}

/**
 * Determine if the error should trigger a retry
 */
export function shouldRetryError(error: unknown): boolean {
  if (isCancelledError(error)) {
    return false;
  }

  // Retry on network errors
  if (isNetworkError(error)) {
    return true;
  }

  // Retry on server errors (except 501 Not Implemented)
  const statusCode = getErrorStatusCode(error);
  if (statusCode !== undefined && statusCode >= 500 && statusCode !== 501) {
    return true;
  }

  return false;
}

/**
 * Log an error with contextual information
 *
 * @param context - Description of where the error occurred
 * @param error - The error that was caught
 */
export function logError(context: string, error: unknown): void {
  if (isCancelledError(error)) {
    // Don't log cancelled requests
    return;
  }

  console.error(`Error in ${context}:`, {
    message: getErrorMessage(error),
    statusCode: getErrorStatusCode(error),
    error,
  });
}
