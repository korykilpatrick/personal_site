import { BookWithShelves } from 'types/index';

export const CURRENTLY_READING_SHELF_NAMES = new Set(['currently reading', 'currently-reading']);

export const getDateTimestamp = (value?: string | null): number => new Date(value || 0).getTime();

export const isCurrentlyReadingBook = (book: BookWithShelves): boolean =>
  Boolean(
    book.shelves?.some((shelf) => CURRENTLY_READING_SHELF_NAMES.has(shelf.name.toLowerCase())),
  );

export const getCurrentReadingBooks = (
  books: BookWithShelves[],
  options: { fallbackToUnread?: boolean } = {},
): BookWithShelves[] => {
  const explicitMatches = books.filter(isCurrentlyReadingBook);

  if (explicitMatches.length > 0 || !options.fallbackToUnread) {
    return explicitMatches;
  }

  return books.filter((book) => !book.date_read);
};

export const splitBooksByReadingState = (
  books: BookWithShelves[],
): { currentBooks: BookWithShelves[]; shelvedBooks: BookWithShelves[] } =>
  books.reduce(
    (accumulator, book) => {
      if (isCurrentlyReadingBook(book)) {
        accumulator.currentBooks.push(book);
      } else {
        accumulator.shelvedBooks.push(book);
      }

      return accumulator;
    },
    { currentBooks: [] as BookWithShelves[], shelvedBooks: [] as BookWithShelves[] },
  );

export const compareReadingTimeline = (a: BookWithShelves, b: BookWithShelves): number => {
  const aIsCurrentlyReading = isCurrentlyReadingBook(a);
  const bIsCurrentlyReading = isCurrentlyReadingBook(b);

  if (aIsCurrentlyReading !== bIsCurrentlyReading) {
    return aIsCurrentlyReading ? -1 : 1;
  }

  if (aIsCurrentlyReading && bIsCurrentlyReading) {
    return (
      getDateTimestamp(b.date_added) - getDateTimestamp(a.date_added) ||
      a.title.localeCompare(b.title)
    );
  }

  const aHasDateRead = Boolean(a.date_read);
  const bHasDateRead = Boolean(b.date_read);

  if (aHasDateRead !== bHasDateRead) {
    return aHasDateRead ? -1 : 1;
  }

  if (aHasDateRead && bHasDateRead) {
    return (
      getDateTimestamp(b.date_read) - getDateTimestamp(a.date_read) ||
      getDateTimestamp(b.date_added) - getDateTimestamp(a.date_added) ||
      a.title.localeCompare(b.title)
    );
  }

  return (
    getDateTimestamp(b.date_added) - getDateTimestamp(a.date_added) ||
    a.title.localeCompare(b.title)
  );
};
