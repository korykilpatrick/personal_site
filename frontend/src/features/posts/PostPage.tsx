import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import PageMetadata from '@/components/layout/PageMetadata';
import HouseRule from '@/components/posts/HouseRule';
import PostRenderer from '@/components/posts/PostRenderer';
import { getRelatedPosts } from '@/content/posts/graph/selectors';
import { formatReadingMinutes } from '@/content/posts/postText';
import { buildPostStructuredData } from '@/content/posts/postStructuredData';
import type { LoadedPost } from '@/content/posts/types';
import { usePosts } from '@/context/PostsContext';
import PostsState from './PostsState';

const relationshipProvenanceLabels = {
  authored: 'Editorial link',
  'body-link': 'In the post',
  inferred: 'Shared idea',
} as const;

const PostPage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const location = useLocation();
  const {
    archive,
    loading: archiveLoading,
    error: archiveError,
    retry,
    getPost,
    prefetchPost,
  } = usePosts();
  const [post, setPost] = useState<LoadedPost | null>(null);
  const [postError, setPostError] = useState<Error | null>(null);
  const [postLoading, setPostLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setPost(null);
    setPostError(null);
    setPostLoading(true);

    void getPost(slug)
      .then((loaded) => {
        if (active) setPost(loaded);
      })
      .catch((reason: unknown) => {
        if (active) setPostError(reason instanceof Error ? reason : new Error(String(reason)));
      })
      .finally(() => {
        if (active) setPostLoading(false);
      });

    return () => {
      active = false;
    };
  }, [attempt, getPost, slug]);

  const summary = archive?.postBySlug.get(slug);
  const primaryTheme = summary
    ? archive?.taxonomy.themes.find((theme) => theme.id === summary.themes.primary)
    : undefined;
  const concepts = summary
    ? summary.conceptIds.flatMap((conceptId) => {
        const concept = archive?.taxonomy.concepts.find((candidate) => candidate.id === conceptId);
        return concept ? [concept] : [];
      })
    : [];
  const relatedPosts =
    archive && summary
      ? getRelatedPosts(archive.contentGraph, summary.slug, {
          includeInferred: true,
          limit: 4,
        })
      : [];
  const structuredData = useMemo<Record<string, unknown> | undefined>(
    () => (post ? buildPostStructuredData(post) : undefined),
    [post],
  );
  const requestedOrigin = (location.state as { postsOrigin?: unknown } | null)?.postsOrigin;
  const postsOrigin =
    typeof requestedOrigin === 'string' && /^\/posts(?:\?|$)/.test(requestedOrigin)
      ? requestedOrigin
      : '/posts';

  if ((archiveLoading && !archive) || postLoading) {
    return <PostsState kind="loading" />;
  }

  if (archiveError && !archive) {
    return <PostsState kind="error" onRetry={retry} />;
  }

  if (archive && !summary) {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-[42rem] flex-col items-center justify-center text-center">
        <PageMetadata
          title="Post not found"
          description="That post is not in Kory Kilpatrick's public archive."
          path={location.pathname}
          noIndex
        />
        <h1 className="mb-7 text-5xl">Post not found.</h1>
        <Link to={postsOrigin} className="site-link-chip">
          Browse all posts
        </Link>
      </div>
    );
  }

  if (postError || !post || !archive || !summary) {
    return <PostsState kind="error" onRetry={() => setAttempt((value) => value + 1)} />;
  }

  return (
    <article className="mx-auto w-full max-w-[78rem] pb-8 pt-1 sm:pt-4">
      <PageMetadata
        title={post.title}
        description={post.dek}
        path={`/posts/${post.slug}`}
        type="article"
        image={post.socialImage}
        noIndex={post.status === 'draft' || archive.visibility === 'preview'}
        structuredData={structuredData}
      />

      <header className="mx-auto mb-10 max-w-[55rem] sm:mb-14">
        <Link
          to={postsOrigin}
          className="site-meta mb-8 inline-flex items-center gap-2 no-underline transition hover:text-oxblood"
        >
          <span aria-hidden="true">←</span> All posts
        </Link>
        {primaryTheme ? (
          <div className="mb-4">
            <Link
              to={`/posts?theme=${encodeURIComponent(primaryTheme.id)}`}
              className="site-link-chip"
              aria-label={`Browse posts in the ${primaryTheme.title} theme`}
            >
              {primaryTheme.title}
            </Link>
          </div>
        ) : null}
        <h1 className="post-title mb-5 text-primary">{post.title}</h1>
        <p className="mb-6 max-w-[47rem] text-[1.12rem] leading-[1.62] text-textSecondary sm:text-[1.28rem]">
          {post.dek}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="site-meta">{formatReadingMinutes(post.readingMinutes)}</span>
          <span className="text-[0.6rem] text-oxblood/75" aria-hidden="true">
            ◆
          </span>
          <span className="site-meta">Drawn from the archive · {post.sourcePeriod}</span>
          {concepts.map((concept) => (
            <Link
              key={concept.id}
              to={`/posts?concept=${encodeURIComponent(concept.id)}`}
              className="site-link-chip px-2.5 py-1 text-[0.6rem]"
              aria-label={`Browse posts about ${concept.label}`}
            >
              {concept.label}
            </Link>
          ))}
        </div>
        <HouseRule className="mt-9" />
      </header>

      <PostRenderer body={post.body} />

      <footer className="mx-auto mt-14 max-w-[55rem] sm:mt-20">
        <HouseRule className="mb-10" />

        {relatedPosts.length > 0 ? (
          <section aria-labelledby="related-posts-heading">
            <h2 id="related-posts-heading" className="mb-5 text-3xl">
              Follow the thread
            </h2>
            <ul className="divide-y divide-walnut/15 border-y border-walnut/15">
              {relatedPosts.map((relationship) => (
                <li key={relationship.post.slug}>
                  <Link
                    to={`/posts/${relationship.post.slug}`}
                    state={{ postsOrigin }}
                    className="group block py-4 no-underline"
                    onMouseEnter={() => prefetchPost(relationship.post.slug)}
                    onFocus={() => prefetchPost(relationship.post.slug)}
                  >
                    <span className="flex items-baseline justify-between gap-5">
                      <span className="font-serif text-xl text-primary transition group-hover:text-oxblood sm:text-2xl">
                        {relationship.post.title}
                      </span>
                      <span className="site-meta whitespace-nowrap">
                        {formatReadingMinutes(relationship.post.readingMinutes)}
                      </span>
                    </span>
                    <span className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm leading-relaxed text-textSecondary">
                      <span className="site-meta">
                        {relationshipProvenanceLabels[relationship.edge.provenance]}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{relationship.reason}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </footer>
    </article>
  );
};

export default PostPage;
