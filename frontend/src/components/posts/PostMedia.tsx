import React from 'react';

type MediaAlignment = 'body' | 'wide' | 'full';

interface FigureProps {
  src?: string;
  alt?: string;
  caption?: string;
  align?: MediaAlignment;
  width?: string | number;
  height?: string | number;
}

interface YouTubeProps {
  url?: string;
  title?: string;
  caption?: string;
  align?: MediaAlignment;
}

interface TweetProps {
  url?: string;
  fallback?: string;
  author?: string;
  align?: MediaAlignment;
}

interface VideoProps {
  src?: string;
  title?: string;
  caption?: string;
  poster?: string;
  captionsSrc?: string;
  captionsLanguage?: string;
  captionsLabel?: string;
  transcriptUrl?: string;
  align?: MediaAlignment;
}

interface PullQuoteProps {
  children?: React.ReactNode;
  attribution?: string;
}

const alignmentClass = (align: MediaAlignment = 'wide') =>
  align === 'body' ? '' : align === 'full' ? 'post-full' : 'post-wide';

function isSafeMediaUrl(value: string): boolean {
  if (value.startsWith('/')) {
    return !value.startsWith('//');
  }

  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function extractYouTubeVideoId(value: string): string | null {
  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, '');
    if (hostname === 'youtu.be') {
      return /^[\w-]{11}$/.test(url.pathname.slice(1)) ? url.pathname.slice(1) : null;
    }
    if (hostname !== 'youtube.com' && hostname !== 'm.youtube.com') {
      return null;
    }
    const candidate =
      url.searchParams.get('v') ?? url.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})/)?.[1];
    return candidate && /^[\w-]{11}$/.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

export function extractTweetId(value: string): string | null {
  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, '');
    if (!['x.com', 'twitter.com', 'mobile.twitter.com'].includes(hostname)) {
      return null;
    }
    return url.pathname.match(/\/status\/(\d+)/)?.[1] ?? null;
  } catch {
    return null;
  }
}

export const PostFigure: React.FC<FigureProps> = ({
  src = '',
  alt = '',
  caption,
  align = 'wide',
  width,
  height,
}) => {
  if (!src || !alt || !isSafeMediaUrl(src)) {
    return null;
  }

  return (
    <figure className={`post-media ${alignmentClass(align)}`}>
      <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
};

export const YouTubeEmbed: React.FC<YouTubeProps> = ({
  url = '',
  title = 'Video',
  caption,
  align = 'wide',
}) => {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    return null;
  }

  return (
    <figure className={`post-media post-embed ${alignmentClass(align)}`}>
      <div className="post-embed-aspect">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={title}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
};

export const TweetEmbed: React.FC<TweetProps> = ({
  url = '',
  fallback = 'View this post on X.',
  author,
  align = 'wide',
}) => {
  const tweetId = extractTweetId(url);
  if (!tweetId) {
    return null;
  }

  return (
    <figure className={`post-media post-tweet ${alignmentClass(align)}`}>
      <blockquote>
        <p>{fallback}</p>
        {author ? <cite>{author}</cite> : null}
      </blockquote>
      <iframe
        src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&dnt=true&theme=light`}
        title={author ? `Post by ${author} on X` : 'Embedded post on X'}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <a href={url} target="_blank" rel="noopener noreferrer" className="post-embed-fallback">
        Open the original on X
      </a>
    </figure>
  );
};

export const PostVideo: React.FC<VideoProps> = ({
  src = '',
  title = 'Video',
  caption,
  poster,
  captionsSrc,
  captionsLanguage = 'en',
  captionsLabel = 'English',
  transcriptUrl,
  align = 'wide',
}) => {
  if (
    !isSafeMediaUrl(src) ||
    (poster && !isSafeMediaUrl(poster)) ||
    (captionsSrc && !isSafeMediaUrl(captionsSrc)) ||
    (transcriptUrl && !isSafeMediaUrl(transcriptUrl)) ||
    (!captionsSrc && !transcriptUrl)
  ) {
    return null;
  }

  return (
    <figure className={`post-media ${alignmentClass(align)}`}>
      <video src={src} poster={poster} controls preload="metadata" aria-label={title}>
        {captionsSrc ? (
          <track
            kind="captions"
            src={captionsSrc}
            srcLang={captionsLanguage}
            label={captionsLabel}
            default
          />
        ) : null}
      </video>
      {caption ? <figcaption>{caption}</figcaption> : null}
      {transcriptUrl ? (
        <a
          href={transcriptUrl}
          target={transcriptUrl.startsWith('/') ? undefined : '_blank'}
          rel={transcriptUrl.startsWith('/') ? undefined : 'noopener noreferrer'}
          className="post-media-transcript"
        >
          Read the transcript
        </a>
      ) : null}
    </figure>
  );
};

export const PostPullQuote: React.FC<PullQuoteProps> = ({ children, attribution }) => (
  <figure className="post-pull-quote post-wide">
    <blockquote>{children}</blockquote>
    {attribution ? <figcaption>{attribution}</figcaption> : null}
  </figure>
);
