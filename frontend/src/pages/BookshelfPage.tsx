import React, { useMemo, useState } from 'react';
import { Loading, ErrorDisplay } from '../components/ui';
import { Bookshelf, BookWithShelves, SortOption } from 'types/index';
import BookshelfControls from '../components/bookshelf/BookshelfControls';
import BookshelfGrid from '../components/bookshelf/BookshelfGrid';
import BookshelfQuoteDock from '../components/bookshelf/BookshelfQuoteDock';
import BookshelfReadingStack from '../components/bookshelf/BookshelfReadingStack';
import useMultiSelect from '../hooks/useMultiSelect';
import { BooksProvider, useBooks } from '../context/BooksContext';
import {
  compareReadingTimeline,
  splitBooksByReadingState,
} from '../components/bookshelf/bookshelfReadingState';

const sortOptions: SortOption[] = [
  { label: 'Recently Read', value: 'date_read' },
  { label: 'Title', value: 'title' },
  { label: 'Author', value: 'author' },
  { label: 'Published Date', value: 'date_pub' },
  { label: 'Rating', value: 'rating' },
];

const SHELF_BOOK_SIZE = { width: 120, height: 180 };
const READING_STACK_BOOK_SIZE = { width: 114, height: 171 };

const BookshelfPageContent: React.FC = () => {
  const { books: allBooks, loading: booksLoading, error: booksError } = useBooks();

  const {
    selectedItems: selectedShelves,
    toggleSelection: toggleShelfSelection,
    clearSelection,
  } = useMultiSelect<number>([]);

  const [sortBy, setSortBy] = useState<string>('date_read');
  const [searchQuery, setSearchQuery] = useState('');

  const bookshelves = useMemo<Bookshelf[]>(() => {
    const shelvesById = new Map<number, Bookshelf>();

    allBooks.forEach((book) => {
      book.shelves?.forEach((shelf) => {
        if (!shelvesById.has(shelf.id)) {
          shelvesById.set(shelf.id, shelf);
        }
      });
    });

    return Array.from(shelvesById.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allBooks]);

  const filteredAndSortedBooks = useMemo(() => {
    let result = [...(allBooks || [])];

    // Filter by shelves
    if (selectedShelves.length > 0) {
      result = result.filter(
        (b: BookWithShelves) =>
          b.shelves && b.shelves.some((shelf) => selectedShelves.includes(shelf.id)),
      );
    }

    // Filter by search query (case-insensitive)
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (b: BookWithShelves) =>
          b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query),
      );
    }

    // Sort local
    result.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'date_pub':
          return new Date(b.date_pub || 0).getTime() - new Date(a.date_pub || 0).getTime();
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'date_read':
        default:
          return compareReadingTimeline(a, b);
      }
    });

    return result;
  }, [allBooks, selectedShelves, sortBy, searchQuery]);

  const { currentBooks, shelvedBooks } = useMemo(
    () => splitBooksByReadingState(filteredAndSortedBooks),
    [filteredAndSortedBooks],
  );

  if (booksLoading) {
    return <Loading className="h-64" />;
  }
  if (booksError) {
    return <ErrorDisplay error={booksError} />;
  }

  return (
    <div
      className="space-y-4"
      style={{
        paddingBottom:
          'calc(var(--bookshelf-quote-dock-height, 7.5rem) + 1.5rem + env(safe-area-inset-bottom))',
      }}
    >
      <BookshelfControls
        sortOptions={sortOptions}
        selectedSortBy={sortBy}
        onSortChange={setSortBy}
        allBookshelves={bookshelves}
        selectedShelfIds={selectedShelves}
        onToggleShelf={toggleShelfSelection}
        onClearShelves={clearSelection}
        bookCount={filteredAndSortedBooks.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <BookshelfReadingStack books={currentBooks} bookSize={READING_STACK_BOOK_SIZE} />
      {shelvedBooks.length > 0 ? (
        <BookshelfGrid books={shelvedBooks} bookSize={SHELF_BOOK_SIZE} />
      ) : filteredAndSortedBooks.length === 0 ? (
        <div className="site-card-soft rounded-[24px] px-5 py-8 text-center">
          <p className="mb-0 text-[0.98rem] text-textSecondary">
            No books found with the current filters.
          </p>
        </div>
      ) : (
        <BookshelfGrid books={[]} bookSize={SHELF_BOOK_SIZE} showDecorativeFrameWhenEmpty />
      )}
      <BookshelfQuoteDock />
    </div>
  );
};

const BookshelfPage: React.FC = () => (
  <BooksProvider>
    <BookshelfPageContent />
  </BooksProvider>
);

export default BookshelfPage;
