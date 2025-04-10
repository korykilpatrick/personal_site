import React, { useState, useEffect, useMemo } from 'react';
import apiService from '../api/apiService';
import {
  Loading,
  ErrorDisplay,
  FilterButton,
  EmptyState,
  MultiSelectDropdown,
  FilterPill,
  SortDropdown,
} from '../components/ui';
import { BookCard } from '../components/books';
import useMultiSelect from '../hooks/useMultiSelect';
import useDynamicBookSize from '../hooks/useDynamicBookSize';
import { Book, Bookshelf } from '../../types';
import PersonalNote from '../components/bookshelf/PersonalNote';
import BookshelfControls from '../components/bookshelf/BookshelfControls';
import BookshelfGrid from '../components/bookshelf/BookshelfGrid';

// Sort options for the books
type SortOption = {
  label: string;
  value: string;
};

const sortOptions: SortOption[] = [
  { label: 'Recently Read', value: 'date_read' },
  { label: 'Title', value: 'title' },
  { label: 'Author', value: 'author' },
  { label: 'Published Date', value: 'date_pub' },
  { label: 'Rating', value: 'rating' },
];

const BookshelfPage: React.FC = () => {
  // State for the bookshelf data
  const [bookshelves, setBookshelves] = useState<Bookshelf[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // UI state
  const {
    selectedItems: selectedShelves,
    toggleSelection: toggleShelfSelection,
    clearSelection,
  } = useMultiSelect<number>([]);
  const [sortBy, setSortBy] = useState<string>('date_read');

  // Calculate dynamic book size using the simplified custom hook
  const bookSize = useDynamicBookSize({
    minWidth: 100, // Adjusted minimum width for better default appearance
  });

  // Fetch bookshelves on mount
  useEffect(() => {
    const fetchBookshelves = async () => {
      try {
        const bookshelvesData = await apiService.getBookshelves();
        setBookshelves(bookshelvesData);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
      }
    };

    fetchBookshelves();
  }, []);

  // Fetch books when selected shelves or sort option changes
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        let booksData: Book[];

        if (selectedShelves.length > 0) {
          // Fetch books from selected shelves
          booksData = await apiService.getBooksByShelves(selectedShelves);
        } else {
          // Fetch all books (the API will handle sorting server-side if possible)
          booksData = await apiService.getSortedBooks(sortBy);
        }

        setBooks(booksData);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [selectedShelves, sortBy]);

  // Sort books client-side (in case the server doesn't support sorting or for multi-shelf selections)
  const sortedBooks = useMemo(() => {
    return [...books].sort((a, b) => {
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
  }, [books, sortBy]);

  // Note: We're now using the toggleShelfSelection from useMultiSelect

  if (loading) {
    return <Loading className="h-64" />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <>
      {/* Personal Note Section */}
      <PersonalNote />

      {/* Controls Section */}
      <BookshelfControls
        sortOptions={sortOptions}
        selectedSortBy={sortBy}
        onSortChange={setSortBy}
        allBookshelves={bookshelves}
        selectedShelfIds={selectedShelves}
        onToggleShelf={toggleShelfSelection}
        onClearShelves={clearSelection}
        bookCount={sortedBooks.length}
      />

      {/* Books Grid */}
      <BookshelfGrid books={sortedBooks} bookSize={bookSize} />
    </>
  );
};

export default BookshelfPage;
