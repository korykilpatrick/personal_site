import React from 'react';
import { BookWithShelves, BookshelfSummary } from 'types/index';
import { Tooltip } from '../ui';
import Rating from '../common/Rating';

interface BookCardProps {
  book: BookWithShelves;
  bookSize: { width: number; height: number };
}

const FALLBACK_COVER = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="150" height="225"><rect width="150" height="225" rx="8" fill="#1a2d47"/><text x="75" y="120" text-anchor="middle" fill="#4a5a6c" font-size="13" font-family="system-ui">No Cover</text></svg>')}`;

const BookCard: React.FC<BookCardProps> = ({ book, bookSize }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = FALLBACK_COVER;
  };

  const tooltipContent = (
    <div className="flex flex-col gap-1 text-left">
      <h3 className="font-serif text-sm font-semibold leading-snug text-cream">
        {book.title}
      </h3>
      <p className="text-xs leading-tight text-cream/75">{book.author}</p>
      {book.rating !== null && book.rating !== undefined && (
        <div className="mt-0.5">
          <Rating value={book.rating} max={5} size="sm" />
        </div>
      )}
      {book.shelves && book.shelves.length > 0 && (
        <div className="mt-0.5 flex flex-wrap gap-1">
          {book.shelves.slice(0, 3).map((shelf: BookshelfSummary) => (
            <span
              key={shelf.id}
              className="rounded-md border border-cream/20 bg-cream/10 px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.06em] text-cream/85"
            >
              {shelf.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      className="group/book flex justify-center last:border-r-0 rounded-[15px] transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] shadow-[0_12px_22px_rgba(74,52,35,0.22)] hover:-translate-y-3 hover:scale-[1.06] hover:shadow-[0_24px_48px_rgba(74,52,35,0.32),0_8px_16px_rgba(74,52,35,0.18)]"
      style={{
        width: `${bookSize.width}px`,
        height: `${bookSize.height}px`,
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[15px]">
        {/* Hover glow — warm amber/oxblood, like a reading lamp passing over the spine */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-3 rounded-[22px] bg-[radial-gradient(circle_at_50%_18%,rgba(158,58,42,0.22),transparent_56%)] opacity-0 blur-xl transition duration-[900ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover/book:opacity-100"
        />
        <Tooltip content={tooltipContent} side="right" sideOffset={12} delayDuration={150}>
          <a
            href={book.book_link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="group block h-full w-full rounded-[15px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cream focus:ring-oxblood/60"
            aria-label={`${book.title} by ${book.author}${book.rating ? `, rated ${book.rating} of 5` : ''}`}
          >
            <img
              src={book.img_url || FALLBACK_COVER}
              alt={`Cover of ${book.title}`}
              className="h-full w-full rounded-[15px] object-cover transition duration-[760ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover/book:brightness-[1.06]"
              onError={handleImageError}
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 rounded-[15px] border border-white/8 shadow-[inset_0_1px_0_rgba(255,253,244,0.18)]" />
          </a>
        </Tooltip>
      </div>
    </div>
  );
};

const areEqual = (prevProps: BookCardProps, nextProps: BookCardProps) => {
  const prevBook = prevProps.book;
  const nextBook = nextProps.book;

  return (
    prevBook.id === nextBook.id &&
    prevBook.updated_at === nextBook.updated_at &&
    prevBook.title === nextBook.title &&
    prevBook.author === nextBook.author &&
    prevBook.rating === nextBook.rating &&
    prevBook.img_url === nextBook.img_url &&
    prevBook.book_link === nextBook.book_link &&
    prevBook.date_read === nextBook.date_read &&
    prevBook.date_pub === nextBook.date_pub &&
    JSON.stringify(prevBook.shelves) === JSON.stringify(nextBook.shelves) &&
    prevProps.bookSize.width === nextProps.bookSize.width &&
    prevProps.bookSize.height === nextProps.bookSize.height
  );
};

export default React.memo(BookCard, areEqual);
