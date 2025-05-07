import React from 'react';
import FilterPill from './FilterPill';

// Props needed by LibraryItemTypePill, which are passed to FilterPill
interface LibraryItemTypePillProps {
  label: string;
  onRemove: () => void;
}

const LibraryItemTypePill: React.FC<LibraryItemTypePillProps> = ({ label, onRemove }) => {
  return (
    <FilterPill
      label={label}
      onRemove={onRemove}
      className="font-medium bg-blue-100 text-blue-700" // Applies specific styling
    />
  );
};

export default LibraryItemTypePill; 