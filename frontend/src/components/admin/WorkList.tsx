import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WorkEntry } from 'types/index'; // Correct path
import { Button, Card } from '../common';
import { Loading, ErrorDisplay, EmptyState } from '../ui';
import { useAdminList } from '../../hooks';

const WorkList: React.FC = () => {
  const navigate = useNavigate();
  const { items: workEntries, isLoading, error, handleDelete } = useAdminList<WorkEntry>({
    endpoint: '/admin/work',
    entityName: 'work entry'
  });

  const renderContent = () => {
    if (isLoading) {
      return <Loading className="mt-4" />;
    }
    if (error) {
      return <ErrorDisplay error={error} className="mt-4" />;
    }
    if (workEntries.length === 0) {
      return <EmptyState message="No work entries found. Create one!" className="mt-4" />;
    }

    return (
      <div className="mt-4 space-y-3"> {/* List container */} 
        {/* Header Row - Removed Role, updated grid columns */} 
        <div className="hidden md:grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-4 py-2 font-medium text-gray-600 border-b">
          <span>ID</span>
          <span>Role</span>
          <span>Duration</span>
          <span>Actions</span>
        </div>
        {/* Work Entry Rows - Removed Role, updated grid columns */} 
        {workEntries.map((entry) => (
          <div 
            key={entry.id} 
            className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_auto] gap-3 md:gap-4 px-4 py-3 border rounded-md hover:bg-gray-50 items-center"
          >
            <span className="text-sm font-medium text-gray-500 md:text-base md:font-normal md:text-inherit">{entry.id}</span>
            <span className="font-medium truncate">{entry.role}</span>
            <span className="text-xs text-gray-500 md:text-sm">{entry.duration}</span>
            <div className="flex space-x-2 justify-end md:justify-start"> {/* Action buttons */} 
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(`${entry.id}/edit`)} 
                disabled={isLoading}
              >
                Edit
              </Button>
              <Button 
                variant="text" 
                size="sm" 
                onClick={() => handleDelete(entry.id)} 
                disabled={isLoading}
                className="text-red-600 hover:bg-red-50"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-0"> 
        <h2 className="text-xl font-semibold">Manage Work Entries</h2>
        <Link to="new">
          <Button variant="primary">Create New Entry</Button>
        </Link>
      </div>
      {renderContent()} 
    </Card>
  );
};

export default WorkList;