import React, { useState, useEffect } from 'react';
import Input from './Input';
import Icon from './Icon';
import { useDebouncedValue } from '@/hooks';

interface SearchInputProps {
  value: string;
  onChange: (debouncedValue: string) => void;
  placeholder?: string;
  debounceMs?: number;
  disabled?: boolean;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  disabled = false,
  className = '',
}) => {
  const [rawValue, setRawValue] = useState(value);
  const debouncedValue = useDebouncedValue(rawValue, debounceMs);

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  useEffect(() => {
    // If external value changes, update local
    setRawValue(value);
  }, [value]);

  const handleClear = () => {
    setRawValue('');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search icon in absolute pos */}
      <span className="absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
        <Icon name="search" size="sm" />
      </span>

      <Input
        type="text"
        value={rawValue}
        onChange={(e) => setRawValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`text-xs px-2.5 py-1 pl-7 ${rawValue ? 'pr-10' : 'pr-7'}`}
      />

      {rawValue && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute top-1/2 right-2 transform -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchInput;