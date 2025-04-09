import React from 'react';
import { Pill } from '../common';

interface FilterPillProps {
  label: string;
  onRemove: () => void;
  className?: string;
}

const FilterPill: React.FC<FilterPillProps> = ({ label, onRemove, className = '' }) => {
  return (
    <Pill label={label} onRemove={onRemove} variant="primary" size="md" className={className} />
  );
};

export default FilterPill;
