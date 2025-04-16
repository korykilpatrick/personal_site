import React, { useState, useEffect, FormEvent } from 'react';
import { Project, ProjectFormData } from '../../types/project'; // Import shared types
import { Button, Select } from '../common'; // Import common components
import { ErrorDisplay, Loading } from '../ui';
import { Input, Textarea, FormField, MediaEntriesInput, MediaEntry, TagInput, LinkListInput } from '../forms'; // Import new form components and FormField
import { parseCommaSeparatedString } from '../../utils/helpers'; // Import from utils

// REMOVE local Project interface definition
// interface Project { ... }

// Interface for individual media entries
// const mediaTypeOptions = [...];

interface ProjectFormProps {
  initialData?: Project | null; // Use imported Project type
  onSubmit: (projectData: ProjectFormData) => Promise<void>; // Use imported ProjectFormData type
  isLoading: boolean; 
  onCancel?: () => void; 
}

const ProjectForm: React.FC<ProjectFormProps> = ({ 
  initialData = null, 
  onSubmit, 
  isLoading, 
  onCancel 
}) => {
  const [formData, setFormData] = useState<Omit<ProjectFormData, 'media_urls' | 'project_tags' | 'project_links'> & { project_tags: string[]; project_links: string[] }>({
    title: '',
    description: '',
    project_links: [], // Initialize as array
    writeup: '',
    project_tags: []
  });
  // State specifically for media URLs
  const [mediaEntries, setMediaEntries] = useState<MediaEntry[]>([]); 
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        project_links: parseCommaSeparatedString(initialData.project_links), // Use imported helper
        writeup: initialData.writeup || '',
        project_tags: parseCommaSeparatedString(initialData.project_tags) // Use imported helper
      });
      // Parse and populate media entries
      try {
        const parsedMedia = initialData.media_urls ? JSON.parse(initialData.media_urls) : [];
        // Basic validation of parsed structure
        if (Array.isArray(parsedMedia) && parsedMedia.every(item => typeof item === 'object' && item !== null && 'type' in item && 'url' in item)) {
          setMediaEntries(parsedMedia as MediaEntry[]);
        } else {
          console.warn('Invalid media_urls format in initialData, defaulting to empty.');
          setMediaEntries([]);
        }
      } catch (e) {
        console.error("Error parsing initial media_urls:", e);
        setMediaEntries([]); // Default to empty on error
      }
    } else {
      // Reset everything for create mode
      setFormData({ title: '', description: '', project_links: [], writeup: '', project_tags: [] });
      setMediaEntries([]);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Ensure complex fields are not handled here
    if (name !== 'project_tags' && name !== 'project_links') {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Specific handler for tags
  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({ ...prev, project_tags: tags }));
  };

  // Specific handler for links
  const handleLinksChange = (links: string[]) => {
    setFormData(prev => ({ ...prev, project_links: links }));
  };

  // --- Media Entry Handlers ---
  const handleMediaChange = (index: number, field: keyof MediaEntry, value: string) => {
    const updatedEntries = [...mediaEntries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setMediaEntries(updatedEntries);
  };

  const addMediaEntry = () => {
    setMediaEntries([...mediaEntries, { type: '', url: '' }]);
  };

  const removeMediaEntry = (index: number) => {
    setMediaEntries(mediaEntries.filter((_, i) => i !== index));
  };
  // --- End Media Entry Handlers ---

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate media entries before submit (e.g., ensure type is selected and URL is present)
    const invalidMedia = mediaEntries.find(entry => !entry.type || !entry.url.trim());
    if (invalidMedia) {
        setError('Please ensure all media entries have a type selected and a non-empty URL.');
        return;
    }

    // Convert arrays back to strings for submission
    const projectDataForSubmit: ProjectFormData = {
      ...formData,
      project_tags: formData.project_tags.join(', '),
      project_links: formData.project_links.join(', '), // Join links
      media_urls: JSON.stringify(mediaEntries)
    };

    try {
      await onSubmit(projectDataForSubmit); 
      if (!initialData) {
        setFormData({ title: '', description: '', project_links: [], writeup: '', project_tags: [] });
        setMediaEntries([]); // Clear media entries too
      }
    } catch (submitError: any) {
      console.error("Form submission error:", submitError);
      setError(submitError.response?.data?.message || submitError.message || 'Failed to save project');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-semibold mb-4">{initialData ? 'Edit Project' : 'Create New Project'}</h3>
      
      <FormField label="Title:" htmlFor="title">
        <Input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </FormField>

      <FormField label="Description:" htmlFor="description">
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </FormField>

      {/* --- Media URLs Section --- */}
      <FormField label="Media Entries:" htmlFor={undefined as any}>
        <MediaEntriesInput
          entries={mediaEntries}
          onChange={handleMediaChange}
          onAdd={addMediaEntry}
          onRemove={removeMediaEntry}
          disabled={isLoading}
        />
      </FormField>
      {/* --- End Media URLs Section --- */}

      {/* Use LinkListInput for project_links */}
      <FormField label="Project Links:" htmlFor="project_links"> 
        <LinkListInput
          id="project_links"
          value={formData.project_links}
          onChange={handleLinksChange} // Use specific handler
          disabled={isLoading}
          placeholder="https://github.com/user/repo"
        />
        <small className="text-gray-500 text-sm mt-1 block">Add relevant project links (e.g., GitHub, live demo).</small>
      </FormField>

      <FormField label="Write-up/Details (Markdown):" htmlFor="writeup">
        <Textarea
          id="writeup"
          name="writeup"
          value={formData.writeup}
          onChange={handleChange}
          disabled={isLoading}
        />
      </FormField>

      {/* Use TagInput for project_tags */}
      <FormField label="Tags:" htmlFor="project_tags"> 
        <TagInput
          id="project_tags"
          value={formData.project_tags} 
          onChange={handleTagsChange} // Use specific handler
          disabled={isLoading}
          placeholder="Add tags (e.g., React, Node.js)..."
        />
        <small className="text-gray-500 text-sm mt-1 block">Press Enter or Comma to add a tag. Backspace removes the last tag.</small>
      </FormField>

      {error && <ErrorDisplay error={error} />}

      <div className="flex items-center space-x-2 pt-4">
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loading size="small" className="mr-2 inline-block" /> 
              Saving...
            </>
          ) : (
            initialData ? 'Update Project' : 'Create Project'
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default ProjectForm; 