import React, { useState, useEffect, useMemo } from 'react';
import api from '@/services/api';
import { LibraryItem } from 'types';
import { Loading, ErrorDisplay, EmptyState } from '@/components/ui';
import LibraryItemCard from '@/components/library/LibraryItemCard';
import LibraryControls from '@/components/library/LibraryControls';

/**
 * LibraryPage – fetches all library items once, provides multi-select filter for item types & tags,
 * plus a search bar. Replicates bookshelf approach for searching & item count display.
 */
const LibraryPage: React.FC = () => {
  const [allItems, setAllItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedTypeIds, setSelectedTypeIds] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch library items on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await api.get<LibraryItem[]>('/library-items');
        setAllItems(resp.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch library items');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Distinct item types (id => name) from loaded items
  const itemTypes = useMemo(() => {
    const map = new Map<number, string>();
    for (const item of allItems) {
      map.set(item.item_type_id, item.type_name || 'Unknown');
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [allItems]);

  // Distinct tags from loaded items
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const item of allItems) {
      if (item.tags) {
        for (const t of item.tags) {
          tagSet.add(t);
        }
      }
    }
    return Array.from(tagSet.values());
  }, [allItems]);

  // Filtered items based on type & tag selections, plus search query
  const filteredItems = useMemo(() => {
    let result = [...allItems];

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
  }, [allItems, selectedTypeIds, selectedTags, searchQuery]);

  // Handler for when an item type is clicked on a card
  const handleItemTypeCardClick = (itemTypeId: number) => {
    setSelectedTypeIds(prev => (prev.includes(itemTypeId) ? prev : [...prev, itemTypeId]));
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <Loading className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <ErrorDisplay error={error} />
      </div>
    );
  }

  if (allItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <EmptyState message="No library items are available." />
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <EmptyState message="No library items match your current filters or search." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <LibraryControls
        itemTypes={itemTypes}
        selectedTypeIds={selectedTypeIds}
        onToggleType={id =>
          setSelectedTypeIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
          )
        }
        onClearTypes={() => setSelectedTypeIds([])}
        tags={allTags}
        selectedTags={selectedTags}
        onToggleTag={tag =>
          setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
          )
        }
        onClearTags={() => setSelectedTags([])}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        itemCount={filteredItems.length}
      />

      <div className="flex flex-col gap-6">
        {filteredItems.map(item => (
          <LibraryItemCard
            key={item.id}
            item={item}
            onTagClick={tag => {
              setSelectedTags(prev => (prev.includes(tag) ? prev : [...prev, tag]));
            }}
            onItemTypeClick={handleItemTypeCardClick}
          />
        ))}
      </div>
    </div>
  );
};

export default LibraryPage;