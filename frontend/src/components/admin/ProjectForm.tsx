import React, { useState, useEffect, FormEvent } from 'react';
// Import main Project and ProjectLink types
import { Project, ProjectLink } from 'types/index'; 
import { Button } from '../common'; // Select might not be needed directly here
import { ErrorDisplay, Loading } from '../ui';
// Import StructuredLinkInput, remove LinkListInput
import { Input, Textarea, FormField, MediaEntriesInput, TagInput } from '../forms'; // Remove MediaEntry from here
import { MediaEntry } from 'types/index'; // <-- Import MediaEntry from root types
import StructuredLinkInput from '../forms/StructuredLinkInput';
// Remove unused helper
// import { parseCommaSeparatedString } from '../../utils/helpers'; 

// Interface for individual media entries (seems defined in MediaEntriesInput? check if needed here)

interface ProjectFormProps {
  initialData?: Project | null; 
  // Update onSubmit to expect Project type from main types
  onSubmit: (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<void>; 
  isLoading: boolean; 
  onCancel?: () => void; 
}

const ProjectForm: React.FC<ProjectFormProps> = ({ 
  initialData = null, 
  onSubmit, 
  isLoading, 
  onCancel 
}) => {
  // State for simple fields + links/tags arrays
  const [formData, setFormData] = useState<Omit<Project, 'id' | 'created_at' | 'updated_at' | 'media_urls'> & { 
    // Explicitly keep non-array fields separate if needed by validation/logic 
    // Or just rely on the Omit<Project,...> type 
   }>({ 
    title: '',
    description: '',
    links: [], // ProjectLink[]
    writeup: '',
    tags: [], // string[]
  });
  // Separate state for media entries (array of objects)
  const [mediaEntries, setMediaEntries] = useState<MediaEntry[]>([]); 
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        links: Array.isArray(initialData.links) ? initialData.links : [], 
        writeup: initialData.writeup || '',
        tags: Array.isArray(initialData.tags) ? initialData.tags : [],
      });
      // Handle media_urls separately (assuming it's string[] in Project type)
      // If backend sends structured MediaEntry[], parse differently
      const initialMedia = Array.isArray(initialData.media_urls) ? initialData.media_urls : [];
      // For now, assume we need to construct MediaEntry[] from string[] if that's what initialData has
      // This part might need adjustment based on actual initialData.media_urls structure
      // If it's already MediaEntry[], just assign: setMediaEntries(initialMedia)
      // If it's string[], we need logic to map string URLs to MediaEntry objects
      // Example: Assuming simple URLs, map them with a default type (needs refinement)
      try {
          // Attempt to parse if it's a JSON string (from older data perhaps?)
          const parsedOrArray = typeof initialData.media_urls === 'string' ? JSON.parse(initialData.media_urls) : initialMedia;
          if(Array.isArray(parsedOrArray)) {
              // Check if it's already MediaEntry[] or string[]
              if (parsedOrArray.length > 0 && typeof parsedOrArray[0] === 'object') {
                 setMediaEntries(parsedOrArray as MediaEntry[]); // Assume it's MediaEntry[]
              } else {
                 // Assume it's string[] and map
                 setMediaEntries((parsedOrArray as string[]).map(url => ({ type: 'image', url }))); // Default type
              }
          } else {
             setMediaEntries([]);
          }
      } catch (e) {
          console.error("Error processing initial media_urls:", e);
          setMediaEntries([]);
      }

    } else {
      // Reset form and media entries
      setFormData({ title: '', description: '', links: [], writeup: '', tags: [] });
      setMediaEntries([]);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Handle only non-array fields
    if (name !== 'tags' && name !== 'links' && name !== 'media_urls') { 
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Specific handler for tags
  const handleTagsChange = (updatedTags: string[]) => {
    setFormData(prev => ({ ...prev, tags: updatedTags }));
  };

  // Specific handler for links
  const handleLinksChange = (updatedLinks: ProjectLink[]) => { 
    setFormData(prev => ({ ...prev, links: updatedLinks }));
  };

  // --- Media Entry Handlers (using separate state) ---
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

    // Validate media entries 
    const invalidMedia = mediaEntries.find(entry => !entry.type || !entry.url.trim());
    if (invalidMedia) {
        setError('Please ensure all media entries have a type selected and a non-empty URL.');
        return;
    }

    // Construct data for submission according to Project type
    const projectDataForSubmit: Omit<Project, 'id' | 'created_at' | 'updated_at'> = {
      ...formData, // Includes title, description, links[], tags[], writeup
      // Map MediaEntry[] back to string[] for submission (as expected by Project type)
      media_urls: mediaEntries.map(entry => entry.url), 
    };

    try {
      await onSubmit(projectDataForSubmit); 
      if (!initialData) {
        // Clear form state and media entries
        setFormData({ title: '', description: '', links: [], writeup: '', tags: [] });
        setMediaEntries([]); 
      }
    } catch (submitError: any) {
      console.error("Form submission error:", submitError);
      // Check if the error response has the structured validation errors
      const validationErrors = submitError.response?.data?.errors;
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        // Format the validation errors for display
        const errorMessages = validationErrors.map((err: any) => 
          `${err.param ? `${err.param}: ` : ''}${err.msg}`
        ).join('\n'); // Join with newline for better readability in ErrorDisplay
        setError(`Validation failed:\n${errorMessages}`);
      } else {
        // Fallback to general error message
        setError(submitError.response?.data?.message || submitError.message || 'Failed to save project');
      }
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
          onChange={(index: number, field: keyof MediaEntry, value: string) => handleMediaChange(index, field, value)}
          onAdd={addMediaEntry}
          onRemove={removeMediaEntry}
          disabled={isLoading}
        />
      </FormField>
      {/* --- End Media URLs Section --- */}

      {/* Use StructuredLinkInput for project_links */}
      <FormField label="Project Links:" htmlFor="links"> 
        <StructuredLinkInput
          id="links"
          value={formData.links}
          onChange={handleLinksChange}
          disabled={isLoading}
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

      {/* Use TagInput for project tags */}
      <FormField label="Tags:" htmlFor="tags"> 
        <TagInput
          id="tags"
          value={formData.tags || []}
          onChange={handleTagsChange}
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