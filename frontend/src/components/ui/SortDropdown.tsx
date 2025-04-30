import React from 'react';
import { Dropdown, Button, Icon } from '../common';

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
  const selectedLabel = options.find((opt) => opt.value === selected)?.label || 'Select...';

  const trigger = (
    <Button variant="outline" className="w-full px-2.5 py-1 flex justify-between text-xs">
      <span className="mr-1">{selectedLabel}</span>
      <Icon name="chevron-down" className="ml-auto text-gray-600" />
    </Button>
  );

  return (
    <Dropdown trigger={trigger} className={className}>
      <div className="py-0.5 max-h-60 overflow-y-auto">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`block w-full text-left px-3 py-1.5 text-sm ${
              selected === option.value
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            role="menuitem"
          >
            {option.label}
          </button>
        ))}
      </div>
    </Dropdown>
  );
};

export default SortDropdown;
