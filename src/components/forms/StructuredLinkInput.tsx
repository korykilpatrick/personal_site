import React, { useState } from 'react';
import { WorkEntryLink } from '../../../types'; // Adjust path as necessary
import Input from './Input'; 
import Select from '../common/Select'; 
import { Button } from '../common';
import { FaTrashAlt, FaPlus } from 'react-icons/fa'; // Example icons
import { isRequired, isUrl } from '../../utils/validation'; // Import validation utils

// Define available icons
const iconOptions = [
  { value: '', label: 'None' },
  { value: 'github', label: 'GitHub' },
  { value: 'website', label: 'Website' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'demo', label: 'Demo' },
  { value: 'docs', label: 'Documentation' },
  { value: 'other', label: 'Other Link' },
];

interface StructuredLinkInputProps {
  id: string;
  value: WorkEntryLink[];
  onChange: (newValue: WorkEntryLink[]) => void;
  disabled?: boolean;
}

// Define a type for error messages for each link item
type LinkErrors = {
  title?: string;
  url?: string;
};

const StructuredLinkInput: React.FC<StructuredLinkInputProps> = ({ 
  id,
  value,
  onChange,
  disabled = false
}) => {
  // State to hold validation errors for each link entry
  const [errors, setErrors] = useState<{ [index: number]: LinkErrors }>({});

  const validateLink = (link: WorkEntryLink): LinkErrors => {
    const linkErrors: LinkErrors = {};
    if (!isRequired(link.title)) {
      linkErrors.title = 'Title is required.';
    }
    if (!isRequired(link.url)) {
      linkErrors.url = 'URL is required.';
    } else if (!isUrl(link.url)) {
      linkErrors.url = 'Must be a valid URL (e.g., https://...).';
    }
    return linkErrors;
  };

  const handleLinkChange = (index: number, field: keyof WorkEntryLink, rawValue: string) => {
    const trimmedValue = rawValue.trim(); // Trim whitespace
    const newLinks = [...value];
    const updatedLink = { ...newLinks[index], [field]: trimmedValue };
    newLinks[index] = updatedLink;
    
    // Validate the updated link
    const linkErrors = validateLink(updatedLink);
    setErrors(prevErrors => ({
      ...prevErrors,
      [index]: linkErrors,
    }));

    onChange(newLinks); // Pass trimmed value up
  };

  const addLink = () => {
    // Add new link and initialize errors for it
    const newIndex = value.length;
    onChange([...value, { title: '', url: '', icon: '' }]);
    setErrors(prevErrors => ({
      ...prevErrors,
      [newIndex]: {}, // Initialize empty errors for the new link
    }));
  };

  const removeLink = (indexToRemove: number) => {
    onChange(value.filter((_, i) => i !== indexToRemove));
    // Clean up errors for the removed index
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors[indexToRemove];
      // Adjust indices for subsequent errors if necessary (though map keys handle this ok)
      return newErrors; 
    });
  };

  return (
    <div id={id} className="space-y-3">
      {value.map((link, index) => {
        const linkErrors = errors[index] || {}; // Get errors for this specific link
        return (
          <div key={index} className="flex items-start space-x-2 p-3 border rounded bg-gray-50">
            <div className="flex-grow space-y-1"> {/* Reduced space */}
              <div> {/* Wrap Input and error */}
                <Input
                  type="text"
                  placeholder="Link Title (e.g., Company Website)"
                  value={link.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLinkChange(index, 'title', e.target.value)}
                  disabled={disabled}
                  // Removed HTML required, relying on JS validation
                  className={`w-full ${linkErrors.title ? 'border-red-500' : ''}`} // Highlight if error
                  aria-describedby={linkErrors.title ? `link-${index}-title-error` : undefined}
                />
                {linkErrors.title && (
                  <p id={`link-${index}-title-error`} className="text-red-600 text-xs mt-1">{linkErrors.title}</p>
                )}
              </div>

              <div> {/* Wrap Input and error */}
                <Input
                  type="url" // Keep type=url for semantic meaning/mobile keyboards
                  placeholder="Link URL (https://...)"
                  value={link.url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLinkChange(index, 'url', e.target.value)}
                  disabled={disabled}
                  // Removed HTML required
                  className={`w-full ${linkErrors.url ? 'border-red-500' : ''}`} // Highlight if error
                  aria-describedby={linkErrors.url ? `link-${index}-url-error` : undefined}
                />
                {linkErrors.url && (
                  <p id={`link-${index}-url-error`} className="text-red-600 text-xs mt-1">{linkErrors.url}</p>
                )}
              </div>
              
              <Select
                value={link.icon || ''}
                onChange={(value: string) => handleLinkChange(index, 'icon', value)}
                disabled={disabled}
                options={iconOptions}
                className="w-full"
              />
            </div>
            <Button 
              type="button"
              variant="text"
              onClick={() => removeLink(index)}
              disabled={disabled}
              className="mt-1 flex-shrink-0 text-red-600 hover:text-red-800 p-1"
              aria-label="Remove Link"
            >
              <FaTrashAlt />
            </Button>
          </div>
        );
      })}
      <Button 
        type="button" 
        variant="secondary"
        onClick={addLink} 
        disabled={disabled}
        className="mt-2"
      >
        <FaPlus className="mr-1 inline" /> Add Link
      </Button>
    </div>
  );
};

export default StructuredLinkInput; 