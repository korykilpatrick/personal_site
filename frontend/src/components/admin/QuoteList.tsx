import React from 'react';
import { Quote } from 'types';
import { Button, Card } from '../common';
import { Loading, ErrorDisplay, EmptyState } from '../ui';
import { useNavigate } from 'react-router-dom';
import { useAdminList } from '../../hooks';

const QuoteList: React.FC = () => {
  const navigate = useNavigate();
  const { items: quotes, isLoading, error, handleDelete } = useAdminList<Quote>({
    endpoint: '/admin/quotes',
    entityName: 'quote'
  });

  const renderContent = () => {
    if (isLoading) return <Loading className="mt-4" />;
    if (error) return <ErrorDisplay error={error} className="mt-4" />;
    if (quotes.length === 0) return <EmptyState message="No quotes found" className="mt-4" />;

    return (
      <div className="mt-4 space-y-3">
        <div className="hidden md:grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-2 font-medium text-gray-600 border-b">
          <span>ID</span>
          <span>Text</span>
          <span>Author</span>
          <span>Active?</span>
          <span>Actions</span>
        </div>

        {quotes.map(quote => (
          <div
            key={quote.id}
            className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_auto_auto] gap-3 md:gap-4 px-4 py-3 border rounded-md hover:bg-gray-50 items-center"
          >
            <span>{quote.id}</span>
            <div className="truncate text-sm text-gray-700">{quote.text.slice(0,60)}...</div>
            <span className="text-sm text-gray-600">{quote.author || '-'}</span>
            <span className="text-center">{quote.is_active ? 'Yes' : 'No'}</span>
            <div className="flex space-x-2 justify-end">
              <Button size="sm" variant="outline" onClick={() => navigate(`${quote.id}/edit`)} disabled={isLoading}>Edit</Button>
              <Button size="sm" variant="text" onClick={() => handleDelete(quote.id)} disabled={isLoading} className="text-red-600 hover:bg-red-50">Delete</Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Quotes</h2>
        <Button variant="primary" onClick={() => navigate('new')}>
          Create Quote
        </Button>
      </div>
      {renderContent()}
    </Card>
  );
};

export default QuoteList;