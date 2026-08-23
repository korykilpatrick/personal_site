import React from 'react';
import { render, screen } from '@testing-library/react';
import { extractTweetId, extractYouTubeVideoId, PostFigure, PostVideo } from './PostMedia';

describe('post media', () => {
  test('extracts IDs only from allowed YouTube and X hosts', () => {
    expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=AbCdEfGhIjK')).toBe(
      'AbCdEfGhIjK',
    );
    expect(extractYouTubeVideoId('https://youtube.example.com/watch?v=8AHCfZTRGiI')).toBeNull();
    expect(extractTweetId('https://x.com/example/status/1234567890')).toBe('1234567890');
    expect(extractTweetId('https://example.com/example/status/1234567890')).toBeNull();
  });

  test('rejects insecure remote figures', () => {
    const { container } = render(
      <PostFigure src="http://example.com/photo.jpg" alt="An insecure example" />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  test('requires captions or a transcript for self-hosted video', () => {
    const { rerender } = render(<PostVideo src="/clip.mp4" title="A demo" />);
    expect(screen.queryByLabelText('A demo')).not.toBeInTheDocument();

    rerender(
      <PostVideo
        src="/clip.mp4"
        title="A demo"
        captionsSrc="/clip.en.vtt"
        captionsLabel="English"
      />,
    );

    expect(screen.getByLabelText('A demo')).toBeInTheDocument();
    expect(document.querySelector('track[kind="captions"]')).toHaveAttribute('src', '/clip.en.vtt');
  });
});
