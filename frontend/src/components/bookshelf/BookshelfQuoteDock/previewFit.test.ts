import { fitPreviewText, truncatePreviewCandidate } from './previewFit';

describe('previewFit', () => {
  it('truncates at a word boundary without adding an ellipsis', () => {
    expect(truncatePreviewCandidate('The quick brown fox jumps', 15)).toBe('The quick brown');
  });

  it('returns the full text when it already fits', () => {
    const result = fitPreviewText({
      plainText: 'Short quote',
      baseCharLimit: 200,
      maxHeight: 40,
      measureHeight: () => 20,
    });

    expect(result).toEqual({
      text: 'Short quote',
      truncated: false,
    });
  });

  it('shrinks the preview when the measured height exceeds the available space', () => {
    const result = fitPreviewText({
      plainText: 'This preview should be shortened so the more control can render cleanly.',
      baseCharLimit: 50,
      maxHeight: 30,
      measureHeight: (candidate, truncated) => {
        if (!truncated) {
          return 20;
        }

        return candidate.length > 22 ? 60 : 20;
      },
    });

    expect(result.truncated).toBe(true);
    expect(result.text.length).toBeLessThanOrEqual(22);
    expect(result.text.endsWith('...')).toBe(false);
  });
});
