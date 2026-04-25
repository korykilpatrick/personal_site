import React from 'react';
import { Dropdown, Button, Icon } from '../common';

interface DropdownItem {
  id: number;
  label: string;
}

interface MultiSelectDropdownProps {
  label: string;
  items: DropdownItem[];
  selectedItems: number[];
  toggleItem: (id: number) => void;
  className?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  items,
  selectedItems,
  toggleItem,
  className = '',
}) => {
  // Determine display label based on selection
  const displayLabel = selectedItems.length === 0 ? 'All' : `${selectedItems.length} selected`;

  // Create trigger button
  const trigger = (
    <Button
      variant="outline"
      className="w-full justify-between gap-3 rounded-[16px] px-3 py-2.5 text-[0.68rem]"
    >
      <span className="mr-1">{displayLabel}</span>
      <Icon name="chevron-down" className="ml-auto text-textTertiary" />
    </Button>
  );

  return (
    <Dropdown trigger={trigger} className={className}>
      <div className="max-h-60 overflow-y-auto py-1.5">
        {items.map((item) => (
          <div key={item.id} className="px-4 py-1.5">
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-[12px] px-2 py-2 transition ${
                selectedItems.includes(item.id)
                  ? 'bg-primary/[0.08] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.38)]'
                  : 'text-textSecondary hover:bg-primary/[0.04] hover:text-primary'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => toggleItem(item.id)}
                className="h-4 w-4 rounded border-primary/20 text-oxblood focus:ring-oxblood/25"
              />
              <span className="font-sans text-[0.8rem] uppercase tracking-[0.14em]">
                {item.label}
              </span>
            </label>
          </div>
        ))}
      </div>
    </Dropdown>
  );
};

export default MultiSelectDropdown;
