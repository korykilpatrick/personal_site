import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { BookWithShelves } from 'types/index';
import BookCard from '../BookCard';
import { formatBookReadDate, formatPublicationYear } from '../../../utils/dateUtils';

jest.mock('../../ui', () => ({
  Tooltip: ({ children, content }: { children: React.ReactNode; content: React.ReactNode }) => (
    <div>
      <div data-testid="tooltip-content">{content}</div>
      {children}
    </div>
  ),
}));

jest.mock('../../common/Rating', () => ({
  __esModule: true,
  default: ({ value, max }: { value: number; max: number }) => (
    <div aria-label={`${value} of ${max} stars`} data-testid="rating" data-value={value} />
  ),
}));

const BOOK_SIZE = { width: 120, height: 180 };

const makeBook = (overrides: Partial<BookWithShelves> = {}): BookWithShelves => ({
  id: 1,
  goodreads_id: 123,
  img_url: 'https://images.example/the-secret-history.jpg',
  img_url_small: 'https://images.example/the-secret-history-small.jpg',
  title: 'The Secret History',
  book_link: 'https://www.goodreads.com/book/show/123',
  author: 'Donna Tartt',
  author_link: 'https://www.goodreads.com/author/show/123',
  num_pages: 559,
  avg_rating: 4.17,
  num_ratings: 900_000,
  date_pub: '1992',
  rating: 4,
  blurb: '',
  date_added: '2025-11-24',
  date_started: null,
  date_read: '2025-11-10',
  shelves: [
    { id: 11, name: 'fiction' },
    { id: 8, name: 'co-read' },
    { id: 1, name: 'read' },
  ],
  ...overrides,
});

const getTooltip = () => screen.getByTestId('tooltip-content');

describe('book metadata formatters', () => {
  it('formats an ISO calendar date without applying the local timezone', () => {
    expect(formatBookReadDate('2025-11-10')).toEqual({
      iso: '2025-11-10',
      compact: 'NOV 10 ’25',
      long: 'November 10, 2025',
    });
  });

  it.each([null, '', 'not-a-date', '2025-02-30'])(
    'rejects an absent or invalid read date: %p',
    (value) => {
      expect(formatBookReadDate(value)).toBeNull();
    },
  );

  it('formats signed ancient publication years and omits missing years', () => {
    expect(formatPublicationYear('-800')).toBe('800 BCE');
    expect(formatPublicationYear('180')).toBe('180');
    expect(formatPublicationYear(null)).toBeNull();
  });
});

describe('BookCard tooltip metadata', () => {
  it('combines rating and read date, publishes the year in the byline, and exposes full accessible context', () => {
    render(<BookCard book={makeBook()} bookSize={BOOK_SIZE} />);

    const tooltip = getTooltip();
    const rating = within(tooltip).getByTestId('rating');
    const publicationYear = within(tooltip).getByText('1992');
    const readDate = within(tooltip).getByText('NOV 10 ’25');
    const link = screen.getByRole('link');

    expect(rating).toHaveAttribute('data-value', '4');
    expect(publicationYear).toHaveAttribute('datetime', '1992');
    expect(readDate.tagName).toBe('TIME');
    expect(readDate).toHaveAttribute('datetime', '2025-11-10');
    expect(link).toHaveAccessibleName(
      'The Secret History by Donna Tartt, published 1992, rated 4 out of 5, read November 10, 2025',
    );
    expect(within(tooltip).getByText('fiction')).toBeInTheDocument();
    expect(within(tooltip).getByText('co-read')).toBeInTheDocument();
    expect(within(tooltip).queryByText(/^read$/i)).not.toBeInTheDocument();
  });

  it('filters READ before applying the three-tag cap', () => {
    render(
      <BookCard
        book={makeBook({
          shelves: [
            { id: 1, name: 'read' },
            { id: 11, name: 'fiction' },
            { id: 8, name: 'co-read' },
            { id: 7, name: 'classics' },
          ],
        })}
        bookSize={BOOK_SIZE}
      />,
    );

    const tooltip = getTooltip();

    expect(within(tooltip).queryByText(/^read$/i)).not.toBeInTheDocument();
    expect(within(tooltip).getByText('fiction')).toBeInTheDocument();
    expect(within(tooltip).getByText('co-read')).toBeInTheDocument();
    expect(within(tooltip).getByText('classics')).toBeInTheDocument();
  });

  it.each([null, 'not-a-date', '2025-02-30'])(
    'keeps READ as the fallback when date_read is %p',
    (dateRead) => {
      render(<BookCard book={makeBook({ date_read: dateRead })} bookSize={BOOK_SIZE} />);

      const tooltip = getTooltip();

      expect(within(tooltip).getByText(/^read$/i)).toBeInTheDocument();
      expect(within(tooltip).queryByText(/NOV 10/)).not.toBeInTheDocument();
      expect(screen.getByRole('link')).not.toHaveAccessibleName(/, read /i);
    },
  );

  it('shows a read date without a separator or READ tag when the book is unrated', () => {
    render(<BookCard book={makeBook({ rating: null })} bookSize={BOOK_SIZE} />);

    const tooltip = getTooltip();
    const readDate = within(tooltip).getByText('NOV 10 ’25');

    expect(within(tooltip).queryByTestId('rating')).not.toBeInTheDocument();
    expect(readDate).toHaveAttribute('datetime', '2025-11-10');
    expect(readDate.parentElement).toHaveTextContent(/^NOV 10 ’25$/);
    expect(within(tooltip).queryByText(/^read$/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAccessibleName(
      'The Secret History by Donna Tartt, published 1992, read November 10, 2025',
    );
  });

  it('shows the rating and fallback READ tag when the book has no read date', () => {
    render(<BookCard book={makeBook({ date_read: null })} bookSize={BOOK_SIZE} />);

    const tooltip = getTooltip();

    expect(within(tooltip).getByTestId('rating')).toBeInTheDocument();
    expect(within(tooltip).queryByText(/NOV 10/)).not.toBeInTheDocument();
    expect(within(tooltip).getByText(/^read$/i)).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAccessibleName(
      'The Secret History by Donna Tartt, published 1992, rated 4 out of 5',
    );
  });

  it('keeps the fallback READ tag when both rating and read date are absent', () => {
    render(<BookCard book={makeBook({ rating: null, date_read: null })} bookSize={BOOK_SIZE} />);

    const tooltip = getTooltip();

    expect(within(tooltip).queryByTestId('rating')).not.toBeInTheDocument();
    expect(within(tooltip).queryByText(/NOV 10/)).not.toBeInTheDocument();
    expect(within(tooltip).getByText(/^read$/i)).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAccessibleName(
      'The Secret History by Donna Tartt, published 1992',
    );
  });

  it('renders BCE publication years and omits a missing publication year', () => {
    const { rerender } = render(
      <BookCard book={makeBook({ date_pub: '-800' })} bookSize={BOOK_SIZE} />,
    );

    expect(within(getTooltip()).getByText('800 BCE')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAccessibleName(/published 800 BCE/);

    rerender(<BookCard book={makeBook({ date_pub: null })} bookSize={BOOK_SIZE} />);

    expect(within(getTooltip()).queryByText('800 BCE')).not.toBeInTheDocument();
    expect(screen.getByRole('link')).not.toHaveAccessibleName(/published/i);
  });

  it('rerenders when either date field changes', () => {
    const { rerender } = render(<BookCard book={makeBook()} bookSize={BOOK_SIZE} />);

    expect(within(getTooltip()).getByText('1992')).toBeInTheDocument();
    expect(within(getTooltip()).getByText('NOV 10 ’25')).toBeInTheDocument();

    rerender(
      <BookCard
        book={makeBook({ date_pub: '2001', date_read: '2025-12-12' })}
        bookSize={BOOK_SIZE}
      />,
    );

    expect(within(getTooltip()).queryByText('1992')).not.toBeInTheDocument();
    expect(within(getTooltip()).queryByText('NOV 10 ’25')).not.toBeInTheDocument();
    expect(within(getTooltip()).getByText('2001')).toBeInTheDocument();
    expect(within(getTooltip()).getByText('DEC 12 ’25')).toBeInTheDocument();
  });
});
