import {
  explorerCanonicalPath,
  explorerStatesEqual,
  focusPostInExplorerState,
  parseExplorerState,
  serializeExplorerState,
  updateExplorerState,
} from './explorerState';

const universe = {
  themeIds: ['inquiry-and-tools', 'making-and-craft'],
  conceptIds: ['context', 'practice'],
  postSlugs: ['question-machine', 'unfinished-letter'],
};

describe('posts explorer URL state', () => {
  test('parses shareable state while dropping unknown graph identifiers', () => {
    expect(
      parseExplorerState(
        '?view=list&theme=inquiry-and-tools&concept=unknown&focus=question-machine&q=  clear   thought',
        universe,
      ),
    ).toEqual({
      view: 'list',
      themeId: 'inquiry-and-tools',
      focusSlug: 'question-machine',
      query: 'clear thought',
    });
  });

  test('serializes parameters in a stable order with an explicit, device-independent view', () => {
    expect(
      serializeExplorerState({
        view: 'list',
        themeId: 'inquiry-and-tools',
        conceptId: 'context',
        focusSlug: 'question-machine',
        query: 'clear thought',
      }),
    ).toBe(
      '?view=list&theme=inquiry-and-tools&concept=context&focus=question-machine&q=clear+thought',
    );
    expect(serializeExplorerState({ view: 'map', query: '' })).toBe('?view=map');
  });

  test('turns a responsive first-visit choice into a shareable explicit view', () => {
    const compactFirstVisit = parseExplorerState('', universe, { defaultView: 'list' });
    const shareable = serializeExplorerState(compactFirstVisit);

    expect(shareable).toBe('?view=list');
    expect(parseExplorerState(shareable, universe, { defaultView: 'map' }).view).toBe('list');
    expect(parseExplorerState('?view=map', universe, { defaultView: 'list' }).view).toBe('map');
  });

  test('preserves an in-progress word separator across URL-controlled input round trips', () => {
    const afterSpace = updateExplorerState(parseExplorerState('?view=map&q=poker', universe), {
      query: 'poker ',
    });
    const serialized = serializeExplorerState(afterSpace);

    expect(serialized).toBe('?view=map&q=poker+');
    const roundTripped = parseExplorerState(serialized, universe);
    expect(roundTripped.query).toBe('poker ');
    expect(
      serializeExplorerState(
        updateExplorerState(roundTripped, { query: `${roundTripped.query}business` }),
      ),
    ).toBe('?view=map&q=poker+business');
  });

  test('moves incompatible filters to the focused post primary theme', () => {
    const current = parseExplorerState(
      '?view=map&theme=inquiry-and-tools&concept=context&q=compass',
      universe,
    );

    expect(
      focusPostInExplorerState(current, {
        slug: 'unfinished-letter',
        primaryThemeId: 'making-and-craft',
        visible: false,
      }),
    ).toEqual({
      view: 'map',
      themeId: 'making-and-craft',
      focusSlug: 'unfinished-letter',
      query: '',
    });
  });

  test('supports immutable patches, equality checks, and theme canonicals', () => {
    const initial = parseExplorerState('', universe);
    const selected = updateExplorerState(initial, {
      themeId: 'making-and-craft',
      focusSlug: 'unfinished-letter',
    });

    expect(initial.themeId).toBeUndefined();
    expect(explorerStatesEqual(initial, selected)).toBe(false);
    expect(explorerCanonicalPath(selected)).toBe('/posts/themes/making-and-craft');
  });
});
