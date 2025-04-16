import React, { useState, useEffect, FormEvent } from 'react';
import { WorkEntry, WorkEntryFormData } from '../../types/work';
import { Button } from '../common'; // Corrected import path
import { ErrorDisplay } from '../ui'; // Corrected import path
import { Input, Textarea, FormField } from '../forms'; // Import new form components and FormField

interface WorkFormProps {
  initialData?: WorkEntry | null;
  onSubmit: (workData: WorkEntryFormData) => Promise<void>;
  isLoading: boolean;
  onCancel?: () => void;
}

const WorkForm: React.FC<WorkFormProps> = ({
  initialData = null,
  onSubmit,
  isLoading,
  onCancel
}) => {
  const [formData, setFormData] = useState<WorkEntryFormData>({
    company: '',
    role: '',
    duration: '',
    achievements: '',
    work_entry_links: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        company: initialData.company || '',
        role: initialData.role || '',
        duration: initialData.duration || '',
        achievements: initialData.achievements || '',
        work_entry_links: initialData.work_entry_links || ''
      });
    } else {
        // Clear form when initialData is null (e.g., switching from edit to create)
        setFormData({ company: '', role: '', duration: '', achievements: '', work_entry_links: '' });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(formData);
      if (!initialData) { // Clear form on create success only
        setFormData({ company: '', role: '', duration: '', achievements: '', work_entry_links: '' });
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
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </FormField>

      <FormField label="Role:" htmlFor="role">
        <Input
          type="text"
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
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
          onChange={handleChange}
          required
          disabled={isLoading}
          placeholder="e.g., Jan 2020 - Present"
        />
      </FormField>

      <FormField label="Achievements (Markdown supported):" htmlFor="achievements">
        <Textarea
          id="achievements"
          name="achievements"
          value={formData.achievements}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </FormField>

      <FormField label="Links:" htmlFor="work_entry_links">
        <Input
          type="text"
          id="work_entry_links"
          name="work_entry_links"
          value={formData.work_entry_links}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="e.g., https://company.com, https://relevant-project.com"
        />
        <small className="text-gray-500 text-sm mt-1 block">Enter URLs separated by commas. Whitespace around commas will be ignored.</small>
      </FormField>

      {error && <ErrorDisplay error={error} />}

      {/* Action buttons section */}
      <div className="flex items-center space-x-2 pt-4">
        <Button type="submit" variant="primary" disabled={isLoading}>
          {/* Manage loading text within the button */}
          {isLoading ? 'Saving...' : (initialData ? 'Update Entry' : 'Create Entry')}
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