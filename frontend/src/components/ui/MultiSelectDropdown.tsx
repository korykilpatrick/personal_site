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
  label,
  items,
  selectedItems,
  toggleItem,
  className = '',
}) => {
  // Determine display label based on selection
  const displayLabel = selectedItems.length === 0 ? 'All' : `${selectedItems.length} selected`;

  // Create trigger button
  const trigger = (
    <Button variant="outline" className="w-full px-2.5 py-1 flex justify-between text-xs">
      <span className="mr-1">{displayLabel}</span>
      <Icon name="chevron-down" className="ml-auto text-gray-600" />
    </Button>
  );

  return (
    <Dropdown trigger={trigger} className={className}>
      <div className="py-0.5 max-h-60 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="px-2 py-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => toggleItem(item.id)}
                className="form-checkbox h-4 w-4 text-indigo-500 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{item.label}</span>
            </label>
          </div>
        ))}
      </div>
    </Dropdown>
  );
};

export default MultiSelectDropdown;
