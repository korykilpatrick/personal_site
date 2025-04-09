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
    return (
      <div className="max-w-6xl mx-auto py-8">
        <Loading className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <ErrorDisplay error={error} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Personal Note Section */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm">
        <p className="text-lg text-gray-700 italic">
          I've always found solace in books. This collection represents my journey through different
          worlds, ideas, and perspectives. Each book has left its mark on me in some way. I hope you
          find something here that piques your interest too!
        </p>
      </div>

      {/* Controls Section */}
      <div className="mb-8 space-y-4">
        {/* Filtering and Sorting Controls - horizontal layout */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-2">Sort By</span>
            <SortDropdown
              options={sortOptions}
              selected={sortBy}
              onChange={setSortBy}
              className="w-40"
            />
          </div>

          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-2">Bookshelves</span>
            <MultiSelectDropdown
              label="Select Shelves"
              items={bookshelves.map((shelf) => ({ id: shelf.id, label: shelf.name }))}
              selectedItems={selectedShelves}
              toggleItem={toggleShelfSelection}
              className="w-40"
            />
          </div>
        </div>

        {/* Selected bookshelves pills */}
        {selectedShelves.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {bookshelves
              .filter((shelf) => selectedShelves.includes(shelf.id))
              .map((shelf) => (
                <FilterPill
                  key={shelf.id}
                  label={shelf.name}
                  onRemove={() => toggleShelfSelection(shelf.id)}
                />
              ))}

            {selectedShelves.length > 1 && (
              <button
                onClick={clearSelection}
                className="text-xs underline text-gray-500 hover:text-gray-700 self-center ml-2"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Display Controls */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">Showing {sortedBooks.length} books</div>
        </div>
      </div>

      {/* Books Grid */}
      {sortedBooks.length === 0 ? (
        <EmptyState message="No books found with the current filters" />
      ) : (
        <div
          className="overflow-x-auto" // Keep horizontal scroll for when minWidth forces overflow
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e0 #f8fafc',
          }}
        >
          <div
            className="grid gap-6"
            style={{
              // Grid will auto-fill based on min book width
              gridTemplateColumns: `repeat(auto-fill, minmax(${bookSize.width}px, 1fr))`,
            }}
          >
            {sortedBooks.map((book) => (
              <BookCard key={book.id} book={book} bookSize={bookSize} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookshelfPage;
