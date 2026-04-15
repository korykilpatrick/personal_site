import React from 'react';
import { BookWithShelves } from 'types/index';
import { BookCard } from '../books';

interface BookshelfReadingStackProps {
  books: BookWithShelves[];
  bookSize: { width: number; height: number };
}

const STACK_OFFSETS = [
  { x: 0, y: 18, rotate: -14, hoverX: -12, hoverY: 10, hoverRotate: -18 },
  { x: 84, y: 0, rotate: 7, hoverX: 78, hoverY: -8, hoverRotate: 3 },
  { x: 170, y: 14, rotate: -6, hoverX: 178, hoverY: 6, hoverRotate: -2 },
  { x: 254, y: -2, rotate: 11, hoverX: 270, hoverY: 8, hoverRotate: 15 },
  { x: 338, y: 12, rotate: -7, hoverX: 352, hoverY: 4, hoverRotate: -10 },
  { x: 422, y: 2, rotate: 5, hoverX: 430, hoverY: -6, hoverRotate: 2 },
];

const getStackOffset = (index: number) => STACK_OFFSETS[index % STACK_OFFSETS.length];

const BookshelfReadingStack: React.FC<BookshelfReadingStackProps> = ({ books, bookSize }) => {
  if (books.length === 0) {
    return null;
  }

  const placements = books.map((_, index) => {
    const pattern = getStackOffset(index);
    const cycle = Math.floor(index / STACK_OFFSETS.length);
    const cycleOffset = cycle * 88 * STACK_OFFSETS.length;

    return {
      x: pattern.x + cycleOffset,
      y: pattern.y,
      rotate: pattern.rotate,
      hoverX: pattern.hoverX + cycleOffset,
      hoverY: pattern.hoverY,
      hoverRotate: pattern.hoverRotate,
    };
  });

  const sceneWidth =
    placements.reduce((max, placement) => Math.max(max, placement.x, placement.hoverX), 0) +
    bookSize.width +
    24;

  const minY = placements.reduce(
    (min, placement) => Math.min(min, placement.y, placement.hoverY),
    0,
  );
  const topInset = Math.max(0, -minY) + 8;
  const sceneHeight =
    placements.reduce(
      (max, placement) => Math.max(max, placement.y + topInset, placement.hoverY + topInset),
      0,
    ) +
    bookSize.height +
    10;

  return (
    <section
      className="group/reading relative z-20 overflow-x-auto overflow-y-visible px-2 pt-3 pb-2 sm:px-4 sm:pt-4"
      style={{
        height: `${sceneHeight}px`,
        scrollbarWidth: 'thin',
        scrollbarColor: '#6f8196 transparent',
      }}
      aria-label="Currently reading books"
    >
      <div className="relative min-w-max overflow-visible">
        <div
          className="relative mx-auto overflow-visible"
          style={{ width: `${sceneWidth}px`, height: `${bookSize.height}px` }}
        >
          {books.map((book, index) => {
            const placement = placements[index];

            return (
              <div
                key={book.id}
                className="absolute left-0 top-0 origin-bottom transition-[transform,filter] duration-[900ms] ease-[cubic-bezier(0.19,1,0.22,1)] will-change-transform [transform:translate3d(var(--book-x),var(--book-y),0)_rotate(var(--book-r))] group-hover/reading:[transform:translate3d(var(--book-hover-x),var(--book-hover-y),0)_rotate(var(--book-hover-r))] group-focus-within/reading:[transform:translate3d(var(--book-hover-x),var(--book-hover-y),0)_rotate(var(--book-hover-r))]"
                style={
                  {
                    '--book-x': `${placement.x}px`,
                    '--book-y': `${placement.y + topInset}px`,
                    '--book-r': `${placement.rotate}deg`,
                    '--book-hover-x': `${placement.hoverX}px`,
                    '--book-hover-y': `${placement.hoverY + topInset}px`,
                    '--book-hover-r': `${placement.hoverRotate}deg`,
                    zIndex: books.length - index,
                  } as React.CSSProperties
                }
              >
                <BookCard book={book} bookSize={bookSize} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BookshelfReadingStack;
