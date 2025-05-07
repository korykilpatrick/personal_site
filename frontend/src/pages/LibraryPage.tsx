import React, { useState, useEffect, useMemo } from 'react';
import useApi from '@/hooks/useApi';
import { Loading, ErrorDisplay, FilterButton, EmptyState } from '@/components/ui';
import LibraryItemCard from '@/components/library/LibraryItemCard';
import Card from '@/components/common/Card';
import apiService from '@/api/apiService'; // For getLibraryItems
import api from '@/services/api'; // For direct GET calls
import type { LibraryItem } from 'types';

interface LibraryItemType {
  id: number;
  name: string;
}

const LibraryPage: React.FC = () => {
  const [itemTypes, setItemTypes] = useState<LibraryItemType[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [typesError, setTypesError] = useState<Error | null>(null);

  const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>(undefined);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Load library item types once (public route: /library-item-types)
  useEffect(() => {
    const fetchItemTypes = async () => {
      setTypesLoading(true);
      setTypesError(null);
      try {
        const resp = await api.get<LibraryItemType[]>('/library-item-types');
        setItemTypes(resp.data);
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setTypesError(e);
      } finally {
        setTypesLoading(false);
      }
    };
    fetchItemTypes();
  }, []);

  // Use the same pattern as ProjectsPage/WorkPage, passing [selectedTypeId, selectedTag] to useApi
  const {
    data: libraryItems,
    loading,
    error,
  } = useApi<LibraryItem[], [number | undefined, string | undefined]>(
    apiService.getLibraryItems,
    [selectedTypeId, selectedTag || undefined]
  );

  const handleTypeFilter = (typeId: number | undefined) => setSelectedTypeId(typeId);
  const handleTagClick = (tag: string | null) => setSelectedTag(tag);

  // Collect all tags from libraryItems
  const allTags = useMemo(() => {
    if (!libraryItems) return [];
    const tags = libraryItems.flatMap((item) => item.tags || []);
    return Array.from(new Set(tags));
  }, [libraryItems]);

  if (typesLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <Loading className="h-64" />
      </div>
    );
  }
  if (typesError) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <ErrorDisplay error={typesError.message} />
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
  if (!libraryItems || libraryItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <EmptyState message="No library items found." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <FilterButton
            label="All Types"
            active={!selectedTypeId}
            onClick={() => handleTypeFilter(undefined)}
          />
          {itemTypes.map((type) => (
            <FilterButton
              key={type.id}
              label={type.name}
              active={selectedTypeId === type.id}
              onClick={() => handleTypeFilter(type.id)}
            />
          ))}
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <FilterButton
              label="All Tags"
              active={!selectedTag}
              onClick={() => handleTagClick(null)}
            />
            {allTags.map((tag) => (
              <FilterButton
                key={tag}
                label={tag}
                active={selectedTag === tag}
                onClick={() => handleTagClick(tag)}
              />
            ))}
          </div>
        )}
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {libraryItems.map((item) => (
          <LibraryItemCard
            key={item.id}
            item={item}
            onTagClick={handleTagClick}
          />
        ))}
      </div>
    </div>
  );
};

export default LibraryPage;