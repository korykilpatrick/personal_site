import React, { useState, useEffect } from 'react';
import { Button } from '../common';
import { ErrorDisplay, Loading } from '../ui';
import { FormField, FormInput, Textarea, TagInput, SmartLinkInput, AutoFilledIndicator } from '../forms';
import { useNavigate, useParams } from 'react-router-dom';
import adminApi from '@/api/adminApi';
import type { ExtractedContent } from 'types/index';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage, logError } from '@/utils/errorUtils';

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
  const { showToast } = useToast();

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
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());

  // Fetch item types
  const fetchItemTypes = async () => {
    setLoadingTypes(true);
    try {
      const types = await adminApi.getList<LibraryItemType>('/admin/library-item-types');
      setItemTypes(types);
    } catch (err: unknown) {
      // Log error but don't block the form - types are optional
      logError('fetching library item types', err);
    } finally {
      setLoadingTypes(false);
    }
  };

  // If editing, fetch existing item
  const fetchItem = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApi.getById<LibraryItem>('/admin/library-items', id);
      setFormData({
        item_type_id: res.item_type_id,
        link: res.link,
        title: res.title,
        blurb: res.blurb || '',
        thumbnail_url: res.thumbnail_url || '',
        tags: res.tags || [],
        creators: res.creators || [],
      });
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, 'Failed to fetch library item');
      setError(errorMsg);
      logError('fetching library item', err);
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
    // Remove auto-filled indicator when user manually edits
    setAutoFilledFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(name);
      return newSet;
    });
  };

  const handleTagsChange = (newTags: string[]) => {
    setFormData(prev => ({ ...prev, tags: newTags }));
    // Remove auto-filled indicator when user manually edits
    setAutoFilledFields(prev => {
      const newSet = new Set(prev);
      newSet.delete('tags');
      return newSet;
    });
  };

  const handleCreatorsChange = (newCreators: string[]) => {
    setFormData(prev => ({ ...prev, creators: newCreators }));
    // Remove auto-filled indicator when user manually edits
    setAutoFilledFields(prev => {
      const newSet = new Set(prev);
      newSet.delete('creators');
      return newSet;
    });
  };

  const handleExtractedData = (extractedData: ExtractedContent) => {
    const newAutoFilledFields = new Set<string>();
    
    // Auto-populate form fields with extracted data
    const updates: Partial<typeof formData> = {};
    
    if (extractedData.title) {
      updates.title = extractedData.title;
      newAutoFilledFields.add('title');
    }
    
    if (extractedData.description) {
      updates.blurb = extractedData.description;
      newAutoFilledFields.add('blurb');
    }
    
    if (extractedData.imageUrl) {
      updates.thumbnail_url = extractedData.imageUrl;
      newAutoFilledFields.add('thumbnail_url');
    }
    
    if (extractedData.tags && extractedData.tags.length > 0) {
      updates.tags = extractedData.tags;
      newAutoFilledFields.add('tags');
    }
    
    if (extractedData.author) {
      updates.creators = [extractedData.author];
      newAutoFilledFields.add('creators');
    }
    
    setFormData(prev => ({ ...prev, ...updates }));
    setAutoFilledFields(newAutoFilledFields);
    
    // Try to match content type to library item type
    if (extractedData.contentType && itemTypes.length > 0) {
      const matchingType = itemTypes.find(type => 
        type.name.toLowerCase() === extractedData.contentType?.toLowerCase()
      );
      if (matchingType) {
        setFormData(prev => ({ ...prev, item_type_id: matchingType.id }));
        newAutoFilledFields.add('item_type_id');
      }
    }
    
    // Show success toast
    showToast('Metadata extracted successfully!', 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'create') {
        await adminApi.create('/admin/library-items', {
          ...formData,
          tags: formData.tags || [],
          creators: formData.creators || [],
        });
      } else {
        await adminApi.update('/admin/library-items', libraryItemId!, {
          ...formData,
          tags: formData.tags || [],
          creators: formData.creators || [],
        });
      }
      navigate('/admin/library-items');
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, 'Failed to save library item');
      setError(errorMsg);
      logError('saving library item', err);
      setIsLoading(false);
    }
  };

  const handleCreateType = async () => {
    const name = prompt('Enter new library item type name:');
    if (!name) return;
    try {
      const createdType = await adminApi.create<{ name: string }, LibraryItemType>(
        '/admin/library-item-types',
        { name }
      );
      setItemTypes(prev => [...prev, createdType]);
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, 'Failed to create type');
      alert(errorMsg);
      logError('creating library item type', err);
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
        <Button type="button" variant="outline" onClick={handleCreateType}>
          + Type
        </Button>
      </div>

      <FormField label="Link:" htmlFor="link">
        <SmartLinkInput
          id="link"
          name="link"
          value={formData.link}
          onChange={handleChange}
          onExtractedData={handleExtractedData}
          onExtractionError={() => {
            showToast('Failed to extract metadata. Please fill in the details manually.', 'error');
          }}
          required
          disabled={mode === 'edit'} // Disable extraction when editing
        />
      </FormField>

      <FormField 
        label={
          <>
            Title:
            <AutoFilledIndicator isAutoFilled={autoFilledFields.has('title')} />
          </>
        } 
        htmlFor="title"
      >
        <FormInput
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </FormField>

      <FormField 
        label={
          <>
            Blurb (optional):
            <AutoFilledIndicator isAutoFilled={autoFilledFields.has('blurb')} />
          </>
        } 
        htmlFor="blurb"
      >
        <Textarea
          id="blurb"
          name="blurb"
          value={formData.blurb || ''}
          onChange={handleChange}
        />
      </FormField>

      <FormField 
        label={
          <>
            Thumbnail URL (optional):
            <AutoFilledIndicator isAutoFilled={autoFilledFields.has('thumbnail_url')} />
          </>
        } 
        htmlFor="thumbnail_url"
      >
        <FormInput
          id="thumbnail_url"
          name="thumbnail_url"
          value={formData.thumbnail_url || ''}
          onChange={handleChange}
        />
      </FormField>

      <FormField 
        label={
          <>
            Tags:
            <AutoFilledIndicator isAutoFilled={autoFilledFields.has('tags')} />
          </>
        } 
        htmlFor="tags"
      >
        <TagInput
          id="tags"
          value={formData.tags || []}
          onChange={handleTagsChange}
          placeholder="Add tags..."
        />
      </FormField>

      {/* NEW creators field */}
      <FormField 
        label={
          <>
            Creators:
            <AutoFilledIndicator isAutoFilled={autoFilledFields.has('creators')} />
          </>
        } 
        htmlFor="creators"
      >
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
          variant="outline"
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
