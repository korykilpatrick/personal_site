import React, { ChangeEvent, useState } from 'react';
import { FormInput } from './';
import { Button } from '../common';
import { isRequired, isUrl } from '../../utils/validation';

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
  const [errors, setErrors] = useState<{ [index: number]: string }>({});

  const validateLink = (url: string): string | undefined => {
    const trimmedUrl = url.trim();
    if (!isRequired(trimmedUrl)) {
      return 'URL is required.';
    }
    if (!isUrl(trimmedUrl)) {
      return 'Must be a valid URL (e.g., https://...).';
    }
    return undefined;
  };

  const handleLinkChange = (index: number, rawValue: string) => {
    const trimmedValue = rawValue.trim();
    const updatedLinks = [...value];
    updatedLinks[index] = trimmedValue;
    
    const error = validateLink(trimmedValue);
    setErrors(prevErrors => ({
      ...prevErrors,
      [index]: error || '',
    }));

    onChange(updatedLinks);
  };

  const handleAddLink = () => {
    const newIndex = value.length;
    onChange([...value, '']);
    setErrors(prevErrors => ({
      ...prevErrors,
      [newIndex]: '',
    }));
  };

  const handleRemoveLink = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors[indexToRemove];
      return newErrors;
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {value.map((link, index) => {
        const linkError = errors[index];
        return (
          <div key={index}>
            <div className="flex items-center space-x-2">
              <FormInput
                id={index === 0 ? id : undefined}
                type="url"
                name={`link_${index}`}
                placeholder={placeholder}
                value={link}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleLinkChange(index, e.target.value)}
                disabled={disabled}
                className={`flex-grow !mb-0 ${linkError ? 'border-red-500' : ''}`}
                aria-describedby={linkError ? `link-${index}-error` : undefined}
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
            {linkError && (
              <p id={`link-${index}-error`} className="text-red-600 text-xs mt-1">{linkError}</p>
            )}
          </div>
        );
      })}
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