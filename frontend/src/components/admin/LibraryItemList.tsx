import React, { useState, useEffect } from 'react';
import { Button, Card } from '../common';
import { Loading, ErrorDisplay, EmptyState } from '../ui';
import api from '@/services/api';
import { useNavigate } from 'react-router-dom';

interface LibraryItemType {
  id: number;
  name: string;
}

interface LibraryItem {
  id: number;
  item_type_id: number;
  link: string;
  title: string;
  blurb?: string | null;
  thumbnail_url?: string | null;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  type_name?: string;
}

const LibraryItemList: React.FC = () => {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<LibraryItem[]>('/admin/library-items');
      setItems(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch library items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this library item?')) return;
    setIsLoading(true);
    try {
      await api.delete(`/admin/library-items/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete library item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Library Items</h2>
        <Button variant="primary" onClick={() => navigate('new')}>
          Create Item
        </Button>
      </div>
      {isLoading && <Loading className="mt-4" />}
      {error && <ErrorDisplay error={error} className="mt-4" />}
      {!isLoading && !error && items.length === 0 && (
        <EmptyState message="No library items yet." className="mt-4" />
      )}
      {!isLoading && !error && items.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="hidden md:grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-2 font-medium text-gray-600 border-b">
            <span>ID</span>
            <span>Title</span>
            <span>Type</span>
            <span>Updated</span>
            <span>Actions</span>
          </div>
          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_auto_auto] gap-3 md:gap-4 px-4 py-3 border rounded-md hover:bg-gray-50 items-center"
            >
              <span>{item.id}</span>
              <span className="font-medium">{item.title}</span>
              <span className="text-sm text-gray-500">{item.type_name || item.item_type_id}</span>
              <span className="text-xs text-gray-500">
                {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '-'}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`${item.id}/edit`)}
                  disabled={isLoading}
                >
                  Edit
                </Button>
                <Button
                  variant="text"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  disabled={isLoading}
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default LibraryItemList;