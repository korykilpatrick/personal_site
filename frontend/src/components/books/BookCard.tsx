import React from 'react';
import { BookWithShelves, BookshelfSummary } from 'types/index'; // Correct path, changed Book to BookWithShelves
import { Tooltip } from '../ui'; // Assuming Tooltip is exported from ui/index.ts
import Card from '../common/Card';
import Rating from '../common/Rating';
import Icon from '../common/Icon';

interface BookCardProps {
  book: BookWithShelves; // Changed Book to BookWithShelves
  bookSize: { width: number; height: number };
}

/**
 * Renders star ratings based on a numeric value (0-5).
 *
 * @param {number} rating - The rating number.
 * @returns {React.ReactNode} - JSX elements representing the stars.
 */
const renderStars = (rating: number): React.ReactNode => {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
      ★
    </span>
  ));
};

/**
 * BookCard Component
 *
 * Displays a single book with its cover, basic info, and a detailed tooltip on hover.
 * Includes a subtle lift animation on hover.
 *
 * @param {Book} book - The book data object.
 * @param {{ width: number; height: number }} bookSize - The calculated size for the book card.
 */
const BookCard: React.FC<BookCardProps> = ({ book, bookSize }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = 'https://via.placeholder.com/150x225?text=No+Cover'; // Fallback image
  };

  // Content for the tooltip
  const tooltipContent = (
    <div className="flex flex-col gap-0.5 text-left">
      <h3 className="font-bold text-xs leading-tight">{book.title}</h3>
      <p className="text-xs text-gray-300 leading-tight">by {book.author}</p>
      {book.rating !== null && book.rating !== undefined && (
         <div className="flex text-xs items-center">
          <span className="mr-0.5 text-xs">Rating:</span> {renderStars(book.rating)}
         </div>
      )}
      {book.shelves && book.shelves.length > 0 && (
        <div className="text-xs">
          <span className="mr-0.5 text-gray-300">Shelves:</span>
          {book.shelves.map((shelf: BookshelfSummary, index: number) => (
            <span key={shelf.id} className="text-gray-300">
              {shelf.name}{index < book.shelves.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
      )}
      <div className="flex text-xs text-gray-300 gap-2">
        {book.date_read && (
          <span className="leading-tight">
            Read: {new Date(book.date_read).toLocaleDateString()}
          </span>
        )}
        {book.date_pub && (
          <span className="leading-tight">
            Pub: {new Date(book.date_pub).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex justify-center last:border-r-0">
      <div
        className="relative overflow-hidden rounded-lg shadow-md 
                   transition-all duration-200 ease-out 
                   transform hover:-translate-y-1 hover:scale-105 hover:translate-z-10 hover:shadow-xl"
        style={{
          width: `${bookSize.width}px`,
          height: `${bookSize.height}px`,
          transformStyle: 'preserve-3d',
        }}
      >
        <Tooltip content={tooltipContent} side="right" sideOffset={15} delayDuration={200}>
          <a
            href={book.book_link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-full rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label={`View details for ${book.title}`}
          >
            <img
              src={book.img_url || 'https://via.placeholder.com/150x225?text=No+Cover'}
              alt={`Cover of ${book.title}`}
              className="w-full h-full object-cover rounded-lg"
              onError={handleImageError}
              loading="lazy"
            />
          </a>
        </Tooltip>
      </div>
    </div>
  );
};

// Custom comparison function that checks all props affecting rendering
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