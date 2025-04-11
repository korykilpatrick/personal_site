import React from 'react';
import useApi from '../hooks/useApi';
import apiService from '../api/apiService';
// Import shared types
import { WorkEntry, WorkEntryLink } from '../../types';

const WorkPage: React.FC = () => {
  // Fetch work experience - Pass empty array [] as the second argument for autoFetchParams
  const { data: workEntries, loading, error } = useApi<WorkEntry[]>(
    apiService.getWorkEntries, // fetchFn
    [] // autoFetchParams (no params needed for this call)
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {!workEntries || workEntries.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-xl text-gray-600">No work experience found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {workEntries.map((workEntry) => (
            <div
              key={workEntry.id}
              className="bg-white p-2 rounded-lg shadow-md border-l-4 border-primary"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-primary">{workEntry.role}</h2>
                  <h3 className="text-lg font-semibold text-textPrimary mb-1">{workEntry.company}</h3>
                </div>
                <div className="text-textSecondary font-medium mt-1 md:mt-0">{workEntry.duration}</div>
              </div>

              <p className="text-textSecondary mb-4 whitespace-pre-line">{workEntry.achievements}</p>

              {workEntry.links && workEntry.links.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {workEntry.links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:underline"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      {link.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkPage;
