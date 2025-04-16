import React, { useState, useEffect, FormEvent } from 'react';
import { Project, ProjectFormData } from '../../types/project'; // Import shared types

// REMOVE local Project interface definition
// interface Project { ... }

// Interface for individual media entries
interface MediaEntry {
  type: 'image' | 'video' | ''; // Allow empty for new entries
  url: string;
}

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
  const [formData, setFormData] = useState<Omit<ProjectFormData, 'media_urls'>>({
    // State now excludes media_urls, handled separately
    title: '',
    description: '',
    project_links: '',
    writeup: '',
    project_tags: ''
  });
  // State specifically for media URLs
  const [mediaEntries, setMediaEntries] = useState<MediaEntry[]>([]); 
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      // Populate regular form fields
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        project_links: initialData.project_links || '',
        writeup: initialData.writeup || '',
        project_tags: initialData.project_tags || ''
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
      setFormData({ title: '', description: '', project_links: '', writeup: '', project_tags: '' });
      setMediaEntries([]);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

    // Combine form data and stringified media entries
    const fullProjectData: ProjectFormData = {
      ...formData,
      media_urls: JSON.stringify(mediaEntries)
    };

    try {
      await onSubmit(fullProjectData); 
      if (!initialData) {
        setFormData({ title: '', description: '', project_links: '', writeup: '', project_tags: '' });
        setMediaEntries([]); // Clear media entries too
      }
    } catch (submitError: any) {
      console.error("Form submission error:", submitError);
      setError(submitError.response?.data?.message || submitError.message || 'Failed to save project');
    }
  };

  // Basic form styling (inline for simplicity)
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px' };
  const textAreaStyle: React.CSSProperties = { ...inputStyle, minHeight: '100px' };
  const inlineInputStyle: React.CSSProperties = { padding: '8px', marginRight: '10px', border: '1px solid #ccc', borderRadius: '4px' };
  const mediaEntryStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', marginBottom: '10px', padding: '10px', border: '1px solid #eee', borderRadius: '4px' };
  const removeButtonStyle: React.CSSProperties = { marginLeft: 'auto', padding: '5px 10px', cursor: 'pointer' };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{initialData ? 'Edit Project' : 'Create New Project'}</h3>
      
      <div>
        <label htmlFor="title" style={labelStyle}>Title:</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          disabled={isLoading}
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="description" style={labelStyle}>Description:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          disabled={isLoading}
          style={textAreaStyle}
        />
      </div>

      {/* --- Media URLs Section --- */}
      <div>
        <label style={labelStyle}>Media Entries:</label>
        {mediaEntries.map((entry, index) => (
          <div key={index} style={mediaEntryStyle}>
            <select 
              name={`media_type_${index}`}
              value={entry.type}
              onChange={(e) => handleMediaChange(index, 'type', e.target.value)}
              required 
              disabled={isLoading}
              style={inlineInputStyle}
            >
              <option value="" disabled>Select type...</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            <input
              type="text"
              name={`media_url_${index}`}
              placeholder="Media URL (e.g., /images/proj.jpg or https://...)"
              value={entry.url}
              onChange={(e) => handleMediaChange(index, 'url', e.target.value)}
              required
              disabled={isLoading}
              style={{ ...inlineInputStyle, flexGrow: 1 }} // Take remaining space
            />
            <button 
              type="button" 
              onClick={() => removeMediaEntry(index)} 
              disabled={isLoading}
              style={removeButtonStyle}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addMediaEntry} disabled={isLoading} style={{ padding: '8px 12px' }}>
          Add Media Entry
        </button>
      </div>
      {/* --- End Media URLs Section --- */}

      <div>
        <label htmlFor="project_links" style={labelStyle}>Project Links:</label>
        <input
          type="text"
          id="project_links"
          name="project_links"
          value={formData.project_links}
          onChange={handleChange}
          disabled={isLoading}
          style={inputStyle}
          placeholder="e.g., https://github.com/user/repo, https://live-demo.com"
        />
        <small>Enter URLs separated by commas. Whitespace around commas will be ignored.</small>
      </div>

      <div>
        <label htmlFor="writeup" style={labelStyle}>Write-up/Details:</label>
        <textarea
          id="writeup"
          name="writeup"
          value={formData.writeup}
          onChange={handleChange}
          disabled={isLoading}
          style={textAreaStyle}
        />
      </div>

      <div>
        <label htmlFor="project_tags" style={labelStyle}>Tags:</label>
        <input
          type="text"
          id="project_tags"
          name="project_tags"
          value={formData.project_tags}
          onChange={handleChange}
          disabled={isLoading}
          style={inputStyle}
          placeholder="e.g., React, TypeScript, Node.js"
        />
        <small>Enter tags separated by commas. Whitespace around commas will be ignored.</small>
      </div>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <div style={{ marginTop: '20px' }}>
        <button type="submit" disabled={isLoading} style={{ padding: '10px 15px', marginRight: '10px' }}>
          {isLoading ? 'Saving...' : (initialData ? 'Update Project' : 'Create Project')}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isLoading} style={{ padding: '10px 15px' }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ProjectForm; 