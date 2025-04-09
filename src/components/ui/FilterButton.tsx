import React from 'react';

interface FilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({ label, active, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md transition ${
        active ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } ${className}`}
    >
      {label}
    </button>
  );
};

export default FilterButton;
