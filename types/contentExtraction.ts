export interface ExtractedContent {
  title: string;
  author?: string;
  description?: string;
  imageUrl?: string;
  suggestedCategory?: LibraryCategory;
  tags?: string[];
  publicationDate?: Date;
  contentType?: 'article' | 'video' | 'book' | 'paper' | 'other';
  extractionMetadata: {
    confidence: number;
    extractedAt: Date;
    llmModel: string;
    version: string;
  };
}

export interface ExtractionRequest {
  url: string;
  options?: {
    forceRefresh?: boolean;
    includeFullContent?: boolean;
  };
}

export interface ExtractionResponse {
  success: boolean;
  data?: ExtractedContent;
  error?: ExtractionError;
}

export interface ExtractionError {
  code: 'INVALID_URL' | 'EXTRACTION_FAILED' | 'LLM_ERROR' | 'RATE_LIMITED';
  message: string;
  details?: unknown;
}

export type LibraryCategory = 'article' | 'book' | 'video' | 'tool' | 'other';