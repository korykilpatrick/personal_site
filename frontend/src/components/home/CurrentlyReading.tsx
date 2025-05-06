import React, { useMemo } from 'react';
import Card from '@/components/common/Card';
import { useBooks } from '@/context/BooksContext';
import { BookWithShelves } from 'types/index';
import { BookCard } from '@/components/books';
import EmptyState from '@/components/ui/EmptyState';

/**
 * CurrentlyReading – lists in-progress books, horizontally centred.
 */
const CurrentlyReading: React.FC = () => {
  const { books, loading } = useBooks();

  const reading: BookWithShelves[] = useMemo(() => {
    const shelfMatch = (name?: string) =>
      name && ['currently reading', 'currently-reading'].includes(name.toLowerCase());

    const fromShelf = books.filter(
      b => b.shelves && b.shelves.some(s => shelfMatch((s as any).name))
    );
    return (fromShelf.length > 0 ? fromShelf : books.filter(b => !b.date_read)) as BookWithShelves[];
  }, [books]);

  if (loading) return null;

  if (reading.length === 0) {
    return (
      <Card padding="lg" className="max-w-sm mx-auto">
        <EmptyState message="No books in progress — pick something juicy!" />
      </Card>
    );
  }

  const containerClasses =
    'flex gap-4 pb-1 ' +
    (reading.length > 4 ? 'overflow-x-auto justify-start' : 'justify-center');

  return (
    <Card padding="lg">
      <h2 className="text-lg font-semibold mb-3">Currently Reading</h2>

      <div className={containerClasses}>
        {reading.map(book => (
          <BookCard key={book.id} book={book} bookSize={{ width: 120, height: 180 }} />
        ))}
      </div>
    </Card>
  );
};

export default CurrentlyReading;