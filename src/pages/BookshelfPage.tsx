import React, { useState, useEffect, useMemo } from 'react';
import apiService from '../api/apiService';
import { Loading, ErrorDisplay, FilterButton, EmptyState } from '../components/ui';
import useMultiSelect from '../hooks/useMultiSelect';
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
  const [booksPerRow, setBooksPerRow] = useState(6);

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

  // Function to render star ratings
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  // Handle books per row change
  const handleBooksPerRowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= 12) {
      setBooksPerRow(value);
    }
  };

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
        {/* Bookshelves in compact layout */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bookshelves</label>
          <div className="flex flex-wrap gap-1 mb-4">
            <FilterButton
              label="All Books"
              active={selectedShelves.length === 0}
              onClick={() => clearSelection()}
              className="text-xs px-2 py-0.5 m-0.5 font-semibold"
            />
            {bookshelves.map((shelf) => (
              <FilterButton
                key={shelf.id}
                label={shelf.name}
                active={selectedShelves.includes(shelf.id)}
                onClick={() => toggleShelfSelection(shelf.id)}
                className="text-xs px-2 py-0.5 m-0.5"
              />
            ))}
          </div>
        </div>

        {/* Filtering and Sorting Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-48">
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Display Controls */}
        <div className="flex items-center gap-4">
          <div>
            <label htmlFor="booksPerRow" className="block text-sm font-medium text-gray-700 mb-1">
              Books Per Row: {booksPerRow}
            </label>
            <input
              id="booksPerRow"
              type="range"
              min="1"
              max="12"
              value={booksPerRow}
              onChange={handleBooksPerRowChange}
              className="w-48"
            />
          </div>

          <div className="text-sm text-gray-500">Showing {sortedBooks.length} books</div>
        </div>
      </div>

      {/* Books Grid */}
      {sortedBooks.length === 0 ? (
        <EmptyState message="No books found with the current filters" />
      ) : (
        <div
          className="overflow-x-auto"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e0 #f8fafc',
          }}
        >
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: `repeat(${booksPerRow}, minmax(120px, 1fr))`,
              minWidth: `${booksPerRow * 140}px`,
            }}
          >
            {sortedBooks.map((book) => (
              <div key={book.id} className="group">
                <div className="relative overflow-hidden rounded-lg shadow-md transition transform hover:-translate-y-1 hover:shadow-xl">
                  <a href={book.book_link || '#'} target="_blank" rel="noopener noreferrer">
                    <img
                      src={book.img_url || 'https://via.placeholder.com/150x225?text=No+Cover'}
                      alt={`Cover of ${book.title}`}
                      className="w-full h-auto object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/150x225?text=No+Cover';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
                      <h3 className="font-bold text-sm line-clamp-2 mb-1">{book.title}</h3>
                      <p className="text-xs text-gray-300 mb-1">{book.author}</p>
                      <div className="flex text-xs">{renderStars(book.rating || 0)}</div>
                      {book.date_read && (
                        <p className="text-xs text-gray-300 mt-1">
                          Read: {new Date(book.date_read).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookshelfPage;
