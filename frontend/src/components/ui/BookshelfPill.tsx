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
      className="border-primary/22 bg-[linear-gradient(180deg,rgba(21,38,63,0.96),rgba(12,23,39,0.98))] text-cream-light shadow-[0_10px_18px_rgba(12,23,39,0.12),inset_0_1px_0_rgba(255,255,255,0.18)]"
    />
  );
};

export default BookshelfPill; 
