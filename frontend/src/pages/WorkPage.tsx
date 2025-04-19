import React, { useState, useEffect } from 'react';
import useApi from '../hooks/useApi';
import apiService from '../api/apiService';
// Import shared types
import { WorkEntry, WorkEntryLink } from 'types/index';
// Import standard UI components
import { Loading, ErrorDisplay, EmptyState } from '../components/ui';
// Import the new WorkCard component
import WorkCard from '@/components/work/WorkCard';

const WorkPage: React.FC = () => {
  // Fetch work experience - Pass empty array [] as the second argument for autoFetchParams
  const { data: workEntries, loading, error } = useApi<WorkEntry[]>(
    apiService.getWorkEntries, // fetchFn
    [] // autoFetchParams (no params needed for this call)
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        {/* Use standard Loading component */}
        <Loading className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        {/* Use standard ErrorDisplay component */}
        <ErrorDisplay error={error} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {!workEntries || workEntries.length === 0 ? (
        // Use standard EmptyState component
        <EmptyState message="No work experience found" />
      ) : (
        <div className="space-y-4"> {/* Adjusted spacing */}
          {workEntries.map((workEntry) => (
            // Use WorkCard component
            <WorkCard key={workEntry.id} work={workEntry} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkPage;
