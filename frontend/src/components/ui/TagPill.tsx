import React from 'react';
import FilterPill from './FilterPill';

// Props needed by TagPill, which are passed to FilterPill
interface TagPillProps {
  label: string;
  onRemove: () => void;
}

const TagPill: React.FC<TagPillProps> = ({ label, onRemove }) => {
  return (
    <FilterPill
      label={label}
      onRemove={onRemove}
      // className="font-medium bg-primary/10 text-primary px-1.5" // Removed to adopt default FilterPill styling
    />
  );
};

export default TagPill; 