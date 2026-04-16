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
  inputClassName?: string;
  iconClassName?: string;
  clearButtonClassName?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  disabled = false,
  className = '',
  inputClassName = '',
  iconClassName = '',
  clearButtonClassName = '',
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
      <span
        className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-textTertiary ${iconClassName}`}
      >
        <Icon name="search" size="sm" />
      </span>

      <Input
        type="text"
        value={rawValue}
        onChange={(e) => setRawValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`rounded-[16px] py-2.5 pl-9 text-sm ${rawValue ? 'pr-10' : 'pr-7'} ${inputClassName}`}
      />

      {rawValue && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs text-textTertiary transition hover:text-primary focus:outline-none ${clearButtonClassName}`}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchInput;
