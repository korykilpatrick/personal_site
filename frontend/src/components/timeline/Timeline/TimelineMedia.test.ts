import { extractYouTubeId } from './TimelineMedia';

describe('extractYouTubeId', () => {
  it('extracts ids from long and short YouTube URLs', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=abcdefghijk')).toBe('abcdefghijk');
    expect(extractYouTubeId('https://youtu.be/abcdefghijk')).toBe('abcdefghijk');
  });

  it('returns null for non-YouTube URLs', () => {
    expect(extractYouTubeId('https://example.com/video')).toBeNull();
  });
});
