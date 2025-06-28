/**
 * Error classification for content extraction
 */
export enum ExtractionErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_URL = 'INVALID_URL',
  RATE_LIMITED = 'RATE_LIMITED',
  EXTRACTION_FAILED = 'EXTRACTION_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN'
}

export class ExtractionError extends Error {
  type: ExtractionErrorType;
  statusCode?: number;
  retryable: boolean;

  constructor(
    message: string, 
    type: ExtractionErrorType, 
    statusCode?: number,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'ExtractionError';
    this.type = type;
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}

/**
 * Categorize extraction errors based on error details
 */
export function categorizeExtractionError(error: any): ExtractionError {
  // Network errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('Network')) {
    return new ExtractionError(
      'Network connection failed. Please check your internet connection.',
      ExtractionErrorType.NETWORK_ERROR,
      undefined,
      true
    );
  }

  // API response errors
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.message;

    switch (status) {
      case 400:
        if (message?.includes('Invalid URL')) {
          return new ExtractionError(
            'The URL provided is invalid or unsupported.',
            ExtractionErrorType.INVALID_URL,
            status,
            false
          );
        }
        break;
      
      case 401:
        return new ExtractionError(
          'Authentication required. Please log in again.',
          ExtractionErrorType.UNAUTHORIZED,
          status,
          false
        );
      
      case 429:
        return new ExtractionError(
          'Too many requests. Please wait a moment before trying again.',
          ExtractionErrorType.RATE_LIMITED,
          status,
          true
        );
      
      case 422:
        return new ExtractionError(
          'Unable to extract metadata from this URL. Please fill in the details manually.',
          ExtractionErrorType.EXTRACTION_FAILED,
          status,
          false
        );
      
      case 500:
      case 502:
      case 503:
      case 504:
        return new ExtractionError(
          'Server error occurred. Please try again later.',
          ExtractionErrorType.SERVER_ERROR,
          status,
          true
        );
    }
  }

  // Default error
  return new ExtractionError(
    error.message || 'An unexpected error occurred.',
    ExtractionErrorType.UNKNOWN,
    undefined,
    true
  );
}

/**
 * Get user-friendly error message based on error type
 */
export function getErrorMessage(error: ExtractionError): string {
  return error.message;
}

/**
 * Determine if an error should trigger a retry
 */
export function shouldRetry(error: ExtractionError): boolean {
  return error.retryable;
}