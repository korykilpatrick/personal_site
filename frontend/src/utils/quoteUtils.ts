export interface QuoteTimingOptions {
  minDisplayMs?: number;
  maxDisplayMs?: number;
  wordsPerMinute?: number;
}

const DEFAULT_WORDS_PER_MINUTE = 125;

export const calculateDisplayTime = (
  text: string,
  {
    minDisplayMs = 3500,
    maxDisplayMs = 9000,
    wordsPerMinute = DEFAULT_WORDS_PER_MINUTE,
  }: QuoteTimingOptions = {},
): number => {
  if (!text) {
    return minDisplayMs;
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const msPerWord = (60 * 1000) / wordsPerMinute;
  const timeNeededForWords = wordCount * msPerWord;

  return Math.min(maxDisplayMs, Math.max(minDisplayMs, timeNeededForWords));
};

export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

export const toPlainText = (text: string): string =>
  text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`>#~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const truncateAtWordBoundary = (text: string, maxChars: number): string => {
  if (text.length <= maxChars) {
    return text;
  }

  const truncated = text.slice(0, maxChars);
  const lastSpace = truncated.lastIndexOf(' ');
  const safeSlice = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;

  return `${safeSlice.trim()}...`;
};
