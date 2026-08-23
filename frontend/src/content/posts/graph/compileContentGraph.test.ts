import { compileContentGraph } from './compileContentGraph';
import {
  createFixtureGraph,
  fixturePosts,
  fixtureTaxonomy,
} from './__fixtures__/contentGraphFixture';

describe('compileContentGraph', () => {
  test('prunes draft nodes and every edge that could expose them', () => {
    const graph = createFixtureGraph('published');

    expect(graph.visiblePostSlugs.has('private-draft')).toBe(false);
    expect(graph.nodeById.has('post:private-draft')).toBe(false);
    expect(graph.nodeById.has('theme:change-and-identity')).toBe(false);
    expect(
      graph.edges.some(
        (edge) =>
          edge.from === 'post:private-draft' || edge.to === 'post:private-draft',
      ),
    ).toBe(false);
  });

  test('keeps authored and body-link provenance ahead of transparent inference', () => {
    const graph = createFixtureGraph('all');
    const authoredPair = graph.edges.filter(
      (edge) =>
        new Set([edge.from, edge.to]).has('post:steady-practice') &&
        new Set([edge.from, edge.to]).has('post:question-machine'),
    );
    const inferredPair = graph.edges.find(
      (edge) =>
        edge.kind === 'similar' &&
        new Set([edge.from, edge.to]).has('post:question-machine') &&
        new Set([edge.from, edge.to]).has('post:context-matters'),
    );

    expect(authoredPair).toHaveLength(1);
    expect(authoredPair[0]).toMatchObject({
      provenance: 'authored',
      kind: 'contrasts',
      reason: 'One supplies discipline; the other removes the cost of asking.',
    });
    expect(inferredPair).toMatchObject({ provenance: 'inferred', kind: 'similar' });
    expect(inferredPair?.reason).toContain('Tools & Context');
    expect(inferredPair?.reason).toContain('Machine intelligence');
    expect(
      graph.edges.find(
        (edge) =>
          edge.from === 'post:unfinished-letter' && edge.to === 'post:context-matters',
      ),
    ).toMatchObject({ provenance: 'body-link', kind: 'mentions' });
  });

  test('is deterministic when input post and body-link order changes', () => {
    const first = createFixtureGraph('all');
    const second = compileContentGraph({
      posts: [...fixturePosts].reverse(),
      taxonomy: fixtureTaxonomy,
      visibility: 'all',
      bodyLinks: {
        'question-machine': ['private-draft'],
        'unfinished-letter': ['context-matters'],
      },
    });

    expect(second.nodes.map((node) => node.id)).toEqual(first.nodes.map((node) => node.id));
    expect(second.edges).toEqual(first.edges);
  });

  test('rejects unknown canonical concepts before constructing a partial graph', () => {
    const brokenPost = {
      ...fixturePosts[0],
      conceptIds: ['not-in-the-taxonomy'],
    };

    expect(() =>
      compileContentGraph({
        posts: [brokenPost, ...fixturePosts.slice(1)],
        taxonomy: fixtureTaxonomy,
        visibility: 'all',
      }),
    ).toThrow('unknown concept not-in-the-taxonomy');
  });
});
