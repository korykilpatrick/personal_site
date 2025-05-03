import React, { useState, useEffect } from 'react';
import { SiteNote } from 'types';
import { Button } from '../common';
import { ErrorDisplay, Loading } from '../ui';
import { FormField, Textarea, FormInput } from '../forms';

interface SiteNoteFormProps {
  initialData?: SiteNote | null;
  onSubmit: (data: Omit<SiteNote, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  isLoading: boolean;
  onCancel?: () => void;
}

const SiteNoteForm: React.FC<SiteNoteFormProps> = ({
  initialData = null,
  onSubmit,
  isLoading,
  onCancel
}) => {
  const [formData, setFormData] = useState<Omit<SiteNote, 'id' | 'created_at' | 'updated_at'>>({
    content: '',
    is_active: false
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        content: initialData.content,
        is_active: initialData.is_active
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name === 'is_active' && type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await onSubmit(formData);
      if (!initialData) {
        // clear form
        setFormData({ content: '', is_active: false });
      }
    } catch (submitErr: any) {
      setError(submitErr.response?.data?.message || submitErr.message || 'Failed to save site note');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-white">
      <h3 className="text-lg font-semibold">{initialData ? 'Edit Site Note' : 'Create New Site Note'}</h3>

      <FormField label="Content:" htmlFor="content">
        <Textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          disabled={isLoading}
        />
      </FormField>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_active"
          name="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          disabled={isLoading}
        />
        <label htmlFor="is_active" className="text-sm">Active?</label>
      </div>

      {error && <ErrorDisplay error={error} />}

      <div className="flex space-x-2 pt-2">
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? <><Loading size="small" className="mr-2" /> Saving...</> : initialData ? 'Update Note' : 'Create Note'}
        </Button>
        {onCancel && (
          <Button variant="secondary" type="button" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default SiteNoteForm;