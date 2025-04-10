import React from 'react';
import { MultiSelectDropdown, FilterPill, SortDropdown } from '../ui';
import { Bookshelf } from '../../../types'; // Adjust path as needed

type SortOption = {
  label: string;
  value: string;
};

interface BookshelfControlsProps {
  sortOptions: SortOption[];
  selectedSortBy: string;
  onSortChange: (value: string) => void;
  allBookshelves: Bookshelf[];
  selectedShelfIds: number[];
  onToggleShelf: (id: number) => void;
  onClearShelves: () => void;
  bookCount: number;
}

const BookshelfControls: React.FC<BookshelfControlsProps> = ({
  sortOptions,
  selectedSortBy,
  onSortChange,
  allBookshelves,
  selectedShelfIds,
  onToggleShelf,
  onClearShelves,
  bookCount,
}) => {
  return (
    <div className="mb-8 space-y-4">
      {/* Filtering and Sorting Controls - horizontal layout */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center">
          <span className="text-sm font-medium text-stone-700 mr-2">Sort By</span>
          <SortDropdown
            options={sortOptions}
            selected={selectedSortBy}
            onChange={onSortChange}
            className="w-40"
          />
        </div>

        <div className="flex items-center">
          <span className="text-sm font-medium text-stone-700 mr-2">Bookshelves</span>
          <MultiSelectDropdown
            label="Select Shelves"
            items={allBookshelves.map((shelf) => ({ id: shelf.id, label: shelf.name }))}
            selectedItems={selectedShelfIds}
            toggleItem={onToggleShelf}
            className="w-40"
          />
        </div>
      </div>

      {/* Selected bookshelves pills */}
      {selectedShelfIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {allBookshelves
            .filter((shelf) => selectedShelfIds.includes(shelf.id))
            .map((shelf) => (
              <FilterPill
                key={shelf.id}
                label={shelf.name}
                onRemove={() => onToggleShelf(shelf.id)}
              />
            ))}

          {selectedShelfIds.length > 1 && (
            <button
              onClick={onClearShelves}
              className="text-xs underline text-stone-500 hover:text-stone-700 self-center ml-2"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Display Controls */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-stone-500">Showing {bookCount} books</div>
      </div>
    </div>
  );
};

export default BookshelfControls; 