import React from 'react';
import { WorkEntryLink } from '../../../types'; // Adjust path as necessary
import Input from './Input'; 
import Select from '../common/Select'; 
import { Button } from '../common';
import { FaTrashAlt, FaPlus } from 'react-icons/fa'; // Example icons

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

const StructuredLinkInput: React.FC<StructuredLinkInputProps> = ({ 
  id,
  value,
  onChange,
  disabled = false
}) => {

  const handleLinkChange = (index: number, field: keyof WorkEntryLink, fieldValue: string) => {
    const newLinks = [...value];
    newLinks[index] = { ...newLinks[index], [field]: fieldValue };
    onChange(newLinks);
  };

  const addLink = () => {
    onChange([...value, { title: '', url: '', icon: '' }]);
  };

  const removeLink = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div id={id} className="space-y-3">
      {value.map((link, index) => (
        <div key={index} className="flex items-start space-x-2 p-3 border rounded bg-gray-50">
          <div className="flex-grow space-y-2">
            <Input
              type="text"
              placeholder="Link Title (e.g., Company Website)"
              value={link.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLinkChange(index, 'title', e.target.value)}
              disabled={disabled}
              required // Title should likely be required
              className="w-full"
            />
            <Input
              type="url" // Use URL type for better validation
              placeholder="Link URL (https://...)"
              value={link.url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLinkChange(index, 'url', e.target.value)}
              disabled={disabled}
              required // URL should be required
              className="w-full"
            />
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
      ))}
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