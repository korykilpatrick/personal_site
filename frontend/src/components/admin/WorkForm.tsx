import React, { useState, useEffect, FormEvent } from 'react';
import { WorkEntry, WorkEntryLink } from 'types/index';
import { Button } from '../common'; // Corrected import path
import { ErrorDisplay, Loading } from '../ui'; // Corrected import path
import { Input, Textarea, FormField } from '../forms'; // Import new form components and FormField
import StructuredLinkInput from '../forms/StructuredLinkInput';

interface WorkFormProps {
  initialData?: WorkEntry | null;
  onSubmit: (workData: Omit<WorkEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  isLoading: boolean;
  onCancel?: () => void;
}

const WorkForm: React.FC<WorkFormProps> = ({
  initialData = null,
  onSubmit,
  isLoading,
  onCancel
}) => {
  const [formData, setFormData] = useState<Omit<WorkEntry, 'id' | 'created_at' | 'updated_at'>>({
    company: '',
    role: '',
    duration: '',
    achievements: '', // Reverted to initialize as empty string
    links: []
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      // Set form data directly, achievements is now a string
      setFormData({
        company: initialData.company || '',
        role: initialData.role || '',
        duration: initialData.duration || '',
        achievements: initialData.achievements || '', // Assign string directly
        links: Array.isArray(initialData.links) ? initialData.links : [] 
      });
    } else {
        // Clear form
        setFormData({ company: '', role: '', duration: '', achievements: '', links: [] });
    }
  }, [initialData]);

  // Unified change handler for simple inputs and textarea
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Handle all fields except links directly
    if (name !== 'links') { 
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handler for structured links
  const handleLinksChange = (updatedLinks: WorkEntryLink[]) => {
    setFormData(prev => ({ ...prev, links: updatedLinks }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      // Submit formData directly, no need to process achievements separately
      await onSubmit(formData); 
      
      if (!initialData) { // Clear form on create success only
        setFormData({ company: '', role: '', duration: '', achievements: '', links: [] });
      }
    } catch (submitError: any) {
      console.error("Work form submission error:", submitError);
      setError(submitError.response?.data?.message || submitError.message || 'Failed to save work entry');
    }
  };

  return (
    // Use a form wrapper with spacing
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-sm bg-white"> 
      <h3 className="text-lg font-semibold mb-4">{initialData ? 'Edit Work Entry' : 'Create New Work Entry'}</h3>

      <FormField label="Company:" htmlFor="company">
        <Input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange} // Use unified handler
          disabled={isLoading}
        />
      </FormField>

      <FormField label="Role:" htmlFor="role">
        <Input
          type="text"
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange} // Use unified handler
          required
          disabled={isLoading}
        />
      </FormField>

      <FormField label="Duration:" htmlFor="duration">
        <Input
          type="text"
          id="duration"
          name="duration"
          value={formData.duration}
          onChange={handleChange} // Use unified handler
          required
          disabled={isLoading}
          placeholder="e.g., Jan 2020 - Present"
        />
      </FormField>

      <FormField label="Achievements (Markdown supported):" htmlFor="achievements">
        <Textarea
          id="achievements"
          name="achievements"
          value={formData.achievements} // Bind directly to formData.achievements (string)
          onChange={handleChange} // Use unified handler
          required
          disabled={isLoading}
          rows={6}
        />
      </FormField>

      <FormField label="Links:" htmlFor="links">
        <StructuredLinkInput 
          id="links" 
          value={formData.links || []}
          onChange={handleLinksChange}
          disabled={isLoading} 
        />
        <small className="text-gray-500 text-sm mt-1 block">Add relevant links (e.g., company website, project page).</small>
      </FormField>

      {error && <ErrorDisplay error={error} />}

      {/* Action buttons section */}
      <div className="flex items-center space-x-2 pt-4">
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loading size="small" className="mr-2 inline-block" />
              Saving...
            </>
          ) : (
            initialData ? 'Update Entry' : 'Create Entry'
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

export default WorkForm; 