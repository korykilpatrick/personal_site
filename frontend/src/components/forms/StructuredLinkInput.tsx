import React, { useState, useEffect } from 'react';
import { ProjectLink } from 'types/index'; // Only ProjectLink is needed now
import Input from './Input'; 
import { Button } from '../common';
import { FaTrashAlt, FaPlus, FaLink, FaGithub, FaLinkedin, FaYoutube, FaExternalLinkAlt } from 'react-icons/fa'; // Add relevant icons
import { isRequired, isUrl } from '../../utils/validation'; 

// Helper function to determine icon based on URL
const getIconForUrl = (url: string): React.ReactNode => {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes('github.com')) return <FaGithub aria-label="GitHub Icon" />;
    if (hostname.includes('linkedin.com')) return <FaLinkedin aria-label="LinkedIn Icon" />;
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return <FaYoutube aria-label="YouTube Icon" />;
    if (hostname.includes('localhost')) return <FaExternalLinkAlt aria-label="Local Link Icon" />;
    // Add more specific checks if needed
    return <FaLink aria-label="Generic Link Icon" />; // Default link icon
  } catch (e) {
    return <FaLink aria-label="Generic Link Icon" />; // Default on URL parse error
  }
};

// Removed iconOptions array as it's no longer needed

interface StructuredLinkInputProps {
  id: string;
  value: ProjectLink[]; 
  onChange: (newValue: ProjectLink[]) => void; 
  disabled?: boolean;
}

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
  const [errors, setErrors] = useState<{ [index: number]: LinkErrors }>({});

  const validateLink = (link: ProjectLink): LinkErrors => { 
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

  // Function to determine and update the icon based on URL
  const updateIconBasedOnUrl = (url: string, currentLink: ProjectLink): Partial<ProjectLink> => {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      let iconName = 'other'; // Default icon name
      if (hostname.includes('github.com')) iconName = 'github';
      else if (hostname.includes('linkedin.com')) iconName = 'linkedin';
      else if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) iconName = 'youtube';
      else if (hostname.includes('localhost')) iconName = 'website'; // Or a custom local icon name
      // Add more rules here

      // Only update if the icon needs changing
      if (currentLink.icon !== iconName) {
        return { icon: iconName };
      }
    } catch (e) {
      // If URL is invalid or parsing fails, maybe clear icon or set default?
      if (currentLink.icon !== 'other') {
          return { icon: 'other' }; // Set to default if URL becomes invalid
      }
    }
    return {}; // No changes needed
  };

  const handleLinkChange = (index: number, field: 'title' | 'url', rawValue: string) => {
    const trimmedValue = rawValue.trim();
    const newLinks = [...value];
    let updatedLink = { ...newLinks[index] };

    updatedLink[field] = trimmedValue;

    // If URL changed, determine the icon
    let iconUpdate: Partial<ProjectLink> = {};
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
    onChange([...value, { title: '', url: '' }]); // Icon will be determined on URL input
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
        const displayIcon = getIconForUrl(link.url); // Get icon component based on URL
        return (
          <div key={index} className="flex items-start space-x-2 p-3 border rounded bg-gray-50">
             {/* Display determined icon */}
             <div className="flex-shrink-0 pt-1 text-gray-500 text-lg">
                {displayIcon}
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
              
              {/* Removed Select dropdown for icon */}
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