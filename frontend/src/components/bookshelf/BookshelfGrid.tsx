import React from 'react';
import { BookWithShelves } from 'types/index'; // Changed Book to BookWithShelves
import { BookCard } from '../books';
import { EmptyState } from '../ui';

interface BookshelfGridProps {
  books: BookWithShelves[];
  bookSize: { width: number; height: number };
  currentBooks?: BookWithShelves[];
  controls?: React.ReactNode;
}

const getBookshelfFrameStyle = (bookSize: { width: number; height: number }) => {
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
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -14px 30px rgba(7,15,28,0.28)',
  };
};

const CURRENT_BOOK_TRANSFORMS = [
  {
    restX: -4,
    restY: 4,
    restRotate: -8,
    hoverX: -12,
    hoverY: 11,
    hoverRotate: -14,
  },
  {
    restX: 2,
    restY: -2,
    restRotate: 5,
    hoverX: 6,
    hoverY: -8,
    hoverRotate: 8,
  },
  {
    restX: -2,
    restY: 3,
    restRotate: -4,
    hoverX: -8,
    hoverY: 7,
    hoverRotate: -7,
  },
  {
    restX: 3,
    restY: -1,
    restRotate: 7,
    hoverX: 10,
    hoverY: -6,
    hoverRotate: 11,
  },
  {
    restX: -3,
    restY: 2,
    restRotate: -6,
    hoverX: -9,
    hoverY: 6,
    hoverRotate: -9,
  },
  {
    restX: 2,
    restY: -2,
    restRotate: 4,
    hoverX: 8,
    hoverY: -5,
    hoverRotate: 6,
  },
];

const BookshelfGrid: React.FC<BookshelfGridProps> = ({ books, bookSize, currentBooks = [], controls }) => {
  if (books.length === 0) {
    return <EmptyState message="No books found with the current filters" />;
  }

  const currentBookPlacements = new Map(
    currentBooks
      .slice(0, CURRENT_BOOK_TRANSFORMS.length)
      .map((book, index) => [book.id, { ...CURRENT_BOOK_TRANSFORMS[index], order: index }]),
  );

  return (
    <div className="relative">
      {controls}
      <div
        className="overflow-x-auto pb-4"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#6f8196 #edf2f7',
        }}
      >
        <div
          className="site-frame relative overflow-hidden rounded-[34px] pt-6 p-4 sm:pt-7 sm:p-5"
          style={getBookshelfFrameStyle(bookSize)}
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
          {books.map((book) => {
            const placement = currentBookPlacements.get(book.id);

            return (
              <div
                key={book.id}
                className={
                  placement
                    ? 'relative transition-transform duration-[820ms] ease-[cubic-bezier(0.19,1,0.22,1)] [transform:translate3d(var(--current-rest-x),var(--current-rest-y),0)_rotate(var(--current-rest-r))] hover:[transform:translate3d(var(--current-hover-x),var(--current-hover-y),0)_rotate(var(--current-hover-r))] focus-within:[transform:translate3d(var(--current-hover-x),var(--current-hover-y),0)_rotate(var(--current-hover-r))]'
                    : 'relative'
                }
                style={
                  placement
                    ? ({
                        '--current-rest-x': `${placement.restX}px`,
                        '--current-rest-y': `${placement.restY}px`,
                        '--current-rest-r': `${placement.restRotate}deg`,
                        '--current-hover-x': `${placement.hoverX}px`,
                        '--current-hover-y': `${placement.hoverY}px`,
                        '--current-hover-r': `${placement.hoverRotate}deg`,
                        zIndex: currentBooks.length - placement.order + 20,
                      } as React.CSSProperties)
                    : undefined
                }
              >
                <BookCard book={book} bookSize={bookSize} />
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
};

export default BookshelfGrid;
