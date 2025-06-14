export const EXTRACTION_PROMPT_VERSION = 'v1.0.0';

export const createExtractionPrompt = (categories: string[]): string => {
  return `Visit the provided URL and extract the following metadata from the webpage:

1. Title: The main title of the content (prefer article title over site name)
2. Author: The author's name if available
3. Description: A brief description or summary (max 200 characters). If no description is available, create a concise summary based on the content.
4. Image URL: The URL of the main image (OpenGraph image, featured image, or first significant image)
5. Suggested Category: Choose the most appropriate category from: ${categories.join(', ')}
6. Tags: Extract 3-5 relevant tags or keywords that describe the content
7. Publication Date: The publication or creation date if available
8. Content Type: Identify whether this is an article, video, book, paper, or other

Please ensure:
- Extract information even if it requires inferring from context
- For author, look for bylines, "Posted by", "Written by", etc.
- For dates, check publication dates, post dates, or last updated dates
- For images, prefer high-quality featured images over logos or icons
- Tags should be lowercase and relevant to the main topics

If certain information is not available, omit those fields rather than guessing.`;
};

export const CATEGORIES = ['article', 'book', 'video', 'tool', 'other'] as const;