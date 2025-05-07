import React, { useState } from 'react';
import Card from '@/components/common/Card';
import Tag from '@/components/ui/Tag';
import Icon from '@/components/common/Icon';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';
import { LibraryItem } from 'types'; // now from central types

interface LibraryItemCardProps {
  item: LibraryItem;
  onTagClick?: (tag: string) => void;
}

const LibraryItemCard: React.FC<LibraryItemCardProps> = ({ item, onTagClick }) => {
  const [imageError, setImageError] = useState(false);

  const handleTagClick = (tag: string) => {
    if (onTagClick) {
      onTagClick(tag);
    }
  };

  return (
    <Card variant="hover" padding="none" className="h-full flex flex-col">
      <div className="p-4 md:p-5 flex flex-col gap-3">
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <Tag key={tag} label={tag} onClick={() => handleTagClick(tag)} />
            ))}
          </div>
        )}

        <h2 className="text-lg font-bold truncate">{item.title}</h2>

        {item.type_name && (
          <p className="text-xs text-gray-500 italic">{item.type_name}</p>
        )}

        {item.creators && item.creators.length > 0 && (
          <p className="text-sm text-stone-700">
            By {item.creators.join(', ')}
          </p>
        )}

        {item.blurb && (
          <div className="text-textSecondary text-sm prose prose-primary max-w-none">
            <MarkdownRenderer>{item.blurb}</MarkdownRenderer>
          </div>
        )}

        <div className="flex items-center justify-between">
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            <Icon name="external-link" size="sm" className="mr-1" />
            Visit Link
          </a>
        </div>
      </div>

      {!imageError && item.thumbnail_url && (
        <div className="w-full h-40 overflow-hidden rounded-b-lg bg-gray-100">
          <img
            src={item.thumbnail_url}
            alt={`Thumbnail for ${item.title}`}
            className="w-full h-full object-cover object-center"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        </div>
      )}
    </Card>
  );
};

export default LibraryItemCard;