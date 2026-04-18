import React from 'react';
import { BookWithShelves } from 'types/index';
import { BookCard } from '../books';
import { EmptyState } from '../ui';

interface BookshelfGridProps {
  books: BookWithShelves[];
  bookSize: { width: number; height: number };
  currentBooks?: BookWithShelves[];
  controls?: React.ReactNode;
}

// Chromeless shelves — the page IS the reading room. No frame, no case.
// Walnut planks float on the page's pale sky background; books sit on them.
const WALNUT = '#4a3423';
const WALNUT_EDGE = '#2a1d10';
const SHELF_PLANK_HEIGHT = 14;
const SHELF_GAP_BELOW = 14; // space between a plank and the next row of books above it

const CURRENT_BOOK_TRANSFORMS = [
  { restX: -4, restY: 4, restRotate: -8, hoverX: -12, hoverY: 11, hoverRotate: -14 },
  { restX: 2, restY: -2, restRotate: 5, hoverX: 6, hoverY: -8, hoverRotate: 8 },
  { restX: -2, restY: 3, restRotate: -4, hoverX: -8, hoverY: 7, hoverRotate: -7 },
  { restX: 3, restY: -1, restRotate: 7, hoverX: 10, hoverY: -6, hoverRotate: 11 },
  { restX: -3, restY: 2, restRotate: -6, hoverX: -9, hoverY: 6, hoverRotate: -9 },
  { restX: 2, restY: -2, restRotate: 4, hoverX: 8, hoverY: -5, hoverRotate: 6 },
];

// Per-row: book sits on top of a walnut plank directly below it.
// Below the plank is a hairline shadow, then breathing room before the next row.
const getShelvesStyle = (bookSize: { width: number; height: number }) => {
  const rowHeight = bookSize.height + SHELF_PLANK_HEIGHT + SHELF_GAP_BELOW;
  const plankTop = bookSize.height;
  const plankEdgeEnd = plankTop + 1;
  const plankBottom = plankTop + SHELF_PLANK_HEIGHT - 2;
  const shadowEnd = plankTop + SHELF_PLANK_HEIGHT;
  return {
    backgroundImage: `
      repeating-linear-gradient(
        to bottom,
        transparent 0,
        transparent ${plankTop}px,
        ${WALNUT_EDGE} ${plankTop}px,
        ${WALNUT_EDGE} ${plankEdgeEnd}px,
        ${WALNUT} ${plankEdgeEnd}px,
        ${WALNUT} ${plankBottom}px,
        rgba(0, 0, 0, 0.28) ${plankBottom}px,
        rgba(0, 0, 0, 0.28) ${shadowEnd}px,
        transparent ${shadowEnd}px,
        transparent ${rowHeight}px
      )
    `,
    backgroundSize: `100% ${rowHeight}px`,
    backgroundPosition: '0 0',
  };
};

const BookshelfGrid: React.FC<BookshelfGridProps> = ({
  books,
  bookSize,
  currentBooks = [],
  controls,
}) => {
  const isEmpty = books.length === 0;

  const currentBookPlacements = new Map(
    currentBooks
      .slice(0, CURRENT_BOOK_TRANSFORMS.length)
      .map((book, index) => [book.id, { ...CURRENT_BOOK_TRANSFORMS[index], order: index }]),
  );

  return (
    <div className="relative">
      {/* Filter line — sits on the page as typographic navigation, no chrome.
          Active-filter chips live inline on this same row (see BookshelfControls). */}
      {controls ? <div className="mb-5 px-1 sm:px-2">{controls}</div> : null}

      {isEmpty ? (
        <EmptyState message="No books found with the current filters" />
      ) : (
      <>
      {/* Shelves — a series of walnut planks with books resting on top.
          Overflow is visible so hover/rest transforms, drop shadows, and the
          splayed current-reading rotations don't get clipped at the edges. */}
      <div
        className="relative"
        style={{
          ...getShelvesStyle(bookSize),
        }}
      >
        <div
          className="relative grid"
          style={{
            // Horizontal inset so first/last column books have room for
            // negative translateX + rotation + drop-shadow without clipping
            // against the container edge.
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 0,
            gridTemplateColumns: `repeat(auto-fill, minmax(${bookSize.width}px, 1fr))`,
            gap: `${SHELF_PLANK_HEIGHT + SHELF_GAP_BELOW}px 12px`,
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
                        // Currently-reading books get a warm walnut shadow plus a
                        // faint oxblood glow — the book is being read, an ember
                        // under the spine. The glow is small so it doesn't shout.
                        filter:
                          'drop-shadow(0 4px 3px rgba(74, 52, 35, 0.22)) drop-shadow(0 1px 0 rgba(74, 52, 35, 0.32)) drop-shadow(0 0 6px rgba(158, 58, 42, 0.18))',
                      } as React.CSSProperties)
                    : ({
                        // Rested books get a plain warm walnut shadow — wood on paper.
                        filter:
                          'drop-shadow(0 4px 3px rgba(74, 52, 35, 0.22)) drop-shadow(0 1px 0 rgba(74, 52, 35, 0.32))',
                      } as React.CSSProperties)
                }
              >
                <BookCard book={book} bookSize={bookSize} />
              </div>
            );
          })}
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default BookshelfGrid;
