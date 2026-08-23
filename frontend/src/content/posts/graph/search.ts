import type { ContentGraph, PostSummary } from '../types';
import { contentNodeIds } from './compileContentGraph';

export type PostSearchField = 'title' | 'dek' | 'theme' | 'concept';

export interface PostSearchOptions {
  themeId?: string;
  themeScope?: 'all' | 'primary';
  conceptId?: string;
  limit?: number;
}

export interface PostSearchResult {
  post: PostSummary;
  score: number;
  matchedFields: readonly PostSearchField[];
}

const compareStrings = (left: string, right: string) =>
  left < right ? -1 : left > right ? 1 : 0;

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('en')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function themeSearchText(graph: ContentGraph, post: PostSummary): string {
  return [post.themes.primary, ...(post.themes.secondary ?? [])]
    .map((themeId) => {
      const node = graph.nodeById.get(contentNodeIds.theme(themeId));
      return node?.kind === 'theme' ? `${node.theme.title} ${node.theme.description}` : themeId;
    })
    .join(' ');
}

function conceptSearchText(graph: ContentGraph, post: PostSummary): string {
  return post.conceptIds
    .map((conceptId) => {
      const node = graph.nodeById.get(contentNodeIds.concept(conceptId));
      return node?.kind === 'concept'
        ? [node.concept.label, ...(node.concept.aliases ?? [])].join(' ')
        : conceptId;
    })
    .join(' ');
}

export function searchPosts(
  graph: ContentGraph,
  query: string,
  options: PostSearchOptions = {},
): PostSearchResult[] {
  const normalizedQuery = normalizeSearchText(query);
  const terms = normalizedQuery ? normalizedQuery.split(' ') : [];
  const requestedLimit = options.limit ?? Number.POSITIVE_INFINITY;
  const limit = Number.isFinite(requestedLimit)
    ? Math.max(0, Math.floor(requestedLimit))
    : Number.POSITIVE_INFINITY;
  const results: PostSearchResult[] = [];

  for (const post of graph.postBySlug.values()) {
    if (options.themeId && post.themes.primary !== options.themeId) {
      const secondaryMatch = (post.themes.secondary ?? []).includes(options.themeId);
      if (options.themeScope === 'primary' || !secondaryMatch) continue;
    }
    if (options.conceptId && !post.conceptIds.includes(options.conceptId)) continue;

    const title = normalizeSearchText(post.title);
    const dek = normalizeSearchText(post.dek);
    const theme = normalizeSearchText(themeSearchText(graph, post));
    const concept = normalizeSearchText(conceptSearchText(graph, post));
    const combined = `${title} ${dek} ${theme} ${concept}`;
    if (terms.some((term) => !combined.includes(term))) continue;

    let score = normalizedQuery && title === normalizedQuery ? 60 : 0;
    const matchedFields = new Set<PostSearchField>();
    for (const term of terms) {
      if (title.includes(term)) {
        score += 12 + (title.startsWith(term) ? 5 : 0);
        matchedFields.add('title');
      }
      if (concept.includes(term)) {
        score += 8;
        matchedFields.add('concept');
      }
      if (theme.includes(term)) {
        score += 6;
        matchedFields.add('theme');
      }
      if (dek.includes(term)) {
        score += 3;
        matchedFields.add('dek');
      }
    }

    results.push({ post, score, matchedFields: [...matchedFields] });
  }

  return results
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.post.order - right.post.order ||
        compareStrings(left.post.slug, right.post.slug),
    )
    .slice(0, limit);
}
