import { BookWithShelves } from 'types/index';
import {
  compareReadingTimeline,
  getCurrentReadingBooks,
  isCurrentlyReadingBook,
  splitBooksByReadingState,
} from '../bookshelfReadingState';

const createBook = (id: number, overrides: Partial<BookWithShelves> = {}): BookWithShelves => ({
  id,
  goodreads_id: id,
  img_url: null,
  img_url_small: null,
  title: `Book ${id}`,
  book_link: `https://example.com/books/${id}`,
  author: `Author ${id}`,
  author_link: null,
  num_pages: null,
  avg_rating: null,
  num_ratings: null,
  date_pub: null,
  rating: null,
  blurb: null,
  date_added: null,
  date_started: null,
  date_read: null,
  shelves: [],
  ...overrides,
});

describe('bookshelfReadingState', () => {
  it('detects books explicitly marked as currently reading', () => {
    const readingBook = createBook(1, {
      shelves: [{ id: 101, name: 'Currently Reading' }],
    });

    expect(isCurrentlyReadingBook(readingBook)).toBe(true);
  });

  it('falls back to unread books only when no currently reading shelf is present', () => {
    const unreadBook = createBook(1);
    const finishedBook = createBook(2, { date_read: '2024-01-01' });

    expect(getCurrentReadingBooks([unreadBook, finishedBook], { fallbackToUnread: true })).toEqual([
      unreadBook,
    ]);

    const explicitCurrentBook = createBook(3, {
      shelves: [{ id: 201, name: 'currently-reading' }],
      date_read: null,
    });

    expect(
      getCurrentReadingBooks([unreadBook, explicitCurrentBook], { fallbackToUnread: true }),
    ).toEqual([explicitCurrentBook]);
  });

  it('splits current books out from shelved books while preserving order', () => {
    const currentA = createBook(1, {
      title: 'Current A',
      shelves: [{ id: 1, name: 'Currently Reading' }],
    });
    const shelved = createBook(2, { title: 'Shelved' });
    const currentB = createBook(3, {
      title: 'Current B',
      shelves: [{ id: 2, name: 'currently-reading' }],
    });

    expect(splitBooksByReadingState([currentA, shelved, currentB])).toEqual({
      currentBooks: [currentA, currentB],
      shelvedBooks: [shelved],
    });
  });

  it('prioritizes currently reading books ahead of finished books in timeline sorting', () => {
    const currentBook = createBook(1, {
      title: 'Reading',
      date_added: '2024-02-10',
      shelves: [{ id: 1, name: 'currently reading' }],
    });
    const finishedBook = createBook(2, {
      title: 'Finished',
      date_added: '2024-04-10',
      date_read: '2024-04-11',
    });

    expect(compareReadingTimeline(currentBook, finishedBook)).toBeLessThan(0);
    expect(compareReadingTimeline(finishedBook, currentBook)).toBeGreaterThan(0);
  });
});
