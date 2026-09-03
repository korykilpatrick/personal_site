import { BookWithShelves } from 'types/index';

type ShelvedBook = Pick<BookWithShelves, 'shelves'>;

/**
 * Count each book once per shelf across the complete loaded collection.
 */
export const getShelfBookCounts = (
  books: ReadonlyArray<ShelvedBook>,
): ReadonlyMap<number, number> => {
  const counts = new Map<number, number>();

  books.forEach((book) => {
    const countedShelfIds = new Set<number>();

    book.shelves?.forEach((shelf) => {
      if (countedShelfIds.has(shelf.id)) {
        return;
      }

      countedShelfIds.add(shelf.id);
      counts.set(shelf.id, (counts.get(shelf.id) ?? 0) + 1);
    });
  });

  return counts;
};
