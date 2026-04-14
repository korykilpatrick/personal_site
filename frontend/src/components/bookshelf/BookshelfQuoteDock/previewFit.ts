export interface PreviewFitState {
  text: string;
  truncated: boolean;
  minHeight: number;
}

interface FitPreviewTextOptions {
  plainText: string;
  baseCharLimit: number;
  maxHeight: number;
  measureHeight: (candidate: string, truncated: boolean) => number;
}

export function truncatePreviewCandidate(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }

  const truncated = text.slice(0, maxChars);
  const nextCharacter = text.charAt(maxChars);
  if (!nextCharacter || /\s/.test(nextCharacter)) {
    return truncated.trim();
  }

  const lastSpace = truncated.lastIndexOf(' ');
  const safeSlice = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;

  return safeSlice.trim();
}

export function fitPreviewText({
  plainText,
  baseCharLimit,
  maxHeight,
  measureHeight,
}: FitPreviewTextOptions): Pick<PreviewFitState, 'text' | 'truncated'> {
  if (!plainText) {
    return {
      text: '',
      truncated: false,
    };
  }

  const hardCappedText = truncatePreviewCandidate(plainText, baseCharLimit);
  const wasHardCapped = hardCappedText !== plainText;

  if (measureHeight(hardCappedText, wasHardCapped) <= maxHeight) {
    return {
      text: hardCappedText,
      truncated: wasHardCapped,
    };
  }

  const upperBound = Math.min(baseCharLimit, plainText.length);
  let low = 1;
  let high = upperBound;
  let bestFit = truncatePreviewCandidate(plainText, Math.min(24, upperBound));

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = truncatePreviewCandidate(plainText, mid);

    if (measureHeight(candidate, true) <= maxHeight) {
      bestFit = candidate;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return {
    text: bestFit,
    truncated: true,
  };
}
