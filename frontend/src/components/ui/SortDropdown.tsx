import React from 'react';
import { Select } from '../common';

interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  options: SortOption[];
  selected: string;
  onChange: (value: string) => void;
  className?: string;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  options,
  selected,
  onChange,
  className = '',
}) => {
  return (
    <Select
      options={options}
      value={selected}
      onChange={onChange}
      size="md"
      className={`px-4 ${className}`}
    />
  );
};

export default SortDropdown;
