import React from 'react';
import { FormInput, FormField } from './'; // Import Input from the same directory
import { Button, Select } from '../common';
import { MediaEntry } from 'types/index'; // Correct path

// Define options for the media type select
// Moved here from ProjectForm as it's specific to this input
const mediaTypeOptions = [
  { value: '', label: 'Select type...', disabled: true },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
];

interface MediaEntriesInputProps {
  entries: MediaEntry[];
  onChange: (index: number, field: keyof MediaEntry, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

const MediaEntriesInput: React.FC<MediaEntriesInputProps> = ({
  entries,
  onChange,
  onAdd,
  onRemove,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      {/* Label is expected to be provided by the parent FormField */} 
      {entries.map((entry, index) => (
        <div key={index} className="flex items-center space-x-2 p-2 border border-gray-200 rounded bg-gray-50">
          <Select
            id={`media_type_${index}`}
            name={`media_type_${index}`}
            options={mediaTypeOptions}
            value={entry.type || ''} 
            onChange={(value) => onChange(index, 'type', value)}
            required
            disabled={disabled}
            className="w-1/4"
          />
          <FormInput
            type="text"
            name={`media_url_${index}`}
            placeholder="Media URL (e.g., /img.jpg or https://...)"
            value={entry.url}
            onChange={(e) => onChange(index, 'url', e.target.value)}
            required
            disabled={disabled}
            className="flex-grow !mb-0" // Remove bottom margin for inline use
          />
          <Button
            type="button"
            variant="text"
            onClick={() => onRemove(index)}
            disabled={disabled}
            size="sm"
            className="text-red-600 hover:bg-red-50 flex-shrink-0" // Prevent shrinking
          >
            Remove
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={onAdd}
        disabled={disabled}
        className="mt-2"
      >
        Add Media Entry
      </Button>
    </div>
  );
};

export default MediaEntriesInput;
export type { MediaEntriesInputProps }; 