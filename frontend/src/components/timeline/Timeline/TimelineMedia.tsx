import React from 'react';
import type { MediaItem } from '@/types/timeline';

export function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

const TimelineMedia: React.FC<{ media: MediaItem }> = ({ media }) => {
  if (media.type === 'image') {
    return (
      <figure className="mb-0">
        <img
          src={media.url}
          alt={media.alt || ''}
          className="w-full rounded-[14px] object-cover shadow-[0_8px_20px_rgba(21,38,63,0.10)]"
        />
        {media.caption && (
          <figcaption className="mt-1.5 text-center font-mono text-[0.6rem] uppercase tracking-[0.12em] text-textTertiary">
            {media.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (media.type === 'embed' && media.embedType === 'youtube') {
    const videoId = extractYouTubeId(media.url);
    if (!videoId) {
      return null;
    }

    return (
      <div className="relative overflow-hidden rounded-[14px] pb-[56.25%] shadow-[0_8px_20px_rgba(21,38,63,0.10)]">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={media.alt || 'Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (media.type === 'link') {
    return (
      <a
        href={media.url}
        target="_blank"
        rel="noopener noreferrer"
        className="site-link-chip"
      >
        {media.alt || media.url}
      </a>
    );
  }

  return null;
};

export default TimelineMedia;
