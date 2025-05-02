import React from 'react';
import { MultiSelectDropdown, FilterPill, SortDropdown } from '../ui';
import { Bookshelf, SortOption } from 'types/index';
import SearchInput from '@/components/common/SearchInput';

interface BookshelfControlsProps {
  sortOptions: SortOption[];
  selectedSortBy: string;
  onSortChange: (value: string) => void;
  allBookshelves: Bookshelf[];
  selectedShelfIds: number[];
  onToggleShelf: (id: number) => void;
  onClearShelves: () => void;
  bookCount: number;
  searchQuery: string;
  onSearchChange: (val: string) => void;
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
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="mb-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center">
          <span className="text-xs font-medium text-stone-700 mr-1.5">Sort By</span>
          <SortDropdown
            options={sortOptions}
            selected={selectedSortBy}
            onChange={onSortChange}
            className="w-36"
          />
        </div>

        <div className="flex items-center">
          <span className="text-xs font-medium text-stone-700 mr-1.5">Bookshelves</span>
          <MultiSelectDropdown
            label="Select Shelves"
            items={allBookshelves.map((shelf) => ({ id: shelf.id, label: shelf.name }))}
            selectedItems={selectedShelfIds}
            toggleItem={onToggleShelf}
            className="w-36"
          />
        </div>

        <div className="flex items-center">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search books..."
            debounceMs={300}
            className="w-72"
          />
        </div>

        <div className="text-xs text-stone-500 ml-auto">Showing {bookCount} books</div>
      </div>

      <div className="min-h-8 mt-3"> 
        {selectedShelfIds.length > 0 && (
          <div className="flex flex-wrap gap-1.5"> 
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
                className="text-xs underline text-stone-500 hover:text-stone-700 self-center ml-1"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookshelfControls; 