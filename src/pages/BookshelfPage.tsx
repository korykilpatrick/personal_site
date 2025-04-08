import React, { useState } from 'react';
import useApi from '../hooks/useApi';
import apiService from '../api/apiService';

interface Book {
  id: number;
  title: string;
  author: string;
  img_url: string;
  img_url_small: string;
  book_link: string;
  rating: number;
}

interface Bookshelf {
  id: number;
  name: string;
}

const BookshelfPage: React.FC = () => {
  const [selectedShelf, setSelectedShelf] = useState<number | null>(null);
  
  // Fetch bookshelves
  const { 
    data: bookshelves, 
    loading: shelvesLoading, 
    error: shelvesError 
  } = useApi<Bookshelf[]>(apiService.getBookshelves);
  
  // Fetch books from selected shelf or all books
  const { 
    data: books,
    loading: booksLoading,
    error: booksError,
    fetchData: fetchBooks
  } = useApi<Book[]>(
    () => selectedShelf
      ? apiService.getBooksByShelf(selectedShelf)
      : apiService.getBooks(),
    { autoFetch: true }
  );

  // Refetch books when selected shelf changes
  React.useEffect(() => {
    fetchBooks();
  }, [selectedShelf, fetchBooks]);

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
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <h1 className="text-4xl font-bold mb-6">My Bookshelf</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">My Bookshelf</h1>
      
      {bookshelves && bookshelves.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedShelf(null)}
              className={`px-4 py-2 rounded-md transition ${!selectedShelf ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              All Books
            </button>
            {bookshelves.map((shelf) => (
              <button
                key={shelf.id}
                onClick={() => setSelectedShelf(shelf.id)}
                className={`px-4 py-2 rounded-md transition ${selectedShelf === shelf.id ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {shelf.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {!books || books.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-xl text-gray-600">No books found in this shelf</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {books.map((book) => (
            <div key={book.id} className="group">
              <div className="relative overflow-hidden rounded-lg shadow-md transition transform hover:-translate-y-1 hover:shadow-xl">
                <a href={book.book_link} target="_blank" rel="noopener noreferrer">
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
                    <div className="flex text-xs">{renderStars(book.rating)}</div>
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