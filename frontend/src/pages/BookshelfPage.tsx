import React, { useMemo, useEffect, useState } from 'react';
import { Loading, ErrorDisplay } from '../components/ui';
import { Bookshelf, BookWithShelves, SortOption } from 'types/index';
import PersonalNote from '../components/bookshelf/PersonalNote';
import BookshelfControls from '../components/bookshelf/BookshelfControls';
import BookshelfGrid from '../components/bookshelf/BookshelfGrid';
import useMultiSelect from '../hooks/useMultiSelect';
import apiService from '../api/apiService';
import { useBooks } from '../context/BooksContext';

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

  const {
    selectedItems: selectedShelves,
    toggleSelection: toggleShelfSelection,
    clearSelection,
  } = useMultiSelect<number>([]);

  const [sortBy, setSortBy] = useState<string>('date_read');
  const [searchQuery, setSearchQuery] = useState('');

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

    // Filter by shelves
    if (selectedShelves.length > 0) {
      result = result.filter((b: BookWithShelves) =>
        b.shelves && b.shelves.some((shelf) => selectedShelves.includes(shelf.id))
      );
    }

    // Filter by search query (case-insensitive)
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((b: BookWithShelves) =>
        b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query)
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
          return new Date(b.date_added || 0).getTime() - new Date(a.date_added || 0).getTime();
      }
    });

    return result;
  }, [allBooks, selectedShelves, sortBy, searchQuery]);

  if (booksLoading) {
    return <Loading className="h-64" />;
  }
  if (booksError) {
    return <ErrorDisplay error={booksError} />;
  }
  if (shelvesLoading && !booksError) {
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
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <BookshelfGrid books={filteredAndSortedBooks} bookSize={{ width: 85, height: 128 }} />
    </>
  );
};

export default BookshelfPage;