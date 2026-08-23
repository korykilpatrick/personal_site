import { buildPostStructuredData } from './postStructuredData';
import type { PostSummary } from './types';

const post: PostSummary = {
  slug: 'container-and-meaning',
  title: 'Container and Meaning',
  dek: 'The container changes the meaning of what it contains.',
  status: 'published',
  sourcePeriod: '2025',
  publishedAt: '2026-08-23',
  socialImage: '/images/posts/container-and-meaning/social.webp',
  order: 1,
  themes: { primary: 'tools-and-context' },
  conceptIds: ['context', 'interface-design'],
  relations: [],
  wordCount: 680,
  readingMinutes: 3,
};

describe('buildPostStructuredData', () => {
  test('uses canonical concept IDs as keywords', () => {
    expect(buildPostStructuredData(post)).toMatchObject({
      '@type': 'BlogPosting',
      headline: 'Container and Meaning',
      mainEntityOfPage: 'https://korykilpatrick.com/posts/container-and-meaning',
      keywords: 'context, interface-design',
      image: 'https://korykilpatrick.com/images/posts/container-and-meaning/social.webp',
    });
  });
});
