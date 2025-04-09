import React from 'react';
import { Book } from '../../../types'; // Adjust path as needed
import { Tooltip } from '../ui'; // Assuming Tooltip is exported from ui/index.ts

interface BookCardProps {
  book: Book;
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
    <div className="flex flex-col gap-1 text-left">
      <h3 className="font-bold text-sm">{book.title}</h3>
      <p className="text-xs text-gray-300">by {book.author}</p>
      {book.rating !== null && book.rating !== undefined && (
         <div className="flex text-xs items-center">
          <span className="mr-1">Rating:</span> {renderStars(book.rating)}
         </div>
      )}
      {book.date_read && (
        <p className="text-xs text-gray-300 mt-1">
          Read: {new Date(book.date_read).toLocaleDateString()}
        </p>
      )}
      {/* Add other metadata as needed, e.g., genre, pages */}
       {book.date_pub && (
        <p className="text-xs text-gray-400 mt-1">
          Published: {new Date(book.date_pub).toLocaleDateString()}
        </p>
      )}
    </div>
  );

  return (
    <div className="group flex justify-center"> {/* Container for centering */}
      <Tooltip content={tooltipContent} side="right" sideOffset={10} delayDuration={200}>
        <div
          className="relative overflow-hidden rounded-lg shadow-md transition transform hover:-translate-y-1.5 hover:shadow-xl cursor-pointer" // Increased translate-y slightly
          style={{
            width: `${bookSize.width}px`,
            height: `${bookSize.height}px`,
          }}
        >
          <a
             href={book.book_link || '#'}
             target="_blank"
             rel="noopener noreferrer"
             className="block w-full h-full" // Make anchor fill the div
             aria-label={`View details for ${book.title}`} // Accessibility
           >
            <img
              src={book.img_url || 'https://via.placeholder.com/150x225?text=No+Cover'}
              alt={`Cover of ${book.title}`}
              className="w-full h-full object-cover"
              onError={handleImageError}
              loading="lazy" // Add lazy loading for images
            />
            {/* Optional: Keep a very subtle overlay for visual feedback, or remove if tooltip is enough */}
            {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity"></div> */}
            {/* Removed the previous text overlay as the tooltip handles info display */}
          </a>
        </div>
      </Tooltip>
    </div>
  );
};

export default BookCard; 