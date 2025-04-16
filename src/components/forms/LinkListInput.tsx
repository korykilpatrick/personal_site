import React, { ChangeEvent } from 'react';
import { Input } from './';
import { Button } from '../common';

interface LinkListInputProps {
  id?: string;
  value: string[]; // Expects an array of URL strings
  onChange: (links: string[]) => void; // Returns an array of URL strings
  placeholder?: string; // Placeholder for individual inputs
  disabled?: boolean;
  className?: string;
}

const LinkListInput: React.FC<LinkListInputProps> = ({
  id,
  value = [],
  onChange,
  placeholder = 'Enter URL...',
  disabled = false,
  className = '',
}) => {

  const handleLinkChange = (index: number, newValue: string) => {
    const updatedLinks = [...value];
    updatedLinks[index] = newValue;
    onChange(updatedLinks);
  };

  const handleAddLink = () => {
    onChange([...value, '']); // Add a new empty string for the new input
  };

  const handleRemoveLink = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label is expected to be provided by the parent FormField */} 
      {value.map((link, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Input
            id={index === 0 ? id : undefined} // Assign ID only to the first input for label association
            type="url" // Use type="url" for basic validation
            name={`link_${index}`}
            placeholder={placeholder}
            value={link}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleLinkChange(index, e.target.value)}
            disabled={disabled}
            className="flex-grow !mb-0" // Adjust styling for inline use
          />
          {!disabled && (
            <Button
              type="button"
              variant="text"
              onClick={() => handleRemoveLink(index)}
              disabled={disabled}
              size="sm"
              className="text-red-600 hover:bg-red-50 flex-shrink-0"
              aria-label={`Remove link ${index + 1}`}
            >
              Remove
            </Button>
          )}
        </div>
      ))}
      {!disabled && (
        <Button
          type="button"
          variant="secondary"
          onClick={handleAddLink}
          disabled={disabled}
          className="mt-2"
        >
          Add Link
        </Button>
      )}
    </div>
  );
};

export default LinkListInput;
export type { LinkListInputProps }; 