import { z } from 'zod';

// Schema for OpenAI function response
export const ExtractedContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  suggestedCategory: z.enum(['article', 'book', 'video', 'tool', 'other']).optional(),
  tags: z.array(z.string()).optional(),
  publicationDate: z.string().optional(),
  contentType: z.enum(['article', 'video', 'book', 'paper', 'other']).optional(),
});

export type OpenAIExtractedContent = z.infer<typeof ExtractedContentSchema>;

// Schema for URL validation
export const UrlSchema = z.string().url().refine(
  (url) => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  },
  { message: 'Invalid URL format or protocol' }
);

// Schema for extraction options
export const ExtractionOptionsSchema = z.object({
  forceRefresh: z.boolean().optional(),
  includeFullContent: z.boolean().optional(),
});

// Schema for API request body
export const ExtractionRequestSchema = z.object({
  url: UrlSchema,
  options: ExtractionOptionsSchema.optional(),
});