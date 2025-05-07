import React from 'react';
import { MultiSelectDropdown } from '@/components/ui';
import SearchInput from '@/components/common/SearchInput';
import LibraryItemTypePill from '@/components/ui/LibraryItemTypePill';
import TagPill from '@/components/ui/TagPill';

interface ItemType {
  id: number;
  name: string;
}

interface LibraryControlsProps {
  itemTypes: ItemType[];
  selectedTypeIds: number[];
  onToggleType: (id: number) => void;
  onClearTypes: () => void;
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
  /** For the new search feature */
  searchQuery: string;
  onSearchChange: (val: string) => void;
  /** For displaying the count of filtered items */
  itemCount: number;
}

/**
 * LibraryControls – Provides multi-select filtering for library item types, tags, plus a search bar,
 * and a "showing X items" label at the right. Mirrors BookshelfControls design.
 */
const LibraryControls: React.FC<LibraryControlsProps> = ({
  itemTypes,
  selectedTypeIds,
  onToggleType,
  onClearTypes,
  tags,
  selectedTags,
  onToggleTag,
  onClearTags,
  searchQuery,
  onSearchChange,
  itemCount,
}) => {
  return (
    <div className="mb-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Item Types multi-select dropdown */}
        <div className="flex items-center">
          <span className="text-xs font-medium text-stone-700 mr-2">Item Types</span>
          <MultiSelectDropdown
            label="Select Types"
            items={itemTypes.map(t => ({ id: t.id, label: t.name }))}
            selectedItems={selectedTypeIds}
            toggleItem={onToggleType}
            className="w-44"
          />
        </div>

        {/* Tags multi-select dropdown */}
        <div className="flex items-center">
          <span className="text-xs font-medium text-stone-700 mr-2">Tags</span>
          <MultiSelectDropdown
            label="Select Tags"
            items={tags.map((t, i) => ({ id: i, label: t }))}
            selectedItems={selectedTags.map(tag => tags.indexOf(tag)).filter(idx => idx >= 0)}
            toggleItem={index => {
              const chosenTag = tags[index];
              onToggleTag(chosenTag);
            }}
            className="w-44"
          />
        </div>

        {/* Search bar */}
        <div className="flex items-center">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search items..."
            debounceMs={300}
            className="w-72"
          />
        </div>

        {/* Right side: item count display */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-xs text-stone-500">Showing {itemCount} items</span>
        </div>
      </div>

      {/* Selected item type pills */}
      <div className="mt-3 space-y-2">
        {selectedTypeIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {selectedTypeIds.map(id => {
              const found = itemTypes.find(t => t.id === id);
              if (!found) return null;
              return (
                <LibraryItemTypePill
                  key={id}
                  label={found.name}
                  onRemove={() => onToggleType(id)}
                />
              );
            })}
            {selectedTypeIds.length > 1 && (
              <button
                onClick={onClearTypes}
                className="text-xs underline text-stone-500 hover:text-stone-700 ml-1"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Selected tag pills */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {selectedTags.map(tag => (
              <TagPill
                key={tag}
                label={tag}
                onRemove={() => onToggleTag(tag)}
              />
            ))}
            {selectedTags.length > 1 && (
              <button
                onClick={onClearTags}
                className="text-xs underline text-stone-500 hover:text-stone-700 ml-1"
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

export default LibraryControls;