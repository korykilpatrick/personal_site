import React, { useState, useEffect } from 'react';
import { Quote } from 'types';
import { Button } from '../common';
import { ErrorDisplay, Loading } from '../ui';
import { FormField, FormInput, Textarea } from '../forms';

interface QuoteFormProps {
  initialData?: Quote | null;
  onSubmit: (data: Omit<Quote, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  isLoading: boolean;
  onCancel?: () => void;
}

const QuoteForm: React.FC<QuoteFormProps> = ({
  initialData = null,
  onSubmit,
  isLoading,
  onCancel
}) => {
  const [formData, setFormData] = useState<Omit<Quote, 'id' | 'created_at' | 'updated_at'>>({
    text: '',
    author: '',
    source: '',
    display_order: 0,
    is_active: false
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        text: initialData.text,
        author: initialData.author || '',
        source: initialData.source || '',
        display_order: initialData.display_order || 0,
        is_active: initialData.is_active
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name === 'is_active' && type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === 'display_order') {
      const numVal = parseInt(value, 10);
      setFormData(prev => ({ ...prev, display_order: isNaN(numVal) ? 0 : numVal }));
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
        setFormData({
          text: '',
          author: '',
          source: '',
          display_order: 0,
          is_active: false
        });
      }
    } catch (submitErr: any) {
      setError(submitErr.response?.data?.message || submitErr.message || 'Failed to save quote');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-white">
      <h3 className="text-lg font-semibold">{initialData ? 'Edit Quote' : 'Create New Quote'}</h3>

      <FormField label="Quote Text:" htmlFor="text">
        <Textarea
          id="text"
          name="text"
          value={formData.text}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
      </FormField>

      <FormField label="Author:" htmlFor="author">
        <FormInput
          id="author"
          name="author"
          type="text"
          value={formData.author}
          onChange={handleChange}
          disabled={isLoading}
        />
      </FormField>

      <FormField label="Source:" htmlFor="source">
        <FormInput
          id="source"
          name="source"
          type="text"
          value={formData.source}
          onChange={handleChange}
          disabled={isLoading}
        />
      </FormField>

      <FormField label="Display Order:" htmlFor="display_order">
        <FormInput
          id="display_order"
          name="display_order"
          type="number"
          value={String(formData.display_order)}
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
          {isLoading ? <><Loading size="small" className="mr-2" /> Saving...</> : initialData ? 'Update Quote' : 'Create Quote'}
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

export default QuoteForm;