import React, { useState, useEffect } from 'react';
import { Button } from '../common';
import { ErrorDisplay, Loading } from '../ui';
import { FormField, FormInput, Textarea, TagInput } from '../forms';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';

interface LibraryItemType {
  id: number;
  name: string;
}

interface LibraryItem {
  id: number;
  item_type_id: number;
  link: string;
  title: string;
  blurb: string | null;
  thumbnail_url: string | null;
  tags: string[] | null;
  creators: string[] | null; // NEW
}

const LibraryItemForm: React.FC<{ mode: 'create' | 'edit' }> = ({ mode }) => {
  const { libraryItemId } = useParams<{ libraryItemId: string }>();
  const navigate = useNavigate();

  const [itemTypes, setItemTypes] = useState<LibraryItemType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  // Form data
  const [formData, setFormData] = useState<Omit<LibraryItem, 'id'>>({
    item_type_id: 0,
    link: '',
    title: '',
    blurb: '',
    thumbnail_url: '',
    tags: [],
    creators: [], // Initialize
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch item types
  const fetchItemTypes = async () => {
    setLoadingTypes(true);
    try {
      const res = await api.get<LibraryItemType[]>('/admin/library-item-types');
      setItemTypes(res.data);
    } catch (err: any) {
      // ignoring error here
    } finally {
      setLoadingTypes(false);
    }
  };

  // If editing, fetch existing item
  const fetchItem = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<LibraryItem>(`/admin/library-items/${id}`);
      setFormData({
        item_type_id: res.data.item_type_id,
        link: res.data.link,
        title: res.data.title,
        blurb: res.data.blurb || '',
        thumbnail_url: res.data.thumbnail_url || '',
        tags: res.data.tags || [],
        creators: res.data.creators || [],
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch library item');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItemTypes();
    if (mode === 'edit' && libraryItemId) {
      fetchItem(parseInt(libraryItemId, 10));
    }
  }, [mode, libraryItemId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTagsChange = (newTags: string[]) => {
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  const handleCreatorsChange = (newCreators: string[]) => {
    setFormData(prev => ({ ...prev, creators: newCreators }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'create') {
        await api.post('/admin/library-items', {
          ...formData,
          tags: formData.tags || [],
          creators: formData.creators || [],
        });
      } else {
        await api.put(`/admin/library-items/${libraryItemId}`, {
          ...formData,
          tags: formData.tags || [],
          creators: formData.creators || [],
        });
      }
      navigate('/admin/library-items');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save library item');
      setIsLoading(false);
    }
  };

  const handleCreateType = async () => {
    const name = prompt('Enter new library item type name:');
    if (!name) return;
    try {
      const res = await api.post('/admin/library-item-types', { name });
      setItemTypes(prev => [...prev, res.data]);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to create type');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md mt-4 bg-white">
      <h2 className="text-lg font-semibold mb-2">
        {mode === 'create' ? 'Create Library Item' : 'Edit Library Item'}
      </h2>

      <div className="flex items-center gap-2">
        <FormField label="Item Type:" htmlFor="item_type_id" className="flex-1">
          {loadingTypes ? (
            <p className="text-sm text-gray-500">Loading types...</p>
          ) : (
            <select
              id="item_type_id"
              name="item_type_id"
              value={formData.item_type_id || 0}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  item_type_id: parseInt(e.target.value, 10),
                }));
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
              required
            >
              <option value="0" disabled>Select a type</option>
              {itemTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <Button type="button" variant="secondary" onClick={handleCreateType}>
          + Type
        </Button>
      </div>

      <FormField label="Link:" htmlFor="link">
        <FormInput
          id="link"
          name="link"
          value={formData.link}
          onChange={handleChange}
          required
        />
      </FormField>

      <FormField label="Title:" htmlFor="title">
        <FormInput
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </FormField>

      <FormField label="Blurb (optional):" htmlFor="blurb">
        <Textarea
          id="blurb"
          name="blurb"
          value={formData.blurb || ''}
          onChange={handleChange}
        />
      </FormField>

      <FormField label="Thumbnail URL (optional):" htmlFor="thumbnail_url">
        <FormInput
          id="thumbnail_url"
          name="thumbnail_url"
          value={formData.thumbnail_url || ''}
          onChange={handleChange}
        />
      </FormField>

      <FormField label="Tags:" htmlFor="tags">
        <TagInput
          id="tags"
          value={formData.tags || []}
          onChange={handleTagsChange}
          placeholder="Add tags..."
        />
      </FormField>

      {/* NEW creators field */}
      <FormField label="Creators:" htmlFor="creators">
        <TagInput
          id="creators"
          value={formData.creators || []}
          onChange={handleCreatorsChange}
          placeholder="Add creators..."
        />
      </FormField>

      {error && <ErrorDisplay error={error} />}

      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loading size="small" className="mr-2" /> Saving...
            </>
          ) : (
            mode === 'create' ? 'Create' : 'Update'
          )}
        </Button>
        <Button
          variant="secondary"
          type="button"
          onClick={() => navigate('/admin/library-items')}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default LibraryItemForm;