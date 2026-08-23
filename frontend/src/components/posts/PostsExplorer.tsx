import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import PostAtlasMap from './PostAtlasMap';
import PostIndexItem from './PostIndexItem';
import type {
  ContentGraph,
  ContentTaxonomy,
  PostGraphLayout,
  PostSummary,
} from '@/content/posts/types';
import {
  focusPostInExplorerState,
  parseExplorerState,
  serializeExplorerState,
  updateExplorerState,
  type ExplorerView,
  type PostsExplorerState,
} from '@/content/posts/graph/explorerState';
import { searchPosts } from '@/content/posts/graph/search';

const useCompactExplorer = () => {
  const [compact, setCompact] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia('(max-width: 46rem)').matches,
  );

  useEffect(() => {
    const query = window.matchMedia('(max-width: 46rem)');
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return compact;
};

interface PostsExplorerProps {
  posts: readonly PostSummary[];
  contentGraph: ContentGraph;
  taxonomy: ContentTaxonomy;
  graphLayout: PostGraphLayout;
  onPrefetchPost: (slug: string) => void;
}

const PostsExplorer: React.FC<PostsExplorerProps> = ({
  posts,
  contentGraph,
  taxonomy,
  graphLayout,
  onPrefetchPost,
}) => {
  const compact = useCompactExplorer();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const focusPushedRef = useRef(false);
  const focusPathShiftedRef = useRef(false);
  const requestedView = searchParams.get('view');
  const hasExplicitView = requestedView === 'map' || requestedView === 'list';
  const firstVisitView: ExplorerView = compact ? 'list' : 'map';
  const universe = useMemo(
    () => ({
      themeIds: taxonomy.themes.map((theme) => theme.id),
      conceptIds: taxonomy.concepts.map((concept) => concept.id),
      postSlugs: posts.map((post) => post.slug),
    }),
    [posts, taxonomy.concepts, taxonomy.themes],
  );
  const state = useMemo(
    () => parseExplorerState(searchParams, universe, { defaultView: firstVisitView }),
    [firstVisitView, searchParams, universe],
  );

  const commitState = useCallback(
    (patch: Partial<PostsExplorerState>, options: { replace?: boolean } = {}) => {
      const next = updateExplorerState(state, patch);
      const serialized = serializeExplorerState(next);
      setSearchParams(serialized.startsWith('?') ? serialized.slice(1) : serialized, {
        replace: options.replace ?? false,
      });
    },
    [setSearchParams, state],
  );

  const loadedBySlug = useMemo(() => new Map(posts.map((post) => [post.slug, post])), [posts]);
  const resultPosts = useMemo(
    () =>
      searchPosts(contentGraph, state.query, {
        themeId: state.themeId,
        themeScope: 'primary',
        conceptId: state.conceptId,
      })
        .map((result) => loadedBySlug.get(result.post.slug))
        .filter((post): post is (typeof posts)[number] => Boolean(post)),
    [loadedBySlug, state.conceptId, state.query, state.themeId],
  );
  const visibleSlugs = useMemo(() => new Set(resultPosts.map((post) => post.slug)), [resultPosts]);

  useEffect(() => {
    const focusedPost = state.focusSlug ? loadedBySlug.get(state.focusSlug) : undefined;
    const focusNeedsReveal = Boolean(
      focusedPost && state.focusSlug && !visibleSlugs.has(state.focusSlug),
    );
    if (hasExplicitView && !focusNeedsReveal) return;

    const next =
      focusedPost && state.focusSlug && focusNeedsReveal
        ? focusPostInExplorerState(state, {
            slug: state.focusSlug,
            primaryThemeId: focusedPost.themes.primary,
            visible: false,
          })
        : state;
    setSearchParams(serializeExplorerState(next).slice(1), { replace: true });
  }, [hasExplicitView, loadedBySlug, setSearchParams, state, visibleSlugs]);

  const conceptCounts = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((post) => {
      post.conceptIds.forEach((conceptId) => {
        counts.set(conceptId, (counts.get(conceptId) ?? 0) + 1);
      });
    });
    return counts;
  }, [posts]);
  const visibleConcepts = useMemo(
    () =>
      taxonomy.concepts
        .filter(
          (concept) => (conceptCounts.get(concept.id) ?? 0) >= 2 || concept.id === state.conceptId,
        )
        .sort((left, right) => left.label.localeCompare(right.label)),
    [conceptCounts, state.conceptId],
  );
  const themeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((post) => {
      counts.set(post.themes.primary, (counts.get(post.themes.primary) ?? 0) + 1);
    });
    return counts;
  }, [posts]);
  const themeById = useMemo(
    () => new Map(taxonomy.themes.map((theme) => [theme.id, theme])),
    [taxonomy.themes],
  );
  const conceptById = useMemo(
    () => new Map(taxonomy.concepts.map((concept) => [concept.id, concept])),
    [taxonomy.concepts],
  );

  const hasFilters = Boolean(state.themeId || state.conceptId || state.query);
  const resultLabel = `${resultPosts.length} ${resultPosts.length === 1 ? 'post' : 'posts'}`;
  const postsOrigin = `${location.pathname}${location.search}`;

  useEffect(() => {
    if (!state.focusSlug) {
      focusPushedRef.current = false;
      focusPathShiftedRef.current = false;
    }
  }, [state.focusSlug]);

  const handleFocusPost = useCallback(
    (focusSlug?: string) => {
      if (focusSlug) {
        const tracingExistingPath = Boolean(state.focusSlug);
        if (!tracingExistingPath) {
          focusPushedRef.current = true;
          focusPathShiftedRef.current = false;
        }
        const targetPost = loadedBySlug.get(focusSlug);
        const targetVisible = visibleSlugs.has(focusSlug);
        if (tracingExistingPath && !targetVisible) {
          focusPathShiftedRef.current = true;
        }
        const next = targetPost
          ? focusPostInExplorerState(state, {
              slug: focusSlug,
              primaryThemeId: targetPost.themes.primary,
              visible: targetVisible,
            })
          : updateExplorerState(state, { focusSlug });
        const serialized = serializeExplorerState(next);
        setSearchParams(serialized.slice(1), { replace: tracingExistingPath });
        return;
      }

      if (focusPathShiftedRef.current) {
        focusPathShiftedRef.current = false;
        focusPushedRef.current = false;
        commitState({ focusSlug: undefined }, { replace: true });
        return;
      }

      if (focusPushedRef.current && window.history.length > 1) {
        focusPushedRef.current = false;
        window.history.back();
        return;
      }

      commitState({ focusSlug: undefined }, { replace: true });
    },
    [commitState, loadedBySlug, setSearchParams, state, visibleSlugs],
  );

  return (
    <div className="posts-explorer">
      <section
        className={`posts-explorer-controls is-${state.view}-view`}
        aria-label="Explore posts"
      >
        <div className="posts-explorer-control-row">
          <label className="posts-explorer-search">
            <span className="sr-only">Search posts</span>
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <circle cx="10.7" cy="10.7" r="6.2" />
              <path d="m15.3 15.3 5 5" />
            </svg>
            <input
              type="search"
              value={state.query}
              placeholder="Search posts…"
              onChange={(event) =>
                commitState({ query: event.target.value, focusSlug: undefined }, { replace: true })
              }
            />
            {state.query && (
              <button
                type="button"
                onClick={() => commitState({ query: '', focusSlug: undefined })}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </label>

          <label className="posts-explorer-thread-select">
            <span>Concept</span>
            <select
              value={state.conceptId ?? ''}
              onChange={(event) =>
                commitState({ conceptId: event.target.value || undefined, focusSlug: undefined })
              }
            >
              <option value="">All concepts</option>
              {visibleConcepts.map((concept) => (
                <option key={concept.id} value={concept.id}>
                  {concept.label} ({conceptCounts.get(concept.id) ?? 0})
                </option>
              ))}
            </select>
          </label>

          <div className="posts-explorer-view-switch" role="group" aria-label="Choose view">
            <button
              type="button"
              aria-pressed={state.view === 'map'}
              onClick={() => commitState({ view: 'map' })}
            >
              <span aria-hidden="true">⌘</span> Map
            </button>
            <button
              type="button"
              aria-pressed={state.view === 'list'}
              onClick={() => commitState({ view: 'list', focusSlug: undefined })}
            >
              <span aria-hidden="true">≡</span> List
            </button>
          </div>
        </div>

        {state.view === 'list' && (
          <div className="posts-explorer-themes" role="group" aria-label="Filter by theme">
            {taxonomy.themes.map((theme) => {
              const selected = state.themeId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  data-tone={theme.tone}
                  aria-pressed={selected}
                  onClick={() =>
                    commitState({ themeId: selected ? undefined : theme.id, focusSlug: undefined })
                  }
                >
                  <span>{theme.title}</span>
                  <small>{themeCounts.get(theme.id) ?? 0}</small>
                </button>
              );
            })}
          </div>
        )}

        {hasFilters && (
          <div className="posts-explorer-status" aria-live="polite">
            <span>{resultLabel}</span>
            {state.themeId && <span>{themeById.get(state.themeId)?.title}</span>}
            {state.conceptId && <span>{conceptById.get(state.conceptId)?.label}</span>}
            <button
              type="button"
              onClick={() =>
                commitState({
                  themeId: undefined,
                  conceptId: undefined,
                  query: '',
                  focusSlug: undefined,
                })
              }
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {state.view === 'map' ? (
        resultPosts.length > 0 ? (
          <PostAtlasMap
            posts={posts}
            graph={contentGraph}
            taxonomy={taxonomy}
            layout={graphLayout}
            visibleSlugs={visibleSlugs}
            selectedThemeId={state.themeId}
            focusedSlug={state.focusSlug}
            compactOverview={compact}
            onFocusPost={handleFocusPost}
            onSelectTheme={(themeId) => commitState({ themeId, focusSlug: undefined })}
            onSelectConcept={(conceptId) => commitState({ conceptId, focusSlug: undefined })}
            postsOrigin={postsOrigin}
            onPrefetchPost={onPrefetchPost}
          />
        ) : (
          <div className="posts-explorer-empty" role="status">
            <h2>No posts match those filters.</h2>
            <button
              type="button"
              onClick={() =>
                commitState({
                  themeId: undefined,
                  conceptId: undefined,
                  query: '',
                  focusSlug: undefined,
                })
              }
            >
              Clear filters
            </button>
          </div>
        )
      ) : (
        <section className="posts-ledger" aria-labelledby="post-ledger-heading">
          <div className="posts-ledger-heading">
            <div>
              <h2 id="post-ledger-heading">
                {hasFilters ? resultLabel : `All ${posts.length} posts`}
              </h2>
            </div>
          </div>
          {resultPosts.length > 0 ? (
            <ol className="m-0 list-none p-0">
              {resultPosts.map((post) => (
                <PostIndexItem
                  key={post.slug}
                  post={post}
                  themeTitle={themeById.get(post.themes.primary)?.title ?? post.themes.primary}
                  postsOrigin={postsOrigin}
                  onPrefetch={onPrefetchPost}
                />
              ))}
            </ol>
          ) : (
            <div className="posts-explorer-empty" role="status">
              <h3>No posts match those filters.</h3>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default PostsExplorer;
