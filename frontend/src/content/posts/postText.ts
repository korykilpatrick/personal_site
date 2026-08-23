const WORD_PATTERN = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;

export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/<Footnote\b[^>]*>/gi, '')
    .replace(/<\/(?:Footnote)>/gi, '')
    .replace(/<(?:Figure|YouTube|Tweet|Video|PullQuote)\b[^>]*\/?\s*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_>#~|=-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function countWords(markdown: string): number {
  return markdownToPlainText(markdown).match(WORD_PATTERN)?.length ?? 0;
}

export function readingMinutes(markdown: string, wordsPerMinute = 220): number {
  return Math.max(1, Math.ceil(countWords(markdown) / wordsPerMinute));
}

export function formatReadingTime(markdown: string): string {
  return formatReadingMinutes(readingMinutes(markdown));
}

export function formatReadingMinutes(minutes: number): string {
  return `${Math.max(1, Math.round(minutes))} min read`;
}

export function numberFootnotes(markdown: string): string {
  const reservedNumbers = new Set(
    [...markdown.matchAll(/<Footnote\b[^>]*\bnumber=["'](\d+)["']/gi)].map((match) =>
      Number(match[1]),
    ),
  );
  const assignedNumbers = new Set<number>();
  let nextNumber = 1;

  return markdown.replace(/<Footnote\b(?![^>]*\bnumber=)/g, () => {
    while (reservedNumbers.has(nextNumber) || assignedNumbers.has(nextNumber)) {
      nextNumber += 1;
    }
    const assignedNumber = nextNumber;
    assignedNumbers.add(assignedNumber);
    nextNumber += 1;
    return `<Footnote number="${assignedNumber}"`;
  });
}
