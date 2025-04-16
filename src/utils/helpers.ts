/**
 * Safely parses a comma-separated string into an array of trimmed, non-empty strings.
 * Handles null, undefined, or empty input strings gracefully.
 * 
 * @param str The comma-separated string to parse.
 * @returns An array of strings, or an empty array if input is invalid.
 */
export const parseCommaSeparatedString = (str: string | undefined | null): string[] => {
  if (!str) {
    return [];
  }
  return str
    .split(',')
    .map(item => item.trim())
    .filter(item => item !== '');
};

// Add other general utility functions here as needed 