import { createFixtureGraph } from './__fixtures__/contentGraphFixture';
import { getPostsForConcept, getPostsForTheme, getRelatedPosts } from './selectors';

describe('graph selectors', () => {
  const graph = createFixtureGraph('published');

  test('returns reason-bearing related posts with authored relationships first', () => {
    const related = getRelatedPosts(graph, 'question-machine', { limit: 2 });

    expect(related.map((result) => result.post.slug)).toEqual([
      'steady-practice',
      'context-matters',
    ]);
    expect(related[0]).toMatchObject({
      direction: 'undirected',
      reason: 'One supplies discipline; the other removes the cost of asking.',
      edge: { provenance: 'authored' },
    });
    expect(related[1].edge.provenance).toBe('inferred');
    expect(related[1].reason).toContain('Tools & Context');
  });

  test('can exclude inferred results without losing authored or body links', () => {
    expect(
      getRelatedPosts(graph, 'question-machine', { includeInferred: false }).map(
        (result) => result.post.slug,
      ),
    ).toEqual(['steady-practice']);
    expect(getRelatedPosts(graph, 'unfinished-letter')[0]).toMatchObject({
      post: { slug: 'context-matters' },
      edge: { provenance: 'body-link', kind: 'mentions' },
    });
  });

  test('selects theme and concept collections from the visible catalog', () => {
    expect(getPostsForTheme(graph, 'tools-and-context').map((post) => post.slug)).toEqual([
      'question-machine',
      'context-matters',
      'steady-practice',
    ]);
    expect(getPostsForConcept(graph, 'machine-intelligence').map((post) => post.slug)).toEqual([
      'question-machine',
      'context-matters',
    ]);
  });
});
