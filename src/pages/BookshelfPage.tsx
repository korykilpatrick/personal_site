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
    return <Loading className="h-64" />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <>
      {/* Personal Note Section */}
      <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-100 rounded-lg shadow-sm">
        <p className="text-lg text-stone-700 italic">
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
            <span className="text-sm font-medium text-stone-700 mr-2">Sort By</span>
            <SortDropdown
              options={sortOptions}
              selected={sortBy}
              onChange={setSortBy}
              className="w-40"
            />
          </div>

          <div className="flex items-center">
            <span className="text-sm font-medium text-stone-700 mr-2">Bookshelves</span>
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
                className="text-xs underline text-stone-500 hover:text-stone-700 self-center ml-2"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Display Controls */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-stone-500">Showing {sortedBooks.length} books</div>
        </div>
      </div>

      {/* Books Grid - Styling the container */}
      {sortedBooks.length === 0 ? (
        <EmptyState message="No books found with the current filters" />
      ) : (
        // Outer container for scroll
        <div
          className="overflow-x-auto pb-4"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#a8a29e #f5f5f4', // stone-400 stone-100
          }}
        >
          {/* The "Shelf" container - Revised shelf gradient positioning */}
          <div
            className="grid gap-4 p-6 rounded-t-2xl rounded-b-lg shadow-md 
                       border-t-4 border-x-4 border-b-8 border-stone-800" 
            style={(() => {
              const rowHeight = bookSize.height + 16; // bookSize.height + gap-4 (16px)
              const shelfThickness = 8; 
              const shelfColor = '#44210a'; 
              const existingBgImage = `
                linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px),
                linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.15) 100%),
                linear-gradient(135deg, #572f11 0%, #44210a 100%)
              `;
              const existingBgSize = '12px 12px, 12px 12px, 100% 100%, 100% 100%';

              return {
                gridTemplateColumns: `repeat(auto-fill, minmax(${bookSize.width}px, 1fr))`,
                perspective: '1000px',
                // Revised repeating gradient: draws shelf at the top of the block
                backgroundImage: `
                  ${existingBgImage},
                  repeating-linear-gradient(
                    to bottom,
                    ${shelfColor} 0,
                    ${shelfColor} ${shelfThickness}px,
                    transparent ${shelfThickness}px,
                    transparent ${rowHeight}px 
                  )
                `,
                backgroundSize: `${existingBgSize}, 100% ${rowHeight}px`,
                // Revised position: Align top of gradient block with the top of the gap below books
                backgroundPosition: `0 0, 0 0, 0 0, 0 0, 0 ${24 + bookSize.height}px`, 
                boxShadow: 'inset 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
              };
            })()}
          >
            {sortedBooks.map((book) => (
              <BookCard key={book.id} book={book} bookSize={bookSize} />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default BookshelfPage;
