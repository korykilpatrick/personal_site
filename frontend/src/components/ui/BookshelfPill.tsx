import React from 'react';
import FilterPill from './FilterPill';

// Props needed by BookshelfPill, which are passed to FilterPill
interface BookshelfPillProps {
  label: string;
  onRemove: () => void;
}

const BookshelfPill: React.FC<BookshelfPillProps> = ({ label, onRemove }) => {
  return (
    <FilterPill
      label={label}
      onRemove={onRemove}
      // No className override needed, uses default FilterPill styling (effectively Pill variant="primary")
    />
  );
};

export default BookshelfPill; 