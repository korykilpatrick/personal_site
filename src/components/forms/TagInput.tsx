import React, { useState, KeyboardEvent, ChangeEvent } from 'react';
import { Input } from './'; // Corrected import path (assuming index export)
import { Tag } from '../ui'; // Use Tag component for display
import { Button } from '../common'; // For potential remove button

interface TagInputProps {
  id?: string;
  value: string[]; // Expects an array of tags
  onChange: (tags: string[]) => void; // Returns an array of tags
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const TagInput: React.FC<TagInputProps> = ({
  id,
  value = [],
  onChange,
  placeholder = 'Add tags...',
  disabled = false,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault(); // Prevent form submission on Enter
      const newTag = inputValue.trim();
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue(''); // Clear input
    }
    // Handle Backspace to remove the last tag if input is empty
    if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
        handleRemoveTag(value.length - 1);
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    if (!disabled) {
      onChange(value.filter((_, index) => index !== indexToRemove));
    }
  };

  return (
    <div 
      className={`flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded ${disabled ? 'bg-gray-100' : 'bg-white'} ${className}`} 
      onClick={() => document.getElementById(id || 'tag-input-field')?.focus()} // Focus input on click
    >
      {value.map((tag, index) => (
        <React.Fragment key={index}>
          <Tag 
            label={tag}
            className="mr-1" 
          />
          {!disabled && (
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); handleRemoveTag(index); }}
              className="text-xs text-gray-500 hover:text-red-600 focus:outline-none"
              aria-label={`Remove ${tag}`}
            >
              &times;
            </button>
          )}
        </React.Fragment>
      ))}
      <Input
        id={id || 'tag-input-field'}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''} // Show placeholder only when empty
        disabled={disabled}
        // Resetting some Input styles for inline use within the tag container
        className="flex-grow !border-none !p-0 !shadow-none !outline-none !focus:ring-0 !bg-transparent disabled:!bg-transparent min-w-[80px]"
      />
    </div>
  );
};

export default TagInput;
export type { TagInputProps }; 