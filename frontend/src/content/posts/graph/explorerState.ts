export type ExplorerView = 'map' | 'list';

export interface PostsExplorerState {
  view: ExplorerView;
  themeId?: string;
  conceptId?: string;
  focusSlug?: string;
  query: string;
}

export interface ExplorerStateUniverse {
  themeIds: ReadonlySet<string> | readonly string[];
  conceptIds: ReadonlySet<string> | readonly string[];
  postSlugs: ReadonlySet<string> | readonly string[];
}

export interface ExplorerStateOptions {
  defaultView?: ExplorerView;
  maximumQueryLength?: number;
}

export interface ExplorerPostFocus {
  slug: string;
  primaryThemeId: string;
  visible: boolean;
}

const asSet = (values: ReadonlySet<string> | readonly string[]) =>
  values instanceof Set ? values : new Set(values);

const cleanQuery = (value: string, maximumLength: number) =>
  value.replace(/\s+/g, ' ').trimStart().slice(0, maximumLength);

export function parseExplorerState(
  search: string | URLSearchParams,
  universe: ExplorerStateUniverse,
  options: ExplorerStateOptions = {},
): PostsExplorerState {
  const defaultView = options.defaultView ?? 'map';
  const maximumQueryLength = options.maximumQueryLength ?? 120;
  const params =
    typeof search === 'string'
      ? new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
      : search;
  const requestedView = params.get('view');
  const requestedTheme = params.get('theme');
  const requestedConcept = params.get('concept');
  const requestedFocus = params.get('focus');
  const themeIds = asSet(universe.themeIds);
  const conceptIds = asSet(universe.conceptIds);
  const postSlugs = asSet(universe.postSlugs);

  return {
    view: requestedView === 'map' || requestedView === 'list' ? requestedView : defaultView,
    ...(requestedTheme && themeIds.has(requestedTheme) ? { themeId: requestedTheme } : {}),
    ...(requestedConcept && conceptIds.has(requestedConcept)
      ? { conceptId: requestedConcept }
      : {}),
    ...(requestedFocus && postSlugs.has(requestedFocus) ? { focusSlug: requestedFocus } : {}),
    query: cleanQuery(params.get('q') ?? '', maximumQueryLength),
  };
}

export function serializeExplorerState(
  state: PostsExplorerState,
  options: ExplorerStateOptions = {},
): string {
  const maximumQueryLength = options.maximumQueryLength ?? 120;
  const params = new URLSearchParams();

  // Always make the view explicit. Otherwise the same shared URL can mean
  // "map" on a wide screen and "list" on a compact one.
  params.set('view', state.view);
  if (state.themeId) params.set('theme', state.themeId);
  if (state.conceptId) params.set('concept', state.conceptId);
  if (state.focusSlug) params.set('focus', state.focusSlug);
  const query = cleanQuery(state.query, maximumQueryLength);
  if (query) params.set('q', query);

  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

export function updateExplorerState(
  current: PostsExplorerState,
  patch: Partial<PostsExplorerState>,
): PostsExplorerState {
  return {
    ...current,
    ...patch,
    query: patch.query === undefined ? current.query : patch.query,
  };
}

/**
 * Focusing a post is also a navigation through the graph. If the current
 * filters hide the destination, move to its primary theme and clear the
 * incompatible narrowers so the destination is visible when focus changes.
 */
export function focusPostInExplorerState(
  current: PostsExplorerState,
  focus: ExplorerPostFocus,
): PostsExplorerState {
  return updateExplorerState(current, {
    focusSlug: focus.slug,
    ...(focus.visible
      ? {}
      : {
          themeId: focus.primaryThemeId,
          conceptId: undefined,
          query: '',
        }),
  });
}

export function explorerStatesEqual(
  left: PostsExplorerState,
  right: PostsExplorerState,
): boolean {
  return (
    left.view === right.view &&
    left.themeId === right.themeId &&
    left.conceptId === right.conceptId &&
    left.focusSlug === right.focusSlug &&
    left.query === right.query
  );
}

export function explorerCanonicalPath(state: PostsExplorerState): string {
  return state.themeId ? `/posts/themes/${encodeURIComponent(state.themeId)}` : '/posts';
}
