import type { PostSummary } from './types';

const SITE_ORIGIN = 'https://korykilpatrick.com';

export function buildPostStructuredData(post: PostSummary): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.dek,
    author: {
      '@type': 'Person',
      name: 'Kory Kilpatrick',
      url: SITE_ORIGIN,
    },
    mainEntityOfPage: `${SITE_ORIGIN}/posts/${post.slug}`,
    ...(post.conceptIds.length > 0 ? { keywords: post.conceptIds.join(', ') } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    ...(post.socialImage ? { image: new URL(post.socialImage, SITE_ORIGIN).toString() } : {}),
  };
}
