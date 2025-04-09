import React, { useState } from 'react';
import useApi from '../hooks/useApi';
import apiService from '../api/apiService';
import { Loading, ErrorDisplay, FilterButton, EmptyState } from '../components/ui';
import { Book, Bookshelf } from '../../types';

const BookshelfPage: React.FC = () => {
  const [selectedShelf, setSelectedShelf] = useState<number | null>(null);
  
  // Fetch bookshelves - this should only happen once when component mounts
  const { 
    data: bookshelves, 
    loading: shelvesLoading, 
    error: shelvesError 
  } = useApi<Bookshelf[]>(apiService.getBookshelves);
  
  // Use the improved useApi hook for books with dependency on selectedShelf
  const fetchBooksFn = selectedShelf 
    ? apiService.getBooksByShelf 
    : apiService.getBooks;
  
  const {
    data: books,
    loading: booksLoading,
    error: booksError
  } = useApi<Book[], [number?]>(
    fetchBooksFn,
    {
      dependencies: [selectedShelf],
      initialParams: selectedShelf ? [selectedShelf] : []
    }
  );
  
  // Combined loading and error states
  const loading = shelvesLoading || booksLoading;
  const error = shelvesError || booksError;

  // Function to render star ratings
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <h1 className="text-4xl font-bold mb-6">My Bookshelf</h1>
        <Loading className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <h1 className="text-4xl font-bold mb-6">My Bookshelf</h1>
        <ErrorDisplay error={error} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">My Bookshelf</h1>
      
      {bookshelves && bookshelves.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <FilterButton
              label="All Books"
              active={!selectedShelf}
              onClick={() => setSelectedShelf(null)}
            />
            {bookshelves.map((shelf) => (
              <FilterButton
                key={shelf.id}
                label={shelf.name}
                active={selectedShelf === shelf.id}
                onClick={() => setSelectedShelf(shelf.id)}
              />
            ))}
          </div>
        </div>
      )}

      {!books || books.length === 0 ? (
        <EmptyState message="No books found in this shelf" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {books.map((book) => (
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
                  </div>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookshelfPage;