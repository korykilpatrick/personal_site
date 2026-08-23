import React from 'react';
import { Link } from 'react-router-dom';
import type { PostSummary } from '@/content/posts/types';
import { formatReadingMinutes } from '@/content/posts/postText';

interface PostIndexItemProps {
  post: PostSummary;
  themeTitle: string;
  conceptLabels?: readonly string[];
  postsOrigin: string;
  onPrefetch: (slug: string) => void;
}

const PostIndexItem: React.FC<PostIndexItemProps> = ({
  post,
  themeTitle,
  conceptLabels = [],
  postsOrigin,
  onPrefetch,
}) => (
  <li>
    <Link
      to={`/posts/${post.slug}`}
      state={{ postsOrigin }}
      className="post-index-row group"
      onMouseEnter={() => onPrefetch(post.slug)}
      onFocus={() => onPrefetch(post.slug)}
      onTouchStart={() => onPrefetch(post.slug)}
    >
      <span className="post-index-number" aria-hidden="true">
        {String(post.order).padStart(2, '0')}
      </span>
      <span className="post-index-copy">
        <span className="site-meta mb-2 block">
          {themeTitle} · {formatReadingMinutes(post.readingMinutes)}
        </span>
        <span className="post-index-title">{post.title}</span>
        <span className="post-index-dek">{post.dek}</span>
        {conceptLabels.length > 0 && (
          <span className="post-index-concepts" aria-label="Concepts">
            {conceptLabels.slice(0, 4).join(' · ')}
          </span>
        )}
      </span>
      <span className="post-index-arrow" aria-hidden="true">
        →
      </span>
    </Link>
  </li>
);

export default PostIndexItem;
