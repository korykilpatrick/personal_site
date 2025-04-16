import React, { useState, useEffect, FormEvent } from 'react';
import { WorkEntry, WorkEntryFormData } from '../../types/work';

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
      if (!initialData) { // Clear form on create success
        setFormData({ company: '', role: '', duration: '', achievements: '', work_entry_links: '' });
      }
    } catch (submitError: any) {
      console.error("Work form submission error:", submitError);
      setError(submitError.response?.data?.message || submitError.message || 'Failed to save work entry');
    }
  };

  // Reusing basic inline styles from ProjectForm for consistency
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px' };
  const textAreaStyle: React.CSSProperties = { ...inputStyle, minHeight: '100px' };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{initialData ? 'Edit Work Entry' : 'Create New Work Entry'}</h3>
      
      <div>
        <label htmlFor="company" style={labelStyle}>Company:</label>
        <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} required disabled={isLoading} style={inputStyle} />
      </div>

      <div>
        <label htmlFor="role" style={labelStyle}>Role:</label>
        <input type="text" id="role" name="role" value={formData.role} onChange={handleChange} required disabled={isLoading} style={inputStyle} />
      </div>

      <div>
        <label htmlFor="duration" style={labelStyle}>Duration:</label>
        <input type="text" id="duration" name="duration" value={formData.duration} onChange={handleChange} required disabled={isLoading} style={inputStyle} placeholder="e.g., Jan 2020 - Present"/>
      </div>

      <div>
        <label htmlFor="achievements" style={labelStyle}>Achievements (Markdown supported):</label>
        <textarea id="achievements" name="achievements" value={formData.achievements} onChange={handleChange} required disabled={isLoading} style={textAreaStyle} />
      </div>

      <div>
        <label htmlFor="work_entry_links" style={labelStyle}>Links:</label>
        <input 
          type="text" 
          id="work_entry_links" 
          name="work_entry_links" 
          value={formData.work_entry_links}
          onChange={handleChange} 
          disabled={isLoading} 
          style={inputStyle} 
          placeholder="e.g., https://company.com, https://relevant-project.com"
        />
        <small>Enter URLs separated by commas. Whitespace around commas will be ignored.</small>
      </div>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <div style={{ marginTop: '20px' }}>
        <button type="submit" disabled={isLoading} style={{ padding: '10px 15px', marginRight: '10px' }}>
          {isLoading ? 'Saving...' : (initialData ? 'Update Entry' : 'Create Entry')}
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

export default WorkForm; 