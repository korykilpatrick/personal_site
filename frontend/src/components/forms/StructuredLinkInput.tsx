import React, { useState } from 'react';
import { ProjectLink, WorkEntryLink } from 'types/index';
import Input from './Input';
import { Button } from '../common';
import { FaTrashAlt, FaPlus } from 'react-icons/fa';
import { isRequired, isUrl } from '../../utils/validation';
import LinkIcon, { LinkIconName } from '../common/LinkIcon';

// Define a type that can be either ProjectLink or WorkEntryLink
type AnyLink = ProjectLink | WorkEntryLink;

interface StructuredLinkInputProps<T extends AnyLink> {
  id: string;
  value: T[];
  onChange: (newValue: T[]) => void;
  disabled?: boolean;
}

type LinkErrors = {
  title?: string;
  url?: string;
};

const StructuredLinkInput = <T extends AnyLink>({
  id,
  value,
  onChange,
  disabled = false
}: StructuredLinkInputProps<T>) => {
  const [errors, setErrors] = useState<{ [index: number]: LinkErrors }>({});

  const validateLink = (link: T): LinkErrors => {
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

  // Function to determine and update the icon name based on URL
  const updateIconBasedOnUrl = (url: string, currentLink: T): Partial<T> => {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      let iconName: LinkIconName = 'website'; // Default icon name, now typed

      if (hostname.includes('github.com')) iconName = 'github';
      else if (hostname.includes('linkedin.com')) iconName = 'linkedin';
      else if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) iconName = 'youtube';
      else if (hostname.includes('twitter.com') || hostname.includes('x.com')) iconName = 'twitter';
      // localhost already defaults to 'website'

      // Only update if the icon needs changing
      if (currentLink.icon !== iconName) {
        return { icon: iconName } as Partial<T>; // Cast needed due to generic T
      }
    } catch (e) {
      // If URL is invalid or parsing fails, set to default 'website' icon
      if (currentLink.icon !== 'website') {
        return { icon: 'website' } as Partial<T>; // Cast needed
      }
    }
    return {}; // No changes needed
  };

  const handleLinkChange = (index: number, field: 'title' | 'url', rawValue: string) => {
    const trimmedValue = rawValue.trim();
    const newLinks = [...value];
    let updatedLink = { ...newLinks[index] };

    updatedLink[field] = trimmedValue;

    // If URL changed, determine the icon name
    let iconUpdate: Partial<T> = {};
    if (field === 'url') {
      iconUpdate = updateIconBasedOnUrl(trimmedValue, updatedLink);
    }

    // Merge field update and potential icon update
    updatedLink = { ...updatedLink, ...iconUpdate };

    newLinks[index] = updatedLink;

    // Validate the updated link
    const linkErrors = validateLink(updatedLink);
    setErrors(prevErrors => ({
      ...prevErrors,
      [index]: linkErrors,
    }));

    onChange(newLinks);
  };

  const addLink = () => {
    const newIndex = value.length;
    // Initialize with empty title/url, icon will be determined on URL input
    const newLinkBase = { title: '', url: '' };
    // Type assertion needed because we don't know if T is ProjectLink or WorkEntryLink at compile time
    onChange([...value, newLinkBase as T]); 
    setErrors(prevErrors => ({
      ...prevErrors,
      [newIndex]: {},
    }));
  };

  const removeLink = (indexToRemove: number) => {
    onChange(value.filter((_, i) => i !== indexToRemove));
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors[indexToRemove];
      return newErrors;
    });
  };

  return (
    <div id={id} className="space-y-3">
      {value.map((link, index) => {
        const linkErrors = errors[index] || {};
        return (
          <div key={index} className="flex items-start space-x-2 p-3 border rounded bg-gray-50">
             {/* Use the new LinkIcon component, passing the URL */}
             <div className="flex-shrink-0 pt-1 text-gray-500 text-lg">
                <LinkIcon url={link.url} />
             </div>

            <div className="flex-grow space-y-1">
              <div>
                <Input
                  type="text"
                  placeholder="Link Title (e.g., GitHub Repo)"
                  value={link.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLinkChange(index, 'title', e.target.value)}
                  disabled={disabled}
                  className={`w-full ${linkErrors.title ? 'border-red-500' : ''}`}
                  aria-describedby={linkErrors.title ? `link-${index}-title-error` : undefined}
                />
                {linkErrors.title && (
                  <p id={`link-${index}-title-error`} className="text-red-600 text-xs mt-1">{linkErrors.title}</p>
                )}
              </div>

              <div>
                <Input
                  type="url"
                  placeholder="Link URL (https://...)"
                  value={link.url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLinkChange(index, 'url', e.target.value)}
                  disabled={disabled}
                  className={`w-full ${linkErrors.url ? 'border-red-500' : ''}`}
                  aria-describedby={linkErrors.url ? `link-${index}-url-error` : undefined}
                />
                {linkErrors.url && (
                  <p id={`link-${index}-url-error`} className="text-red-600 text-xs mt-1">{linkErrors.url}</p>
                )}
              </div>
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