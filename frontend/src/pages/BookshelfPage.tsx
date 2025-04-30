import React, { useMemo, useEffect, useState } from 'react';
import { Loading, ErrorDisplay } from '../components/ui';
import { Bookshelf, BookWithShelves, SortOption } from 'types/index';
import PersonalNote from '../components/bookshelf/PersonalNote';
import BookshelfControls from '../components/bookshelf/BookshelfControls';
import BookshelfGrid from '../components/bookshelf/BookshelfGrid';
import useMultiSelect from '../hooks/useMultiSelect';
import apiService from '../api/apiService';
import { useBooks } from '../context/BooksContext';

/**
 * Sort options for the books
 */
const sortOptions: SortOption[] = [
  { label: 'Recently Read', value: 'date_read' },
  { label: 'Title', value: 'title' },
  { label: 'Author', value: 'author' },
  { label: 'Published Date', value: 'date_pub' },
  { label: 'Rating', value: 'rating' },
];

const BookshelfPage: React.FC = () => {
  const { books: allBooks, loading: booksLoading, error: booksError } = useBooks();

  const [bookshelves, setBookshelves] = useState<Bookshelf[]>([]);
  const [shelvesLoading, setShelvesLoading] = useState(true);
  const [shelvesError, setShelvesError] = useState<Error | null>(null);

  // Use a multiSelect for selecting shelf filters
  const {
    selectedItems: selectedShelves,
    toggleSelection: toggleShelfSelection,
    clearSelection,
  } = useMultiSelect<number>([]);

  // Sorting
  const [sortBy, setSortBy] = useState<string>('date_read');

  // Fetch shelves once, but do it here or optionally prefetch in the same manner
  useEffect(() => {
    const fetchShelves = async () => {
      setShelvesLoading(true);
      setShelvesError(null);
      try {
        const fetchedShelves = await apiService.getBookshelves();
        setBookshelves(fetchedShelves);
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setShelvesError(e);
      } finally {
        setShelvesLoading(false);
      }
    };
    fetchShelves();
  }, []);

  const filteredAndSortedBooks = useMemo(() => {
    let result = [...(allBooks || [])];

    // Filter by shelves if any are selected
    if (selectedShelves.length > 0) {
      result = result.filter((b: BookWithShelves) => {
        if (!b.shelves) return false;
        return b.shelves.some((shelf) => selectedShelves.includes(shelf.id));
      });
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
          return new Date(b.date_read || 0).getTime() - new Date(a.date_read || 0).getTime();
      }
    });

    return result;
  }, [allBooks, selectedShelves, sortBy]);

  // Priority: if context loading fails, that means no books. If shelves fail, that's separate.
  if (booksLoading) {
    // Show combined loading if shelves might still be fetching
    return <Loading className="h-64" />;
  }
  if (booksError) {
    return <ErrorDisplay error={booksError} />;
  }
  if (shelvesLoading && !booksError) {
    // If we do have books but are still waiting on shelves,
    // we can show partial UI. But let's just show loading for shelves:
    return <Loading className="h-64" />;
  }
  if (shelvesError) {
    return <ErrorDisplay error={shelvesError} />;
  }

  return (
    <>
      <PersonalNote />
      <BookshelfControls
        sortOptions={sortOptions}
        selectedSortBy={sortBy}
        onSortChange={setSortBy}
        allBookshelves={bookshelves}
        selectedShelfIds={selectedShelves}
        onToggleShelf={toggleShelfSelection}
        onClearShelves={clearSelection}
        bookCount={filteredAndSortedBooks.length}
      />
      <BookshelfGrid books={filteredAndSortedBooks} bookSize={{ width: 85, height: 128 }} />
    </>
  );
};

export default BookshelfPage;