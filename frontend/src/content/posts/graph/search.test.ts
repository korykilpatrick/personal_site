import { createFixtureGraph } from './__fixtures__/contentGraphFixture';
import { normalizeSearchText, searchPosts } from './search';

describe('post graph search', () => {
  const graph = createFixtureGraph('published');

  test('searches titles, theme copy, concepts, and aliases with deterministic ranking', () => {
    expect(searchPosts(graph, 'question').map((result) => result.post.slug)).toEqual([
      'question-machine',
    ]);
    expect(
      searchPosts(graph, 'artificial intelligence context').map((result) => result.post.slug),
    ).toEqual(['context-matters', 'question-machine']);
    expect(searchPosts(graph, 'tools').map((result) => result.post.slug)).toEqual([
      'steady-practice',
      'question-machine',
      'context-matters',
    ]);
  });

  test('applies theme and concept filters before limiting results', () => {
    expect(
      searchPosts(graph, '', { themeId: 'tools-and-context', limit: 2 }).map(
        (result) => result.post.slug,
      ),
    ).toEqual(['steady-practice', 'question-machine']);
    expect(searchPosts(graph, '', { conceptId: 'machine-intelligence' }).map((result) => result.post.slug)).toEqual([
      'question-machine',
      'context-matters',
    ]);
  });

  test('can restrict a theme filter to the post primary theme', () => {
    expect(
      searchPosts(graph, '', { themeId: 'tools-and-context', themeScope: 'primary' }).map(
        (result) => result.post.slug,
      ),
    ).toEqual(['question-machine', 'context-matters']);
  });

  test('normalizes punctuation and accents', () => {
    expect(normalizeSearchText('  Déjà—VU!  ')).toBe('deja vu');
  });
});
