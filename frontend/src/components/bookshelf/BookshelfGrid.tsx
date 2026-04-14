import React from 'react';
import { BookWithShelves } from 'types/index'; // Changed Book to BookWithShelves
import { BookCard } from '../books';
import { EmptyState } from '../ui';

interface BookshelfGridProps {
  books: BookWithShelves[]; // Changed Book[] to BookWithShelves[]
  bookSize: { width: number; height: number };
}

const BookshelfGrid: React.FC<BookshelfGridProps> = ({ books, bookSize }) => {
  if (books.length === 0) {
    return <EmptyState message="No books found with the current filters" />;
  }

  return (
    <div
      className="overflow-x-auto pb-4"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#6f8196 #edf2f7',
      }}
    >
      <div
        className="site-frame relative overflow-hidden rounded-[34px] pt-6 p-4 sm:pt-7 sm:p-5"
        style={(() => {
          const rowHeight = bookSize.height + 12;
          const shelfColor = '#10203a';

          return {
            backgroundImage: `
              radial-gradient(circle at 50% 0%, rgba(132, 181, 255, 0.16), transparent 28%),
              linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.16)),
              repeating-linear-gradient(
                to bottom,
                rgba(255,255,255,0.06) 0,
                rgba(255,255,255,0.06) 2px,
                rgba(8,15,27,0) 2px,
                rgba(8,15,27,0) ${bookSize.height + 2}px,
                rgba(132,181,255,0.2) ${bookSize.height + 2}px,
                rgba(14,26,44,0.48) ${bookSize.height + 10}px,
                ${shelfColor} ${rowHeight}px
              ),
              linear-gradient(135deg, #223652 0%, #17283f 38%, #0f1b2c 100%)
            `,
            backgroundSize: `100% 100%, 100% 100%, 100% ${rowHeight}px, 100% 100%`,
            backgroundPosition: '0 0',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -14px 30px rgba(7,15,28,0.28)',
          };
        })()}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white/[0.07] via-white/[0.02] to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(132,181,255,0.14),transparent_34%)]"
        />

        <div
          className="relative z-10 grid gap-3"
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(${bookSize.width}px, 1fr))`,
            perspective: '1000px',
          }}
        >
          {books.map((book) => (
            <BookCard key={book.id} book={book} bookSize={bookSize} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookshelfGrid; 
