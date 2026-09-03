import { getShelfBookCounts } from '../bookshelfCounts';

describe('getShelfBookCounts', () => {
  it('counts shelf membership across the complete collection', () => {
    const counts = getShelfBookCounts([
      {
        shelves: [
          { id: 1, name: 'Biography' },
          { id: 2, name: 'Currently Reading' },
        ],
      },
      { shelves: [{ id: 1, name: 'Biography' }] },
      { shelves: [{ id: 3, name: 'Classics' }] },
    ]);

    expect(counts.get(1)).toBe(2);
    expect(counts.get(2)).toBe(1);
    expect(counts.get(3)).toBe(1);
  });

  it('does not count duplicate shelf entries on the same book twice', () => {
    const counts = getShelfBookCounts([
      {
        shelves: [
          { id: 1, name: 'Biography' },
          { id: 1, name: 'Biography' },
        ],
      },
    ]);

    expect(counts.get(1)).toBe(1);
  });
});
