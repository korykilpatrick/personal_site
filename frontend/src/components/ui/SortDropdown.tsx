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
  buttonSize?: 'sm' | 'md' | 'lg';
  buttonClassName?: string;
  iconClassName?: string;
  displayLabelPrefix?: string;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  options,
  selected,
  onChange,
  className = '',
  buttonSize = 'md',
  buttonClassName = '',
  iconClassName = '',
  displayLabelPrefix,
}) => {
  const selectedLabel = options.find((opt) => opt.value === selected)?.label || 'Select...';
  const displayLabel = displayLabelPrefix
    ? `${displayLabelPrefix} ${selectedLabel}`
    : selectedLabel;

  const trigger = (
    <Button
      variant="outline"
      size={buttonSize}
      className={`w-full justify-between gap-3 rounded-[16px] px-3 py-2.5 text-[0.68rem] ${buttonClassName}`}
    >
      <span className="mr-1">{displayLabel}</span>
      <Icon name="chevron-down" className={`ml-auto text-textTertiary ${iconClassName}`} />
    </Button>
  );

  return (
    <Dropdown trigger={trigger} className={className}>
      <div className="max-h-60 overflow-y-auto py-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`block w-full px-4 py-2 text-left font-sans text-[0.8rem] uppercase tracking-[0.16em] transition ${
              selected === option.value
                ? 'bg-primary/[0.07] text-primary'
                : 'text-textSecondary hover:bg-primary/[0.04] hover:text-primary'
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
