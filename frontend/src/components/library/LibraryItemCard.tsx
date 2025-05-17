import React, { useState } from 'react';
import Card from '@/components/common/Card';
import Tag from '@/components/ui/Tag';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';
import ImageModal from '@/components/common/ImageModal';
import { LibraryItem } from 'types';

interface LibraryItemCardProps {
  item: LibraryItem;
  onTagClick?: (tag: string) => void;
  onItemTypeClick?: (itemTypeId: number) => void;
}

/**
 * LibraryItemCard – Displays a single library item.
 * The item title is clickable, removing the previous "Visit Link" at the bottom.
 */
const LibraryItemCard: React.FC<LibraryItemCardProps> = ({ item, onTagClick, onItemTypeClick }) => {
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isBlurbExpanded, setIsBlurbExpanded] = useState(false);

  const handleTagClick = (tag: string) => {
    if (onTagClick) {
      onTagClick(tag);
    }
  };

  const handleItemTypeClick = (itemTypeId: number) => {
    if (onItemTypeClick) {
      onItemTypeClick(itemTypeId);
    }
  };

  const handleThumbnailClick = () => {
    if (item.thumbnail_url && !imageError) {
      setSelectedImageUrl(item.thumbnail_url);
      setIsModalOpen(true);
    }
  };

  const toggleBlurbExpand = () => {
    setIsBlurbExpanded(!isBlurbExpanded);
  };

  const blurbPreviewLength = 200;
  const needsTruncation = item.blurb && item.blurb.length > blurbPreviewLength;

  return (
    <>
      <Card variant="hover" padding="none" className="h-full flex flex-col">
        <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4 flex-grow min-h-[200px]">
          <div className="md:flex-1 min-w-0 flex flex-col gap-3 flex-grow">
            <div className="flex justify-between items-baseline">
              <h2 className="text-lg font-bold truncate min-w-0">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {item.title}
                </a>
              </h2>
              {item.created_at && (
                <div className="text-xs text-stone-500 whitespace-nowrap ml-2" title="Date Added">
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
              )}
            </div>

            {item.creators && item.creators.length > 0 && (
              <p className="text-sm text-stone-700 italic">
                By {item.creators.join(', ')}
              </p>
            )}

            {item.blurb && (
              <div className="text-textSecondary text-sm prose prose-primary max-w-none">
                <MarkdownRenderer>
                  {needsTruncation && !isBlurbExpanded
                    ? `${item.blurb.substring(0, blurbPreviewLength)}...`
                    : item.blurb}
                </MarkdownRenderer>
                {needsTruncation && (
                  <button
                    onClick={toggleBlurbExpand}
                    className="text-primary hover:underline text-sm mt-1"
                    aria-expanded={isBlurbExpanded}
                  >
                    {isBlurbExpanded ? 'Show Less' : 'Show More'}
                  </button>
                )}
              </div>
            )}
            
            <div className="flex-grow"></div>

            {(item.type_name || (item.tags && item.tags.length > 0)) && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 pt-2">
                {item.type_name && (
                  <span 
                    className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full cursor-pointer hover:bg-blue-200"
                    onClick={() => handleItemTypeClick(item.item_type_id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleItemTypeClick(item.item_type_id); }}
                    title={`Filter by type: ${item.type_name}`}
                  >
                    {item.type_name}
                  </span>
                )}
                {item.tags &&
                  item.tags.map((tag) => (
                    <Tag key={tag} label={tag} onClick={() => handleTagClick(tag)} />
                  ))}
              </div>
            )}
          </div>

          {!imageError && item.thumbnail_url && (
            <div className="md:w-1/3 lg:w-1/4 flex-shrink-0 md:self-center">
              <div 
                className="relative overflow-hidden rounded-md shadow-sm h-40 md:h-48 bg-gray-100 cursor-pointer"
                onClick={handleThumbnailClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleThumbnailClick(); }}
                aria-label={`View larger image for ${item.title}`}
              >
                <img
                  src={item.thumbnail_url}
                  alt={`Thumbnail for ${item.title}`}
                  className="w-full h-full object-cover object-center"
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>
      </Card>
      <ImageModal
        isOpen={isModalOpen}
        imageUrl={selectedImageUrl}
        onClose={() => setIsModalOpen(false)}
        altText={selectedImageUrl ? `Enlarged image for ${item.title}` : undefined}
      />
    </>
  );
};

export default LibraryItemCard;