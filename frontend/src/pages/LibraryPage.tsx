import React, { useState, useMemo, useCallback } from 'react';
import { LibraryItem } from 'types';
import { Loading, ErrorDisplay, EmptyState } from '@/components/ui';
import LibraryItemCard from '@/components/library/LibraryItemCard';
import LibraryControls from '@/components/library/LibraryControls';
import { useLibrary } from '@/context/LibraryContext';

/**
 * LibraryPage – uses global library items, provides multi-select filter for item types & tags,
 * plus a search bar. Replicates bookshelf approach for searching & item count display.
 */
const LibraryPage: React.FC = () => {
  // Use global context for library items, loading, and error states
  const { libraryItems, loading, error: contextError } = useLibrary();

  // Filter states
  const [selectedTypeIds, setSelectedTypeIds] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Distinct item types (id => name) from loaded items
  const itemTypes = useMemo(() => {
    const map = new Map<number, string>();
    for (const item of libraryItems) {
      map.set(item.item_type_id, item.type_name || 'Unknown');
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [libraryItems]);

  // Distinct tags from loaded items
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const item of libraryItems) {
      if (item.tags) {
        for (const t of item.tags) {
          tagSet.add(t);
        }
      }
    }
    return Array.from(tagSet.values());
  }, [libraryItems]);

  // Filtered items based on type & tag selections, plus search query
  const filteredItems = useMemo(() => {
    let result = [...libraryItems];

    // If any type is selected, item.type must be in that list
    if (selectedTypeIds.length > 0) {
      result = result.filter(item => selectedTypeIds.includes(item.item_type_id));
    }

    // If any tags are selected, item.tags must overlap at least one
    if (selectedTags.length > 0) {
      result = result.filter(item => {
        const itemTags = item.tags || [];
        return itemTags.some(tag => selectedTags.includes(tag));
      });
    }

    // If search is non-empty, filter by matching title, blurb, or creators
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(item => {
        if (item.title.toLowerCase().includes(query)) return true;
        if (item.blurb && item.blurb.toLowerCase().includes(query)) return true;
        if (item.creators && item.creators.some(c => c.toLowerCase().includes(query))) return true;
        return false;
      });
    }

    return result;
  }, [libraryItems, selectedTypeIds, selectedTags, searchQuery]);

  // Optimized event handlers with useCallback
  const onToggleType = useCallback((typeId: number) => {
    setSelectedTypeIds(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  }, []);

  const onToggleTag = useCallback((tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const onClearTypes = useCallback(() => {
    setSelectedTypeIds([]);
  }, []);

  const onClearTags = useCallback(() => {
    setSelectedTags([]);
  }, []);

  const onSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Handler for when an item type is clicked on a card
  const handleItemTypeCardClick = useCallback((itemTypeId: number) => {
    setSelectedTypeIds(prev => (prev.includes(itemTypeId) ? prev : [...prev, itemTypeId]));
  }, []);

  // Handler for when a tag is clicked on a card
  const handleTagCardClick = useCallback((tag: string) => {
    setSelectedTags(prev => (prev.includes(tag) ? prev : [...prev, tag]));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <Loading className="h-64" />
      </div>
    );
  }

  if (contextError) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <ErrorDisplay error={`Failed to load library items: ${contextError.message}`} />
      </div>
    );
  }

  if (!loading && libraryItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <EmptyState message="No library items are available." />
      </div>
    );
  }

  if (!loading && !contextError && libraryItems.length > 0 && filteredItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <LibraryControls
          itemTypes={itemTypes}
          selectedTypeIds={selectedTypeIds}
          onToggleType={onToggleType}
          onClearTypes={onClearTypes}
          tags={allTags}
          selectedTags={selectedTags}
          onToggleTag={onToggleTag}
          onClearTags={onClearTags}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          itemCount={filteredItems.length}
        />
        <EmptyState message="No library items match your current filters or search." className="mt-6" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <LibraryControls
        itemTypes={itemTypes}
        selectedTypeIds={selectedTypeIds}
        onToggleType={onToggleType}
        onClearTypes={onClearTypes}
        tags={allTags}
        selectedTags={selectedTags}
        onToggleTag={onToggleTag}
        onClearTags={onClearTags}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        itemCount={filteredItems.length}
      />

      <div className="flex flex-col gap-6">
        {filteredItems.map(item => (
          <LibraryItemCard
            key={item.id}
            item={item}
            onTagClick={handleTagCardClick}
            onItemTypeClick={handleItemTypeCardClick}
          />
        ))}
      </div>
    </div>
  );
};

export default LibraryPage;