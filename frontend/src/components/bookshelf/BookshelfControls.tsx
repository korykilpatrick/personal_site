import React from 'react';
import { MultiSelectDropdown, SortDropdown, Tooltip } from '../ui';
import { Bookshelf, SortOption } from 'types/index';
import SearchInput from '@/components/common/SearchInput';
import Icon from '@/components/common/Icon';
import BookshelfPill from '@/components/ui/BookshelfPill';

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
  const goodreadsTooltipContent = (
    <p className="p-1 text-xs italic leading-tight text-stone-100">
      This page is sync&apos;d with my{' '}
      <a
        href="https://www.goodreads.com/review/list/76731654?shelf=%23ALL%23"
        target="_blank"
        rel="noopener noreferrer"
        className="text-secondary-light hover:text-white"
      >
        Goodreads
      </a>{' '}
      account, where I began tracking books in 2017.
    </p>
  );

  return (
    <div className="site-card-soft relative z-20 mb-5 px-4 py-4 sm:px-5 sm:py-4.5">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="site-meta text-[0.68rem]">Sort</span>
          <SortDropdown
            options={sortOptions}
            selected={selectedSortBy}
            onChange={onSortChange}
            className="w-40"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="site-meta text-[0.68rem]">Shelves</span>
          <MultiSelectDropdown
            label="Select Shelves"
            items={allBookshelves.map((shelf) => ({ id: shelf.id, label: shelf.name }))}
            selectedItems={selectedShelfIds}
            toggleItem={onToggleShelf}
            className="w-44"
          />
        </div>

        <div className="min-w-[15rem] flex-1">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search books..."
            debounceMs={300}
            className="w-full"
          />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <span className="site-meta whitespace-nowrap text-[0.68rem] normal-case tracking-[0.12em]">
            Showing {bookCount} books
          </span>
          <Tooltip content={goodreadsTooltipContent} side="bottom" sideOffset={5}>
            <span className="text-textTertiary transition hover:text-primary">
              <Icon name="info-circle" size="sm" />
            </span>
          </Tooltip>
        </div>
      </div>

      <div className={selectedShelfIds.length > 0 ? 'mt-3 min-h-8' : 'mt-2 min-h-4'}>
        {selectedShelfIds.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allBookshelves
              .filter((shelf) => selectedShelfIds.includes(shelf.id))
              .map((shelf) => (
                <BookshelfPill
                  key={shelf.id}
                  label={shelf.name}
                  onRemove={() => onToggleShelf(shelf.id)}
                />
              ))}
            {selectedShelfIds.length > 1 && (
              <button
                onClick={onClearShelves}
                className="self-center ml-1 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-textTertiary transition hover:text-primary"
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
