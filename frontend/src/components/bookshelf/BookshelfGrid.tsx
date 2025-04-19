import React from 'react';
import { Book } from 'types/index'; // Correct path
import { BookCard } from '../books';
import { EmptyState } from '../ui';

interface BookshelfGridProps {
  books: Book[];
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
        scrollbarColor: '#a8a29e #f5f5f4', // stone-400 stone-100
      }}
    >
      {/* The "Shelf" container */}
      <div
        className="grid gap-2 p-4 rounded-t-2xl rounded-b-lg shadow-md 
                   border-t-4 border-x-4 border-b-8 border-stone-800"
        style={(() => {
          const rowHeight = bookSize.height + 8; // bookSize.height + gap-2 (8px)
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
            backgroundPosition: `0 0, 0 0, 0 0, 0 0, 0 ${24 + bookSize.height}px`,
            boxShadow:
              'inset 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          };
        })()}
      >
        {books.map((book) => (
          <BookCard key={book.id} book={book} bookSize={bookSize} />
        ))}
      </div>
    </div>
  );
};

export default BookshelfGrid; 