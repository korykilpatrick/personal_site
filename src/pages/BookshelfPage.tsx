import React, { useState, useEffect } from 'react';
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
  const [books, setBooks] = useState<Book[]>([]);
  const [bookshelves, setBookshelves] = useState<Bookshelf[]>([]);
  const [selectedShelf, setSelectedShelf] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // For development, use mock data
        // In production, use:
        // const booksData = await apiService.getBooks();
        // const shelvesData = await apiService.getBookshelves();
        
        const shelvesData: Bookshelf[] = [
          { id: 1, name: 'Currently Reading' },
          { id: 2, name: 'Read' },
          { id: 3, name: 'Want to Read' },
          { id: 4, name: 'Favorites' },
        ];
        
        const booksData: Book[] = [
          {
            id: 1,
            title: 'The Mythical Man-Month',
            author: 'Frederick P. Brooks Jr.',
            img_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348430512i/13629.jpg',
            img_url_small: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348430512i/13629.jpg',
            book_link: 'https://www.goodreads.com/book/show/13629.The_Mythical_Man_Month',
            rating: 5,
          },
          {
            id: 2,
            title: 'Designing Data-Intensive Applications',
            author: 'Martin Kleppmann',
            img_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1603064614i/23463279.jpg',
            img_url_small: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1603064614i/23463279.jpg',
            book_link: 'https://www.goodreads.com/book/show/23463279-designing-data-intensive-applications',
            rating: 5,
          },
          {
            id: 3,
            title: 'Clean Code',
            author: 'Robert C. Martin',
            img_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1436202607i/3735293.jpg',
            img_url_small: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1436202607i/3735293.jpg',
            book_link: 'https://www.goodreads.com/book/show/3735293-clean-code',
            rating: 4,
          },
          {
            id: 4,
            title: 'Dune',
            author: 'Frank Herbert',
            img_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1555447414i/44767458.jpg',
            img_url_small: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1555447414i/44767458.jpg',
            book_link: 'https://www.goodreads.com/book/show/44767458-dune',
            rating: 5,
          },
          {
            id: 5,
            title: 'The Pragmatic Programmer',
            author: 'Andy Hunt',
            img_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1590843322i/52715562.jpg',
            img_url_small: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1590843322i/52715562.jpg',
            book_link: 'https://www.goodreads.com/book/show/52715562-the-pragmatic-programmer',
            rating: 5,
          },
          {
            id: 6,
            title: 'The Name of the Wind',
            author: 'Patrick Rothfuss',
            img_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1270352123i/186074.jpg',
            img_url_small: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1270352123i/186074.jpg',
            book_link: 'https://www.goodreads.com/book/show/186074.The_Name_of_the_Wind',
            rating: 5,
          },
        ];
        
        setBookshelves(shelvesData);
        setBooks(booksData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load bookshelf data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredBooks = selectedShelf
    ? books.filter((_, index) => index % bookshelves.length === (selectedShelf - 1))
    : books;

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
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">My Bookshelf</h1>
      
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

      {filteredBooks.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-xl text-gray-600">No books found in this shelf</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredBooks.map((book) => (
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